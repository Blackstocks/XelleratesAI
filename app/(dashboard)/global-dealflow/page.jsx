'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useStartups from '@/hooks/useStartups';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';

const GlobalDealflow = () => {
  const { user, details, loading: userLoading } = useUserDetails();
  const { startups, loading: startupsLoading } = useStartups();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedFunding, setSelectedFunding] = useState('All');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [activeTab, setActiveTab] = useState('startupProfile');
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1); // Reset to the first page whenever a filter changes
  }, [selectedSector, selectedStage, selectedLocation, selectedFunding]);

  if (userLoading || startupsLoading) {
    return <Loading />;
  }

  const uniqueSectors = [
    'All',
    ...new Set(
      startups
        .map((startup) => {
          const businessDetails = Array.isArray(startup.company_profile)
            ? startup.company_profile[0]?.business_details[0]
            : startup.company_profile?.business_details[0];
          return businessDetails?.industry_sector || 'N/A';
        })
        .filter((sector) => sector !== 'N/A')
    ),
  ];

  const uniqueStages = [
    'All',
    ...new Set(
      startups
        .map((startup) => {
          const businessDetails = Array.isArray(startup.company_profile)
            ? startup.company_profile[0]?.business_details[0]
            : startup.company_profile?.business_details[0];
          return businessDetails?.current_stage || 'N/A';
        })
        .filter((stage) => stage !== 'N/A')
    ),
  ];

  const uniqueLocations = [
    'All',
    ...new Set(
      startups
        .map((startup) => {
          const companyProfile = Array.isArray(startup.company_profile)
            ? startup.company_profile[0]
            : startup.company_profile;
          return companyProfile?.country || 'N/A';
        })
        .filter((location) => location !== 'N/A')
    ),
  ];

  const uniqueFundings = [
    'All',
    ...new Set(
      startups.map((startup) => {
        const fundingInformation = Array.isArray(startup.company_profile)
          ? startup.company_profile[0]?.funding_information[0]
          : startup.company_profile?.funding_information[0];
        return fundingInformation?.total_funding_ask ? 'Funded' : 'Not Funded';
      })
    ),
  ];

  const filteredStartups = startups.filter((startup) => {
    const businessDetails = Array.isArray(startup.company_profile)
      ? startup.company_profile[0]?.business_details[0]
      : startup.company_profile?.business_details[0];
    const companyProfile = Array.isArray(startup.company_profile)
      ? startup.company_profile[0]
      : startup.company_profile;
    const fundingInformation = Array.isArray(startup.company_profile)
      ? startup.company_profile[0]?.funding_information[0]
      : startup.company_profile?.funding_information[0];

    return (
      (selectedSector === 'All' ||
        businessDetails?.industry_sector === selectedSector) &&
      (selectedStage === 'All' ||
        businessDetails?.current_stage === selectedStage) &&
      (selectedLocation === 'All' ||
        companyProfile?.country === selectedLocation) &&
      (selectedFunding === 'All' ||
        (selectedFunding === 'Funded' &&
          fundingInformation?.total_funding_ask) ||
        (selectedFunding === 'Not Funded' &&
          !fundingInformation?.total_funding_ask))
    );
  });

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

  return (
    <>
      <Head>
        <title>Global Dealflow</title>
      </Head>
      <main className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-4 text-center'>Global Dealflow</h1>
        <p className='mb-6 text-center'>
          Welcome to the Global Dealflow page. Here you can find the latest deal
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
                    const companyProfile = Array.isArray(
                      startup.company_profile
                    )
                      ? startup.company_profile[0]
                      : startup.company_profile;
                    const founderInfo = companyProfile?.founder_information
                      ? companyProfile.founder_information[0]
                      : null;
                    const businessDetails = companyProfile?.business_details
                      ? companyProfile.business_details[0]
                      : null;
                    const fundingInformation =
                      companyProfile?.funding_information
                        ? companyProfile.funding_information[0]
                        : null;

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
                              className='w-10 h-10 object-cover rounded'
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
                              {companyProfile?.country || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {founderInfo?.founder_name || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {businessDetails?.industry_sector || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {companyProfile?.incorporation_date
                            ? new Date(
                                companyProfile.incorporation_date
                              ).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {businessDetails?.team_size || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {businessDetails?.current_stage || 'N/A'}
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
                {selectedStartup.company_profile[0]?.company_logo && (
                  <img
                    src={selectedStartup.company_profile[0]?.company_logo}
                    alt={selectedStartup.company_profile[0]?.company_name}
                    className='w-32 h-32 object-cover mb-4'
                  />
                )}
                <h2 className='text-2xl font-bold mb-2 text-center'>
                  {selectedStartup.company_profile[0]?.company_name || 'N/A'}
                </h2>
              </div>
              <div className='space-y-2 w-full'>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'startupProfile'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('startupProfile')}
                >
                  Startup Profile
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'founderInfo'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('founderInfo')}
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
              {activeTab === 'startupProfile' && (
                <div>
                  <h3 className='text-xl font-bold mb-4'>Startup Profile</h3>
                  <p className='mb-4'>
                    {selectedStartup.company_profile[0]?.short_description ||
                      'N/A'}
                  </p>
                  <p>
                    <strong>Date of Incorporation:</strong>{' '}
                    {selectedStartup.company_profile[0]?.incorporation_date
                      ? new Date(
                          selectedStartup.company_profile[0]?.incorporation_date
                        ).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  <p>
                    <strong>Country:</strong>{' '}
                    {selectedStartup.company_profile[0]?.country || 'N/A'}
                  </p>
                  <p>
                    <strong>State/City:</strong>{' '}
                    {selectedStartup.company_profile[0]?.state_city || 'N/A'}
                  </p>
                  <p>
                    <strong>Office Address:</strong>{' '}
                    {selectedStartup.company_profile[0]?.office_address ||
                      'N/A'}
                  </p>
                  <p>
                    <strong>Pin Code:</strong>{' '}
                    {selectedStartup.company_profile[0]?.pin_code || 'N/A'}
                  </p>
                  <p>
                    <strong>Website:</strong>{' '}
                    <a
                      href={selectedStartup.company_profile[0]?.company_website}
                      className='text-black hover:underline'
                    >
                      {selectedStartup.company_profile[0]?.company_website ||
                        'N/A'}
                    </a>
                  </p>
                </div>
              )}
              {activeTab === 'founderInfo' && (
                <div>
                  <h3 className='text-xl font-bold mb-4'>
                    Founder Information
                  </h3>
                  {selectedStartup.company_profile[0]?.founder_information.map(
                    (founder) => (
                      <div key={founder.id} className='mb-4'>
                        <p>
                          <strong>Name:</strong> {founder.founder_name || 'N/A'}
                        </p>
                        <p>
                          <strong>Email:</strong>{' '}
                          {founder.founder_email || 'N/A'}
                        </p>
                        <p>
                          <strong>Mobile:</strong>{' '}
                          {founder.founder_mobile || 'N/A'}
                        </p>
                        <p>
                          <strong>LinkedIn:</strong>{' '}
                          <a
                            href={founder.founder_linkedin}
                            className='text-black hover:underline'
                          >
                            {founder.founder_linkedin || 'N/A'}
                          </a>
                        </p>
                        <p>
                          <strong>College Name:</strong>{' '}
                          <a
                            href={founder.college_name}
                            className='text-black hover:underline'
                          >
                            {founder.college_name || 'N/A'}
                          </a>
                        </p>
                        <p>
                          <strong>Graduation Year:</strong>{' '}
                          <a
                            href={founder.graduation_year}
                            className='text-black hover:underline'
                          >
                            {founder.graduation_year || 'N/A'}
                          </a>
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
              {activeTab === 'businessDetails' && (
                <div>
                  <h3 className='text-xl font-bold mb-4'>Business Details</h3>
                  {selectedStartup.company_profile[0]?.business_details && (
                    <div className='mb-4'>
                      <p>
                        <strong>Industry Sector:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.industry_sector || 'N/A'}
                      </p>
                      <p>
                        <strong>Current Stage:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.current_stage || 'N/A'}
                      </p>
                      <p>
                        <strong>Current Traction:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.current_traction || 'N/A'}
                      </p>
                      <p>
                        <strong>Target Audience:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.target_audience || 'N/A'}
                      </p>
                      <p>
                        <strong>Team Size:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.team_size || 'N/A'}
                      </p>
                      <p>
                        <strong>USP / Moat:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.usp_moat || 'N/A'}
                      </p>
                      <p>
                        <strong>Certificate of Incorporation:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.certificate_of_incorporation ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0]
                                .certificate_of_incorporation
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
                      <p>
                        <strong>GST Certificate:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.gst_certificate ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].gst_certificate
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
                      <p>
                        <strong>Startup India Certificate:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.startup_india_certificate ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].startup_india_certificate
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
                      <p>
                        <strong>Due Deligence Report:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.due_diligence_report ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].due_diligence_report
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
                      <p>
                        <strong>Business Valuation Report:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.business_valuation_report ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].business_valuation_report
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
                      <p>
                        <strong>MIS:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.mis ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].mis
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
                      <p>
                        <strong>Pitch Deck:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.pitch_deck ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].pitch_deck
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
                      <p>
                        <strong>Video Deck:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.video_pitch ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].video_pitch
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
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'fundingInfo' && (
                <div>
                  <h3 className='text-xl font-bold mb-4'>
                    Funding Information
                  </h3>
                  {selectedStartup.company_profile[0]?.funding_information &&
                  selectedStartup.company_profile[0]?.funding_information
                    .length > 0 ? (
                    <>
                      <p>
                        <strong>Total Funding:</strong>{' '}
                        {selectedStartup.company_profile[0]
                          ?.funding_information[0]?.total_funding_ask || 'N/A'}
                      </p>
                      <p>
                        <strong>Government Grands:</strong>{' '}
                        {selectedStartup.company_profile[0]
                          ?.funding_information[0]?.government_grants || 'N/A'}
                      </p>
                      <p>
                        <strong>Current Cap Table:</strong>{' '}
                        {selectedStartup.company_profile[0]?.business_details[0]
                          ?.current_cap_table ? (
                          <a
                            href={
                              selectedStartup.company_profile[0]
                                .business_details[0].current_cap_table
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
                  ) : (
                    <p>No funding information available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default GlobalDealflow;
