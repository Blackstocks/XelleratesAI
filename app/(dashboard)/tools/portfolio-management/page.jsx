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
import SeriesModal from '@/components/portfolio-management/seriesDocuments'

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
  const [selectedStartup, setSelectedStartup] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleOpenSeriesModal = () => {
    setIsSeriesModalOpen(true);
  };

  const handleCloseSeriesModal = () => {
    setIsSeriesModalOpen(false);
  };
  const scrollRef = useRef(null);

  const handleAddCard = () => {
    const newCard = { title: newCardTitle, imageSrc: '/assets/images/all-img/folder' };
    setCards([...cards, newCard]);
    scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    setNewCardTitle('');
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchAssignedStartups = async () => {
    try {
      console.log('Profile ID:', profile.id);

      const { data, error } = await supabase
        .from('investor_startup_assignments')
        .select('startup_id, company_profile(company_name)')
        .eq('investor_id', profile.id);

      if (error) {
        console.error('Error fetching assigned startups:', error.message);
      } else {
        const startups = data.map((assignment) => assignment.company_profile.company_name);
        setAssignedStartups(startups || []);
        console.log('Assigned Startups:', startups);
      }
    } catch (err) {
      console.error('Unexpected Error:', err.message);
    }
  };

  useEffect(() => {
    if (!userLoading && profile) {
      setIsLoading(false);
      fetchAssignedStartups();
    }
  }, [userLoading, profile]);

  const handleStartupChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedStartup(selectedValue);
    setCompanyName(selectedValue); // Update companyName when startup is selected
    console.log('Selected Startup:', selectedValue);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative">
      {/* Top Bar with Dropdown at the Right */}
      <div className="flex justify-between items-center ">
        <div></div> {/* Placeholder for other elements on the left side */}
        
        {/* Dropdown for selecting assigned startups */}
        <select
          className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
          value={selectedStartup}
          onChange={handleStartupChange}
        >
          <option value="">Select Startup</option>
          {assignedStartups.map((startup, index) => (
            <option key={index} value={startup}>
              {startup}
            </option>
          ))}
        </select>
      </div>

      {/* Main content */}
      <main className="p-4 transition-all duration-300">
        <div className="grid grid-cols-12 gap-5 mb-5 h-full">
          <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
            {/* Pass the companyName and selectedStartup as props */}
            <ImageBlock2 selectedStartup={selectedStartup} companyName={companyName} />
          </div>
          <div className={`2xl:col-span-9 lg:col-span-8 col-span-12 relative ${!selectedStartup ? 'filter grayscale blur-sm' : ''}`}>
            <div className="grid md:grid-cols-4 grid-cols-1 gap-4 h-full">
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
          {/* Captable Card */}
          <div className={`col-span-12 md:col-span-3 relative ${!selectedStartup ? 'filter grayscale blur-sm' : ''}`}>
            <CaptableCard />
            {!selectedStartup && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                <span className="font-semibold">Select your portfolio startup to avail this feature</span>
              </div>
            )}
          </div>

          {/* Financials Card */}
          <div className={`col-span-12 md:col-span-6 relative ${!selectedStartup ? 'filter grayscale blur-sm' : ''}`}>
            <Card title="Financials">
              <MixedChart />
            </Card>
            {!selectedStartup && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                <span className="font-semibold">Select your portfolio startup to avail this feature</span>
              </div>
            )}
          </div>

          {/* Fair Market Value Card */}
          <div className={`col-span-12 md:col-span-3 relative ${!selectedStartup ? 'filter grayscale blur-sm' : ''}`}>
            <FairMarketValueCard />
            {!selectedStartup && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-gray-900 bg-white bg-opacity-90 z-10">
                <span className="font-semibold">Select your portfolio startup to avail this feature</span>
              </div>
            )}
          </div>

          {/* Activity Cards with Scrollable Container */}
          <div className="col-span-12 overflow-x-auto">
            <div className="flex space-x-6 w-max" ref={scrollRef}>
              {cards.map((card, index) => (
                <div key={index}>
                  <ActivityCard
                    title={card.title}
                    imageSrc={card.imageSrc}
                    onClick={card.title === "Series wise Documents" ? handleOpenSeriesModal : undefined}
                  />
                </div>              
              ))}
              {/* "+" Button to Open Modal */}
              <button
                onClick={handleOpenModal}
                className="flex justify-center items-center w-64 h-64 bg-gray-200 text-2xl font-bold text-gray-600 rounded-lg hover:bg-gray-300 transition duration-500 ease-in-out transform hover:scale-105"
              >
                +
              </button>
              <SeriesModal isOpen={isSeriesModalOpen} onClose={handleCloseSeriesModal} />
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Adding New Card */}
      {isModalOpen && (
        <>
          {/* Background Blur */}
          <div className="fixed inset-0 bg-black bg-opacity-40 z-10"></div>

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full z-30 relative transition-transform transform duration-300 ease-out">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900">Create New Card</h3>
              <input
                type="text"
                className="border border-gray-300 p-3 rounded-lg w-full mb-6 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition duration-300"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Enter card name"
              />
              <div className="flex justify-between space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-100 focus:outline-none transition duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200 ease-in-out"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BankingPage;
