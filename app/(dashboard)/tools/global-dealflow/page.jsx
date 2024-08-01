'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useStartups from '@/hooks/useStartups';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Textarea from '@/components/ui/Textarea';

const CuratedDealflow = () => {
  const { user, loading: userLoading } = useUserDetails();
  const { startups, loading: startupsLoading } = useStartups();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedFunding, setSelectedFunding] = useState('All');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [activeTab, setActiveTab] = useState('startupProfile');
  const [picker1, setPicker1] = useState(new Date());
  const [picker2, setPicker2] = useState(new Date());
  const [picker3, setPicker3] = useState(new Date());

  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1); // Reset to the first page whenever a filter changes
  }, [selectedSector, selectedStage, selectedLocation, selectedFunding]);

  if (userLoading || startupsLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  const uniqueSectors = [
    'All',
    ...new Set(
      startups
        .map((startup) => startup.company_profile?.industry_sector || 'N/A')
        .filter((sector) => sector !== 'N/A')
    ),
  ];

  const uniqueStages = [
    'All',
    ...new Set(
      startups
        .map((startup) => startup.company_profile?.current_stage || 'N/A')
        .filter((stage) => stage !== 'N/A')
    ),
  ];

  const uniqueLocations = [
    'All',
    ...new Set(
      startups
        .map((startup) => {
          try {
            const countryData = JSON.parse(
              startup.company_profile?.country || '{}'
            );
            return countryData.label || 'N/A';
          } catch (error) {
            return 'N/A';
          }
        })
        .filter((location) => location !== 'N/A')
    ),
  ];

  const uniqueFundings = [
    'All',
    ...new Set(
      startups.map((startup) => {
        const fundingInformation =
          startup.company_profile?.funding_information?.[0];
        return fundingInformation?.total_funding_ask ? 'Funded' : 'Not Funded';
      })
    ),
  ];

  const filteredStartups = startups.filter((startup) => {
    const companyProfile = startup.company_profile;
    const fundingInformation =
      startup.company_profile?.funding_information?.[0];

    return (
      (selectedSector === 'All' ||
        companyProfile?.industry_sector === selectedSector) &&
      (selectedStage === 'All' ||
        companyProfile?.current_stage === selectedStage) &&
      (selectedLocation === 'All' ||
        JSON.parse(companyProfile?.country || '{}').label ===
          selectedLocation) &&
      (selectedFunding === 'All' ||
        (selectedFunding === 'Funded' &&
          fundingInformation?.total_funding_ask) ||
        (selectedFunding === 'Not Funded' &&
          !fundingInformation?.total_funding_ask))
    );
  });
  console.log('selectedstartuops:', selectedStartup);

  const totalPages = Math.ceil(filteredStartups.length / itemsPerPage);
  const currentStartups = filteredStartups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleCloseModal = () => {
    setSelectedStartup(null);
  };

  const handleClearFilters = () => {
    setSelectedSector('All');
    setSelectedStage('All');
    setSelectedLocation('All');
    setSelectedFunding('All');
  };

  const handleExpressInterest = async (
    startupId,
    investorId,
    message,
    dateTime
  ) => {
    try {
      const response = await fetch('/api/express-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: investorId, // Assuming the sender is the investor
          receiverId: startupId, // Assuming the receiver is the startup
          message,
          dateTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error sending interest notification:', error.error);
        return;
      }

      const data = await response.json();
      console.log('Interest notification sent:', data.message);
      setMessage('');
      setPicker1(new Date());
      setPicker2(new Date());
      setPicker3(new Date());
      setShowForm(false);
    } catch (error) {
      console.error('Unexpected error sending interest notification:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Curated Dealflow</title>
      </Head>
      <main className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-4 text-center'>Curated Dealflow</h1>
        <p className='mb-6 text-center'>
          Welcome to the Curated Dealflow page. Here you can find the latest deal
          flow opportunities from around the world.
        </p>
        <div className='flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-4'>
          <div className='mb-4 lg:mb-0'>
            <label
              htmlFor='sector-filter'
              className='block text-sm font-medium text-gray-700'
            >
              Sector:
            </label>
            <select
              id='sector-filter'
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className='mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
            >
              {uniqueSectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4 lg:mb-0'>
            <label
              htmlFor='stage-filter'
              className='block text-sm font-medium text-gray-700'
            >
              Stage:
            </label>
            <select
              id='stage-filter'
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className='mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
            >
              {uniqueStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4 lg:mb-0'>
            <label
              htmlFor='location-filter'
              className='block text-sm font-medium text-gray-700'
            >
              Location:
            </label>
            <select
              id='location-filter'
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className='mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
            >
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4 lg:mb-0'>
            <label
              htmlFor='funding-filter'
              className='block text-sm font-medium text-gray-700'
            >
              Previous Funding:
            </label>
            <select
              id='funding-filter'
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value)}
              className='mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
            >
              {uniqueFundings.map((funding) => (
                <option key={funding} value={funding}>
                  {funding}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4 lg:mb-0 lg:ml-auto'>
            <button
              onClick={handleClearFilters}
              className='mt-6 lg:mt-4 py-2 px-4 bg-black-500 hover:bg-red-600 text-white rounded-md transition duration-200'
            >
              Clear All Filters
            </button>
          </div>
        </div>
        <div className='mb-4'>
          <h2 className='text-xl font-bold'>Registered Startups</h2>
          {currentStartups.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full bg-white border border-gray-300'>
                <thead>
                  <tr>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      S.No
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Startup Info
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Founder Name
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Sector
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Date of Incorporation
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Team Size
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Stage
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Previous Funding
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentStartups.map((startup, index) => {
                    const companyProfile = startup.company_profile;
                    const founderInfo = companyProfile?.founder_information;
                    const businessDetails =
                      companyProfile?.business_details?.[0];
                    const fundingInformation =
                      companyProfile?.funding_information?.[0];

                    return (
                      <tr
                        key={startup.id}
                        className={`hover:bg-gray-100 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                        }`}
                        onClick={() => {
                          setSelectedStartup(startup);
                          setActiveTab('startupProfile');
                        }}
                      >
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm flex items-center space-x-2'>
                          {companyProfile?.company_logo ? (
                            <img
                              src={companyProfile.company_logo}
                              alt={companyProfile.company_name}
                              className='w-10 h-10 object-contain rounded'
                            />
                          ) : (
                            <div className='w-10 h-10 bg-gray-200 flex items-center justify-center rounded'>
                              N/A
                            </div>
                          )}
                          <div>
                            <span className='text-black-500 hover:underline cursor-pointer'>
                              {companyProfile?.company_name || 'N/A'}
                            </span>
                            <p className='text-gray-500 text-xs'>
                              {companyProfile?.country
                                ? (() => {
                                    try {
                                      const parsed = JSON.parse(
                                        companyProfile.country
                                      );
                                      return parsed.label || 'N/A';
                                    } catch (e) {
                                      return 'N/A'; // Return 'N/A' if parsing fails
                                    }
                                  })()
                                : 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {founderInfo?.founder_name || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {companyProfile?.industry_sector || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {companyProfile?.incorporation_date
                            ? new Date(
                                companyProfile.incorporation_date
                              ).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {companyProfile?.team_size || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {companyProfile?.current_stage || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {fundingInformation?.total_funding_ask
                            ? 'Funded'
                            : 'Not Funded'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className='flex justify-between items-center mt-4'>
                <button
                  onClick={handlePreviousPage}
                  className='py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200'
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className='text-gray-700'>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  className='py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200'
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No startups registered.</p>
          )}
        </div>
      </main>
      <Modal isOpen={!!selectedStartup} onClose={handleCloseModal}>
        {selectedStartup && (
          <div className='flex flex-col lg:flex-row lg:space-x-4 w-full h-full overflow-auto'>
            {/* Left side */}
            <div className='flex-none lg:w-2/5 p-4 border-r border-gray-300 flex flex-col items-center'>
              <div className='mb-4 flex flex-col items-center'>
                {selectedStartup.company_profile?.company_logo && (
                  <img
                    src={selectedStartup.company_profile?.company_logo}
                    alt={selectedStartup.company_profile?.company_name}
                    className='w-32 h-32 object-contain mb-4'
                  />
                )}
                <h2 className='text-2xl font-bold mb-2 text-center'>
                  {selectedStartup.company_profile?.company_name || 'N/A'}
                </h2>
              </div>
              <div className='space-y-2 w-full'>
                <button
                  className='w-full rounded-lg py-2 px-4 border  
                      bg-[#14213d] text-white'
                  onClick={() => setShowForm(true)}
                >
                  Express Interest
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'startupProfile'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => {
                    setActiveTab('startupProfile');
                    setShowForm(false);
                  }}
                >
                  Startup Profile
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'founderInfo'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => {
                    setActiveTab('founderInfo');
                    setShowForm(false);
                  }}
                >
                  Founder Information
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'businessDetails'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('businessDetails')}
                >
                  Business Details
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'fundingInfo'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('fundingInfo')}
                >
                  Funding Information
                </button>
              </div>
            </div>
            {/* Right side */}
            <div className='flex-1 p-4 overflow-y-auto'>
              {showForm ? (
                <div className='express-interest-form mt-4'>
                  <Textarea
                    label={'Message to the Startup'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Write your message here'
                    className='w-full p-2 border rounded'
                  ></Textarea>
                  <div className='my-2'>
                    <label className='form-label' htmlFor='date-time-picker1'>
                      Slot 1
                    </label>
                    <Flatpickr
                      value={picker1}
                      data-enable-time
                      id='date-time-picker1'
                      className='form-control py-2'
                      onChange={(date) => setPicker1(date[0])}
                    />
                  </div>
                  <div className='my-2'>
                    <label className='form-label' htmlFor='date-time-picker2'>
                      Slot 2
                    </label>
                    <Flatpickr
                      value={picker2}
                      data-enable-time
                      id='date-time-picker2'
                      className='form-control py-2'
                      onChange={(date) => setPicker2(date[0])}
                    />
                  </div>
                  <div className='my-2'>
                    <label className='form-label' htmlFor='date-time-picker3'>
                      Slot 3
                    </label>
                    <Flatpickr
                      value={picker3}
                      data-enable-time
                      id='date-time-picker3'
                      className='form-control py-2'
                      onChange={(date) => setPicker3(date[0])}
                    />
                  </div>
                  <button
                    className='mr-1rem rounded-md py-2 px-4 border bg-[#14213d] text-white'
                    onClick={() => {
                      handleExpressInterest(
                        selectedStartup?.company_profile?.id,
                        user.id,
                        message,
                        [picker1, picker2, picker3] // Pass array of date times
                      );
                    }}
                  >
                    Send Interest
                  </button>
                  <button
                    className='rounded-md py-2 px-4 border bg-[#14213d] text-white'
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'startupProfile' && (
                    <div>
                      <h3 className='text-xl font-bold mb-4'>
                        Startup Profile
                      </h3>
                      <p className='mb-4'>
                        <strong>Company Name:</strong>{' '}
                        {selectedStartup.company_profile?.company_name || 'N/A'}
                      </p>
                      <p>
                        <strong>Short Description:</strong>{' '}
                        {selectedStartup.company_profile?.short_description ||
                          'N/A'}
                      </p>
                      <p>
                        <strong>Date of Incorporation:</strong>{' '}
                        {selectedStartup.company_profile?.incorporation_date
                          ? new Date(
                              selectedStartup.company_profile?.incorporation_date
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Country:</strong>{' '}
                        {selectedStartup.company_profile?.country
                          ? JSON.parse(selectedStartup.company_profile.country)
                              .label
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>State/City:</strong>{' '}
                        {selectedStartup.company_profile?.state_city || 'N/A'}
                      </p>
                      <p>
                        <strong>Office Address:</strong>{' '}
                        {selectedStartup.company_profile?.office_address ||
                          'N/A'}
                      </p>
                      <p>
                        <strong>Industry Sector:</strong>{' '}
                        {selectedStartup.company_profile?.industry_sector ||
                          'N/A'}
                      </p>
                      <p>
                        <strong>Team Size:</strong>{' '}
                        {selectedStartup.company_profile?.team_size || 'N/A'}
                      </p>
                      <p>
                        <strong>Current Stage:</strong>{' '}
                        {selectedStartup.company_profile?.current_stage ||
                          'N/A'}
                      </p>
                      <p>
                        <strong>Target Audience:</strong>{' '}
                        {selectedStartup.company_profile?.target_audience ||
                          'N/A'}
                      </p>
                      <p>
                        <strong>Website:</strong>{' '}
                        <a
                          href={
                            selectedStartup.company_profile?.company_website
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:underline'
                        >
                          {selectedStartup.company_profile?.company_website ||
                            'N/A'}
                        </a>
                      </p>
                      <p>
                        <strong>LinkedIn Profile:</strong>{' '}
                        <a
                          href={
                            selectedStartup.company_profile?.linkedin_profile
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:underline'
                        >
                          {selectedStartup.company_profile?.linkedin_profile ||
                            'N/A'}
                        </a>
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'founderInfo' && (
                <div>
                  <h3 className='text-xl font-bold mb-4'>Founder Details</h3>
                  <div className='mb-4'>
                    <p>
                      <strong>Name:</strong>{' '}
                      {selectedStartup.company_profile?.founder_information
                        ?.founder_name || 'N/A'}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      {selectedStartup.company_profile?.founder_information
                        ?.founder_email || 'N/A'}
                    </p>
                    <p>
                      <strong>Mobile:</strong>{' '}
                      {selectedStartup.company_profile?.founder_information
                        ?.founder_mobile || 'N/A'}
                    </p>
                    <p>
                      <strong>LinkedIn:</strong>
                      <a
                        href={
                          selectedStartup.company_profile?.founder_information
                            ?.founder_linkedin
                        }
                        className='text-blue-500 hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {selectedStartup.company_profile?.founder_information
                          ?.founder_linkedin || 'N/A'}
                      </a>
                    </p>
                    <p>
                      <strong>College Name:</strong>{' '}
                      {selectedStartup.company_profile?.founder_information
                        ?.college_name || 'N/A'}
                    </p>
                    <p>
                      <strong>Graduation Year:</strong>{' '}
                      {selectedStartup.company_profile?.founder_information
                        ?.graduation_year || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'businessDetails' && (
                <div>
                  <h3 className='text-xl font-bold mb-4'>Business Details</h3>

                  <div className='mb-4'>
                    <p>
                      <strong>Current Traction:</strong>{' '}
                      {selectedStartup?.company_profile?.business_details
                        .current_traction || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
              {activeTab === 'fundingInfo' && (
                <div>
                  <h3 className='text-xl font-bold mb-4'>
                    Funding Information
                  </h3>

                  <>
                    <p>
                      <strong>Total Funding:</strong>{' '}
                      {selectedStartup?.company_profile?.funding_information
                        ?.total_funding_ask || 'N/A'}
                    </p>
                    <p>
                      <strong>Government Grands:</strong>{' '}
                      {selectedStartup?.company_profile?.funding_information
                        ?.government_grants || 'N/A'}
                    </p>
                    <p>
                      <strong>Current Cap Table:</strong>{' '}
                      {selectedStartup?.company_profile?.funding_information
                        ?.current_cap_table ? (
                        <a
                          href={
                            selectedStartup?.company_profile
                              ?.funding_information?.current_cap_table
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:underline'
                        >
                          View Document
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CuratedDealflow;
