'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';
import ProfitChart from '@/components/partials/widget/chart/profit-chart';
import useUserDetails from '@/hooks/useUserDetails';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/app/loading';
import CaptableCard from '@/components/CapTable';
import FairMarketValueCard from '@/components/FairMarketValueCard';
import ImageBlock2 from '@/components/partials/widget/block/image-block-2';
import GroupChart2 from '@/components/partials/widget/chart/group-chart-2';
import MixedChart from '@/components/partials/chart/appex-chart/Mixed';
import ActivityCard from '@/components/ActivityCard';
import { supabase } from '@/lib/supabaseclient';
import SeriesModal from '@/components/portfolio-management/seriesDocuments';
import useStartups from '@/hooks/useStartups';
import FounderInforModal from '@/components/portfolio-management/founderInformation';
import DocumentModal from '@/components/portfolio-management/startupStageDocuments';
import FinancialChart from '@/components/portfolio-management/financialsChart';
import StartupFinancials from '@/components/portfolio-management/startupFinancials';
import AddFiles from '@/components/portfolio-management/addFile';
import { FaTrashAlt, FaEye, FaUpload, FaTimes } from 'react-icons/fa';

const BankingPage = () => {
  const { profile } = useCompleteUserDetails();
  const { user, loading: userLoading } = useUserDetails();
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState([
    { title: "Company and Founder's Information", imageSrc: '/assets/images/all-img/founder.png' },
    { title: "Series wise Documents", imageSrc: '/assets/images/all-img/doccuments.png' },
    { title: "Approvals", imageSrc: '/assets/images/all-img/approval.png' },
    { title: "Information Rights", imageSrc: '/assets/images/all-img/financials.png' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [assignedStartups, setAssignedStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const { startups, loading: startupsLoading } = useStartups(user?.id);
  const [selectedStartupsData, setSelectedStartupData] = useState(null);
  const [selectedStartupsId, setSelectedStartupId] = useState(null);
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  const [isCardCreationModalOpen, setIsCardCreationModalOpen] = useState(false);
  const [newCardLogo, setNewCardLogo] = useState(null);
  const [selectedCardTitle, setSelectedCardTitle] = useState('');
  const scrollRef = useRef(null);
  const [activeCardModal, setActiveCardModal] = useState(null); // Add this line to declare the state



  const seriesWiseDocuments = [
    'termsheet',
    'ddr',
    'condition_precedent',
    'closing_docs',
    'condition_subsequent',
    'transaction_spa',
    'transaction_shd',
    'transaction_ssa',
    'transaction_mou',
    'transaction_nda',
    'transaction_safe_notes'
  ];

  const approvalsDocuments = ['abm', 'shareholder_meeting', 'board_meeting'];
  const informationRightsDocuments = ['unaudited_financials', 'audited_financials', 'mis'];


  const handleOpenModal = (cardTitle) => {
    setSelectedCardTitle(cardTitle);
    setActiveCardModal(cardTitle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setActiveCardModal(null);
    setIsModalOpen(false);
  };

  // Function to handle closing of Series Modal
  const handleCloseSeriesModal = () => {
    setIsSeriesModalOpen(false);
  };


  const fetchAssignedStartups = async () => {
    try {
      console.log('Profile ID:', profile.id);

      const { data, error } = await supabase
        .from('investor_startup_assignments')
        .select('startup_id, company_profile(company_name, profile_id)')
        .eq('investor_id', profile.id);

      if (error) {
        console.error('Error fetching assigned startups:', error.message);
      } else {
        const uniqueStartupsMap = new Map();

        data.forEach((assignment) => {
          const { startup_id, company_profile } = assignment;
          if (!uniqueStartupsMap.has(startup_id)) {
            uniqueStartupsMap.set(startup_id, {
              id: startup_id,
              company_name: company_profile.company_name,
              profile_id: company_profile.profile_id,
            });
          }
        });

        const uniqueStartups = Array.from(uniqueStartupsMap.values());
        setAssignedStartups(uniqueStartups);
        console.log('Assigned Startups:', uniqueStartups);
      }
    } catch (err) {
      console.error('Unexpected Error:', err.message);
    }
  };

  const fetchCards = async () => {
    if (!profile?.id || !selectedStartup?.id) return;
  
    try {
      const path = `${profile.id}/${selectedStartup.id}/`;
      const { data, error } = await supabase.storage
        .from('investor_startup_documents')
        .list(path, { limit: 100, offset: 0 });
  
      console.log('files: ', data);
  
      if (error) {
        console.error('Error fetching cards from storage:', error.message);
      } else {
        // Filter out directories (folders)
        const fetchedCardData = data?.filter((item) => item.id === null) || [];
  
        // Convert fetched cards to match existing card format
        const newCards = await Promise.all(
          fetchedCardData.map(async (folder) => {
            const folderPath = `${path}${folder.name}/logo/`;
  
            // Fetch logo file from the folder
            const { data: logoFiles, error: logoError } = await supabase.storage
              .from('investor_startup_documents')
              .list(folderPath, { limit: 1 });
  
            if (logoError) {
              console.error('Error fetching logo files:', logoError.message);
              return null;
            }
  
            // Determine the logo file name dynamically
            const logoFile = logoFiles && logoFiles.length > 0 ? logoFiles[0].name : null;
  
            return {
              title: folder.name,
              imageSrc: logoFile
                ? `https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/investor_startup_documents/${profile.id}/${selectedStartup.id}/${folder.name}/logo/${logoFile}`
                : '/assets/images/default-logo.png', // Fallback to a default logo if not found
            };
          })
        );
  
        // Remove any null values from the newCards array
        const validNewCards = newCards.filter((card) => card !== null);
  
        // Merge new cards with existing cards and remove duplicates
        const updatedCards = [
          ...cards,
          ...validNewCards.filter(
            (newCard) => !cards.some((existingCard) => existingCard.title === newCard.title)
          ),
        ];
        setCards(updatedCards);
        console.log('added cards: ', updatedCards);
      }
    } catch (err) {
      console.error('Unexpected Error fetching cards:', err.message);
    }
  };
  

  useEffect(() => {
    if (!userLoading && profile) {
      setIsLoading(false);
      fetchCards();
    }
    fetchAssignedStartups();
  }, [userLoading, profile, selectedStartup]);

  const handleAddCard = async () => {
    if (!newCardTitle || !newCardLogo) {
      alert('Please provide both a card title and a logo.');
      return;
    }

    const logoPath = `${profile.id}/${selectedStartup.id}/${newCardTitle}/logo/${newCardLogo.name}`;
    const { error: logoUploadError } = await supabase.storage
      .from('investor_startup_documents')
      .upload(logoPath, newCardLogo);

    if (logoUploadError) {
      console.error('Error uploading card logo:', logoUploadError.message);
      alert('Failed to upload logo.');
      return;
    }

    // Immediately fetch cards after creating a new one to display it
    fetchCards();
    setIsCardCreationModalOpen(false);
  };

  const getSelectedStartupData = (selectedId) => {
    if (!selectedId) {
      console.error("Invalid selected ID:", selectedId);
      return null;
    }

    // Ensure startupsData is defined and is an array
    if (!Array.isArray(startups) || startups.length === 0) {
      console.error("startupsData is not available or empty:", startups);
      return null;
    }

    // Log the IDs to check for hidden or unexpected characters
    startups.forEach((startup) => {
      console.log(`Checking startup ID: '${startup.id}' against selected ID: '${selectedId}'`);
    });

    // Perform the find operation
    const startupData = startups.find((startup) => startup?.id.trim() === selectedId.trim());
    if (!startupData) {
      console.error("No matching startup data found for the selected ID:", selectedId);
    }
    return startupData;
  };

  const handleStartupChange = (event) => {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue); // Debugging line

    // Ensure assignedStartups is defined and is an array
    if (!Array.isArray(assignedStartups) || assignedStartups.length === 0) {
      console.error("Assigned startups are not available or empty:", assignedStartups);
      return;
    }

    const selectedStartup = assignedStartups.find((startup) => startup.id === selectedValue);

    // Check if selectedStartup is found
    if (selectedStartup) {
      setSelectedStartup(selectedStartup);
      setCompanyName(selectedStartup.company_name || '');
      console.log('Selected Startup:', selectedStartup.id);

      // Check if selectedStartup.id is defined before calling getSelectedStartupData
      if (selectedStartup.id) {
        const selectedsSartupData = getSelectedStartupData(selectedStartup.id);

        if (selectedsSartupData) {
          setSelectedStartupData(selectedsSartupData);
          // console.log("Selected Startup Data", selectedStartupsData);
        }
      } else {
        console.error('Selected startup ID is undefined:', selectedStartup);
      }
    } else {
      console.error('No startup found for the selected value:', selectedValue);
    }
  };

  console.log("Selected Startup Data", selectedStartupsData);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center ">
        <div></div>
        <select
          className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
          value={selectedStartup?.id || ''}
          onChange={handleStartupChange}
        >
          <option value="">Select Startup</option>
          {assignedStartups.map((startup) => (
            <option key={startup.id} value={startup.id}>
              {startup.company_name}
            </option>
          ))}
        </select>
      </div>

      <main className="p-4 transition-all duration-300">
        <div className="grid grid-cols-12 gap-5 mb-5 h-full">
          <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
            <ImageBlock2 selectedStartup={selectedStartup} companyName={companyName} />
          </div>
          <div className={`2xl:col-span-9 lg:col-span-8 col-span-12 relative ${!selectedStartup ? 'filter grayscale' : ''}`}>
            <div className="grid md:grid-cols-4 grid-cols-1 gap-4 h-full blur-sm">
              <GroupChart2 />
            </div>
            {!selectedStartup && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                <span className="font-semibold">Select your portfolio startup to avail this feature</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className={`col-span-12 md:col-span-3 relative blur-sm ${!selectedStartup ? 'filter grayscale' : ''}`}>
            <CaptableCard />
            {!selectedStartup && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                <span className="font-semibold">Select your portfolio startup to avail this feature</span>
              </div>
            )}
          </div>

          <div className={`col-span-12 md:col-span-6 relative ${!selectedStartup ? 'filter grayscale opacity-75' : ''}`}>
            <StartupFinancials
            selectedStartup={selectedStartup}
            />
          </div>

          <div className={`col-span-12 md:col-span-3 relative blur-sm ${!selectedStartup ? 'filter grayscale' : ''}`}>
            <FairMarketValueCard />
            {!selectedStartup && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                <span className="font-semibold">Select your portfolio startup to avail this feature</span>
              </div>
            )}
          </div>

          <div className={`col-span-12 overflow-x-auto ${!selectedStartup ? 'filter grayscale' : ''}`}>
            <div className="flex space-x-6 w-max relative" ref={scrollRef}>
              {cards.map((card, index) => (
                <div key={index} className="relative">
                  <Card
                    className="w-64 h-64 flex flex-col items-center justify-center bg-white"
                    
                  >
                    <div className="flex justify-center mb-4">
                      <img src={card.imageSrc} alt={card.title} className="h-24 w-auto object-cover" onClick={() => handleOpenModal(card.title)}/>
                    </div>
                    <h3 className="text-lg font-semibold mb-4 text-center">{card.title}</h3>
                  </Card>
                  
                  {!selectedStartup && (
                    <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                      <span className="font-semibold">Select your portfolio startup to avail this feature</span>
                    </div>
                  )}
                </div>              
              ))}
              <button
                onClick={() => setIsCardCreationModalOpen(true)}
                className="flex justify-center items-center w-64 h-64 bg-gray-200 text-2xl font-bold text-gray-600 rounded-lg hover:bg-gray-300 transition duration-500 ease-in-out transform hover:scale-105 relative"
              >
                +
                {!selectedStartup && (
                  <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                    <span className="font-semibold">Select your portfolio startup to avail this feature</span>
                  </div>
                )}
              </button>

              <SeriesModal isOpen={isSeriesModalOpen} onClose={handleCloseSeriesModal} />
            </div>
          </div>
        </div>
      </main>

      <AddFiles 
        isOpen={isAddFilesModalOpen}
        onClose={() => setIsAddFilesModalOpen(false)}
        investorId={profile.id}
        startupId={selectedStartup?.id}
        cardTitle={selectedCardTitle}
      />

      {/* Modals for Each Card */}
      {activeCardModal === "Company and Founder's Information" && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
          {/* Modal Content for Company and Founder's Information */}
          <FounderInforModal
          selectedStartup={selectedStartupsData}
          handleCloseModal={handleCloseModal}
          />
        </div>
      )}

      {activeCardModal === "Series wise Documents" && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
          {/* Modal Content for Series wise Documents */}
          <DocumentModal
          startupId={selectedStartupsData?.id}
          allowedDocumentTypes={seriesWiseDocuments}
          isOpen={activeCardModal}
          handleCloseModal={handleCloseModal}
          />
        </div>
      )}
      {activeCardModal === "Approvals" && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
          {/* Modal Content for Series wise Documents */}
          <DocumentModal
          startupId={selectedStartupsData?.id}
          allowedDocumentTypes={approvalsDocuments}
          isOpen={activeCardModal}
          handleCloseModal={handleCloseModal}
          />
        </div>
      )}
      {activeCardModal === "Information Rights" && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
          {/* Modal Content for Series wise Documents */}
          <DocumentModal
          startupId={selectedStartupsData?.id}
          allowedDocumentTypes={informationRightsDocuments}
          isOpen={activeCardModal}
          handleCloseModal={handleCloseModal}
          />
        </div>
      )}

      {/* Generic Modal for New Cards */}
      {isModalOpen && !["Company and Founder's Information", "Series wise Documents", "Approvals", "Information Rights"].includes(activeCardModal) && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
          <AddFiles
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            investorId={profile.id}
            startupId={selectedStartup?.id}
            cardTitle={activeCardModal}
          />
        </div>
      )}

      {isCardCreationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl w-full relative">
            <button
              onClick={() => setIsCardCreationModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Create New Card</h2>
            <input
              type="text"
              placeholder="Card Name"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded mb-4"
            />
            <h3 className="text-xl font-semibold mb-4">Upload Card Logo</h3>
            <input
              type="file"
              onChange={(e) => setNewCardLogo(e.target.files[0])}
              className="border border-gray-300 p-2 w-full rounded mb-4"
            />
            <button
              onClick={handleAddCard}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Create Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankingPage;
