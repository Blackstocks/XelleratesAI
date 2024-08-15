'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useStartups from '@/hooks/useStartups';
import Modal from '@/components/Modal';
import Loading from '@/app/loading';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Textarea from '@/components/ui/Textarea';
import Icon from '@/components/ui/Icon';

const CuratedDealflow = () => {
  const [expressLoading, setExpressLoading] = useState(false);
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullUSP, setShowFullUSP] = useState(false);

  // console.log('startups:', startups);

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
  // console.log('selectedstartuops:', selectedStartup);

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
    setExpressLoading(true); // Start loading
    try {
      const response = await fetch('/api/express-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: investorId,
          receiverId: startupId,
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
    } finally {
      setExpressLoading(false); // End loading
    }
  };

  return (
    <>
      <Head>
        <title>Curated Dealflow</title>
      </Head>
      <main className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-4 text-center'>
          Curated Dealflow
        </h1>
        <p className='mb-6 text-center'>
          Welcome to the Curated Dealflow page. Here you can find the latest
          deal flow opportunities from around the world.
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
                  <tr>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Status
                    </th>
                    {/* Other headers */}
                  </tr>
                </thead>
                <tbody>
                  {currentStartups.map((startup, index) => {
                    const companyProfile = startup.company_profile;
                    {
                      /* console.log('companyProfile:', companyProfile); */
                    }
                    const company_logos = startup?.company_logo;

                    const founderInfo = companyProfile?.founder_information;

                    const fundingInformation =
                      companyProfile?.funding_information?.[0];
                    const companyDocuments = companyProfile?.company_documents;

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
                          {company_logos ? (
                            <img
                              src={company_logos}
                              alt={companyProfile?.company_name}
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
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
                          >
                            <option value='evaluated'>Evaluated</option>
                            <option value='meeting_done'>Meeting Done</option>
                            <option value='moving_forward'>
                              Moving Forward
                            </option>
                            <option value='rejected'>Rejected</option>
                          </select>
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
          <div className='flex flex-col lg:flex-row lg:space-x-4 w-full h-full max-h-[70vh]'>
            {/* Left side */}
            <div className='flex-none lg:w-2/5 p-4 border-r border-gray-300 flex flex-col items-center'>
              <div className='mb-4 flex flex-col items-center'>
                {selectedStartup?.company_logo && (
                  <img
                    src={selectedStartup?.company_logo}
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
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'companyDocuments'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('companyDocuments')}
                >
                  Company Dcouments
                </button>
                <button
                  className={`w-full py-2 px-4 border rounded ${
                    activeTab === 'CTO_info'
                      ? 'bg-black-500 text-white'
                      : 'bg-white text-black'
                  }`}
                  onClick={() => setActiveTab('CTO_info')}
                >
                  CTO Info
                </button>
              </div>
            </div>
            {/* Right side */}
            <div className='flex-1 p-4 overflow-y-scroll'>
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
                        [picker1, picker2, picker3]
                      );
                    }}
                    disabled={expressLoading}
                  >
                    {expressLoading ? 'Sending...' : 'Send Interest'}
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
                    <div className='space-y-3'>
                      <h3 className='text-2xl font-bold mb-6'>
                        Startup Profile
                      </h3>
                      <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                        {/* Short Description */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:document-text' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              SHORT DESCRIPTION
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {showFullDescription
                                ? selectedStartup.company_profile
                                    ?.short_description
                                : `${selectedStartup.company_profile?.short_description?.slice(
                                    0,
                                    100
                                  )}...`}
                              {selectedStartup.company_profile
                                ?.short_description?.length > 100 && (
                                <button
                                  onClick={() =>
                                    setShowFullDescription(!showFullDescription)
                                  }
                                  className='text-blue-600 hover:underline ml-2'
                                >
                                  {showFullDescription
                                    ? 'Read less'
                                    : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        </li>

                        {/* Date of Incorporation */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:calendar' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              DATE OF INCORPORATION
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile
                                ?.incorporation_date
                                ? new Date(
                                    selectedStartup.company_profile?.incorporation_date
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Country and State/City */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:map' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              LOCATION
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile?.country
                                ? JSON.parse(
                                    selectedStartup.company_profile.country
                                  ).label
                                : 'Not Provided'}
                              ,
                              {selectedStartup.company_profile?.state_city ||
                                'Not Provided'}
                            </div>
                          </div>
                        </li>

                        {/* Office Address */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:building-office' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              OFFICE ADDRESS
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile
                                ?.office_address || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Industry Sector */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:tag' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              INDUSTRY SECTOR
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile
                                ?.industry_sector || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Team Size */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:users' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              TEAM SIZE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile?.team_size ||
                                'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Current Stage */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:chart-bar' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              CURRENT STAGE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile?.current_stage ||
                                'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Target Audience */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:flag' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              TARGET AUDIENCE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile
                                ?.target_audience || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* USP/MOAT */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:light-bulb' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              USP/MOAT
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {showFullUSP
                                ? selectedStartup.company_profile?.usp_moat
                                : `${selectedStartup.company_profile?.usp_moat?.slice(
                                    0,
                                    100
                                  )}...`}
                              {selectedStartup.company_profile?.usp_moat
                                ?.length > 100 && (
                                <button
                                  onClick={() => setShowFullUSP(!showFullUSP)}
                                  className='text-blue-600 hover:underline ml-2'
                                >
                                  {showFullUSP ? 'Read less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        </li>

                        {/* Website */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:globe-alt' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              WEBSITE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              <a
                                href={
                                  selectedStartup.company_profile
                                    ?.company_website
                                }
                                className='text-blue-600 hover:underline'
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {selectedStartup.company_profile
                                  ?.company_website || 'N/A'}
                              </a>
                            </div>
                          </div>
                        </li>

                        {/* LinkedIn Profile */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:link' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              LINKEDIN PROFILE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              <a
                                href={
                                  selectedStartup.company_profile
                                    ?.linkedin_profile
                                }
                                className='text-blue-600 hover:underline'
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {selectedStartup.company_profile
                                  ?.linkedin_profile || 'N/A'}
                              </a>
                            </div>
                          </div>
                        </li>

                        {/* Media Presence */}
                        <li className='flex space-x-3 rtl:space-x-reverse'>
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:document' />
                          </div>
                          <div className='flex-1'>
                            <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                              MEDIA PRESENCE
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {selectedStartup.company_profile?.media || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Social Media Handles */}
                        {selectedStartup.company_profile?.social_media_handles?.map(
                          (handle, index) => (
                            <li
                              className='flex space-x-3 rtl:space-x-reverse'
                              key={index}
                            >
                              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                <Icon icon='heroicons:share' />
                              </div>
                              <div className='flex-1'>
                                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                  {handle.platform || 'Not provided'}
                                </div>
                                <a
                                  href={handle.url || '#'}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-base text-slate-600 dark:text-slate-50'
                                >
                                  {handle.url || 'Not provided'}
                                </a>
                              </div>
                            </li>
                          )
                        )}

                        {/* Media Presence Links */}
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-200'>
                          Media Presence Links
                        </h3>
                        {selectedStartup.company_profile?.media_presence?.map(
                          (presence, index) => (
                            <li
                              className='flex space-x-3 rtl:space-x-reverse'
                              key={index}
                            >
                              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                <Icon icon='heroicons:newspaper' />
                              </div>
                              <div className='flex-1'>
                                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                  {presence.platform || 'Not provided'}
                                </div>
                                <a
                                  href={presence.url || '#'}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-base text-slate-600 dark:text-slate-50'
                                >
                                  {presence.url || 'Not provided'}
                                </a>
                              </div>
                            </li>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'founderInfo' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>Founder Details</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* Founder Name */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:user' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER NAME
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup.company_profile?.founder_information
                            ?.founder_name || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Founder Email */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:envelope' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER EMAIL
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup.company_profile?.founder_information
                            ?.founder_email || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Founder Mobile */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:phone' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER MOBILE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup.company_profile?.founder_information
                            ?.founder_mobile || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Founder LinkedIn */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FOUNDER LINKEDIN
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup.company_profile
                                ?.founder_information?.founder_linkedin
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup.company_profile
                              ?.founder_information?.founder_linkedin ||
                              'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* College Name */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:building-library' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          COLLEGE NAME
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup.company_profile?.founder_information
                            ?.college_name || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Graduation Year */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:calendar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          GRADUATION YEAR
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup.company_profile?.founder_information
                            ?.graduation_year || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Advisors Section */}
                    {selectedStartup.company_profile?.founder_information?.advisors?.map(
                      (advisor, index) => (
                        <li
                          key={index}
                          className='flex space-x-3 rtl:space-x-reverse'
                        >
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:user-group' />
                          </div>
                          <div className='flex-1'>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor Name: ${
                                advisor.advisor_name || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor Email: ${
                                advisor.advisor_email || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor Mobile: ${
                                advisor.advisor_mobile || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Advisor LinkedIn: ${
                                advisor.advisor_linkedin || 'Not provided'
                              }`}
                            </div>
                          </div>
                        </li>
                      )
                    )}

                    {/* Co-Founders Section */}
                    {selectedStartup.company_profile?.founder_information?.co_founders?.map(
                      (coFounder, index) => (
                        <li
                          key={index}
                          className='flex space-x-3 rtl:space-x-reverse'
                        >
                          <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                            <Icon icon='heroicons:user-group' />
                          </div>
                          <div className='flex-1'>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder Name: ${
                                coFounder.co_founder_name || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder Email: ${
                                coFounder.co_founder_email || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder Mobile: ${
                                coFounder.co_founder_mobile || 'Not provided'
                              }`}
                            </div>
                            <div className='text-base text-slate-600 dark:text-slate-50'>
                              {`Co-Founder LinkedIn: ${
                                coFounder.co_founder_linkedin || 'Not provided'
                              }`}
                            </div>
                          </div>
                        </li>
                      )
                    )}

                    {/* Co-Founder Agreement */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CO-FOUNDER AGREEMENT
                        </div>
                        <a
                          href={
                            selectedStartup.company_profile?.founder_information
                              ?.co_founder_agreement || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          {selectedStartup.company_profile?.founder_information
                            ?.co_founder_agreement
                            ? 'View Technology Roadmap'
                            : 'Not provided'}
                        </a>
                      </div>
                    </li>
                  </div>
                </div>
              )}

              {activeTab === 'CTO_info' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>CTO Details</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* CTO Name */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:user' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CTO NAME
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.CTO_info
                            ?.cto_name || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* CTO Email */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:envelope' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          EMAIL
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.CTO_info
                            ?.cto_email || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* CTO Mobile */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:phone' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MOBILE NUMBER
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.CTO_info
                            ?.cto_mobile || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* CTO LinkedIn */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          LINKEDIN PROFILE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.company_profile?.CTO_info
                                ?.cto_linkedin || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.company_profile?.CTO_info
                              ?.cto_linkedin || 'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* Tech Team Size */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:users' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TECH TEAM SIZE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.CTO_info
                            ?.tech_team_size || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Mobile App Link (iOS) */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MOBILE APP LINK (iOS)
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.company_profile?.CTO_info
                                ?.mobile_app_link_ios || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.company_profile?.CTO_info
                              ?.mobile_app_link_ios || 'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* Mobile App Link (Android) */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:link' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MOBILE APP LINK (Android)
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.company_profile?.CTO_info
                                ?.mobile_app_link_android || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.company_profile?.CTO_info
                              ?.mobile_app_link_android || 'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>

                    {/* Technology Roadmap */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TECHNOLOGY ROADMAP
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          <a
                            href={
                              selectedStartup?.company_profile?.CTO_info
                                ?.technology_roadmap || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.company_profile?.CTO_info
                              ?.technology_roadmap
                              ? 'View Technology Roadmap'
                              : 'Not provided'}
                          </a>
                        </div>
                      </div>
                    </li>
                  </div>
                </div>
              )}

              {activeTab === 'businessDetails' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>Business Details</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* Current Traction */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:presentation-chart-line' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CURRENT TRACTION
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.business_details
                            ?.current_traction || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* New Customers */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:user-plus' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          HOW MANY NEW CUSTOMERS YOU OBTAINED IN THE LAST 6
                          MONTHS?
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.business_details
                            ?.new_Customers || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Customer Acquisition Cost */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:banknotes' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          WHAT IS YOUR CUSTOMER ACQUISITION COST?
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.business_details
                            ?.customer_AcquisitionCost || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Customer Lifetime Value */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:currency-dollar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          WHAT IS THE LIFETIME VALUE OF YOUR CUSTOMER?
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.business_details
                            ?.customer_Lifetime_Value || 'N/A'}
                        </div>
                      </div>
                    </li>
                  </div>
                </div>
              )}

              {activeTab === 'fundingInfo' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>
                    Funding Information
                  </h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* Total Funding Ask */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:currency-dollar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TOTAL FUNDING ASK
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.total_funding_ask || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Amount Committed */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:banknotes' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          AMOUNT COMMITTED
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.amount_committed || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Government Grants */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:clipboard-document-check' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          GOVERNMENT GRANTS
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.government_grants || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Equity Split */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:chart-pie' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          EQUITY SPLIT
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.equity_split || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Fund Utilization */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document-text' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FUND UTILIZATION
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.fund_utilization || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* ARR */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:chart-bar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          ARR
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.arr || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* MRR */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:chart-bar' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MRR
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.mrr || 'N/A'}
                        </div>
                      </div>
                    </li>

                    {/* Current Cap Table */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CURRENT CAP TABLE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {selectedStartup?.company_profile?.funding_information
                            ?.current_cap_table ? (
                            <a
                              href={
                                selectedStartup?.company_profile
                                  ?.funding_information?.current_cap_table
                              }
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              View Document
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </div>
                    </li>

                    {/* Previous Funding Information */}
                    <div className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:banknotes' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px] mb-4'>
                          PREVIOUS FUNDING INFORMATION
                        </div>
                        <div className='overflow-x-auto'>
                          <div className='inline-block min-w-full align-middle'>
                            <div className='overflow-hidden'>
                              <table className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'>
                                <thead className='bg-slate-200 dark:bg-slate-700'>
                                  <tr>
                                    <th scope='col' className='table-th'>
                                      Investor Name
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Firm Name
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Investor Type
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Amount Raised
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700'>
                                  {selectedStartup?.company_profile?.funding_information?.previous_funding?.map(
                                    (funding, index) => (
                                      <tr key={index}>
                                        <td className='table-td'>
                                          {funding.investorName ||
                                            'Not provided'}
                                        </td>
                                        <td className='table-td'>
                                          {funding.firmName || 'Not provided'}
                                        </td>
                                        <td className='table-td'>
                                          {funding.investorType ||
                                            'Not provided'}
                                        </td>
                                        <td className='table-td'>
                                          {funding.amountRaised
                                            ? `$${funding.amountRaised}`
                                            : 'Not provided'}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cap Table */}
                    <div className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px] mb-3'>
                          CAP TABLE
                        </div>
                        <div className='overflow-x-auto'>
                          <div className='inline-block min-w-full align-middle'>
                            <div className='overflow-hidden'>
                              <table className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'>
                                <thead className='bg-slate-200 dark:bg-slate-700'>
                                  <tr>
                                    <th scope='col' className='table-th'>
                                      Designation
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Name
                                    </th>
                                    <th scope='col' className='table-th'>
                                      Percentage
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700'>
                                  {selectedStartup?.company_profile?.funding_information?.cap_table?.map(
                                    (entry, index) => (
                                      <tr key={index}>
                                        <td className='table-td'>
                                          {entry.designation ||
                                            'Designation not specified'}
                                        </td>
                                        <td className='table-td'>
                                          {entry.firstName ||
                                            'Name not specified'}
                                        </td>
                                        <td className='table-td'>
                                          {entry.percentage
                                            ? `${entry.percentage}%`
                                            : 'Not provided'}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'companyDocuments' && (
                <div className='space-y-3'>
                  <h3 className='text-2xl font-bold mb-6'>Company Documents</h3>
                  <div className='grid gap-2 md:gap-3 lg:gap-4 text-gray-700'>
                    {/* Certificate of Incorporation */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CERTIFICATE OF INCORPORATION
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.certificate_of_incorporation || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.certificate_of_incorporation
                            ? 'View Certificate'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* GST Certificate */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          GST CERTIFICATE
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.gst_certificate || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.gst_certificate
                            ? 'View Certificate'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Trademark */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TRADEMARK
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.trademark || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.trademark
                            ? 'View Trademark'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Copyright */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          COPYRIGHT
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.copyright || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.copyright
                            ? 'View Copyright'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Patent */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          PATENT
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.patent || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.patent
                            ? 'View Patent'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Startup India Certificate */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          STARTUP INDIA CERTIFICATE
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.startup_india_certificate || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.startup_india_certificate
                            ? 'View Certificate'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Due Diligence Report */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          DUE DILIGENCE REPORT
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.due_diligence_report || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.due_diligence_report
                            ? 'View Report'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Business Valuation Report */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          BUSINESS VALUATION REPORT
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.business_valuation_report || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.business_valuation_report
                            ? 'View Report'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* MIS */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MIS
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.mis || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.mis
                            ? 'View MIS'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Financial Projections */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          FINANCIAL PROJECTIONS
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.financial_projections || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.financial_projections
                            ? 'View Projections'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Balance Sheet */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          BALANCE SHEET
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.balance_sheet || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.balance_sheet
                            ? 'View Balance Sheet'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* P&L Statement */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          P&L STATEMENT
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.pl_statement || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.pl_statement
                            ? 'View P&L Statement'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Cashflow Statement */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          CASHFLOW STATEMENT
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.cashflow_statement || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.cashflow_statement
                            ? 'View Cashflow Statement'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Pitch Deck */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          PITCH DECK
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.pitch_deck || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.pitch_deck
                            ? 'View Pitch Deck'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Video Pitch */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          VIDEO PITCH
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.video_pitch || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.video_pitch
                            ? 'View Video Pitch'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* SHA (Previous/Existing Round) */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          SHA (PREVIOUS/EXISTING ROUND)
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.sha || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.sha
                            ? 'View SHA'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Termsheet (Previous/Existing Round) */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          TERMSHEET (PREVIOUS/EXISTING ROUND)
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.termsheet || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.termsheet
                            ? 'View Termsheet'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* Employment Agreement */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          EMPLOYMENT AGREEMENT
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.employment_agreement || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.employment_agreement
                            ? 'View Agreement'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* MoU */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          MOU
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.mou || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.mou
                            ? 'View MoU'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>

                    {/* NDA */}
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:document' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          NDA
                        </div>
                        <a
                          href={
                            selectedStartup?.company_profile?.companyDocuments
                              ?.nda || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-base text-slate-600 dark:text-slate-50'
                        >
                          {selectedStartup?.company_profile?.companyDocuments
                            ?.nda
                            ? 'View NDA'
                            : 'Not Provided'}
                        </a>
                      </div>
                    </li>
                  </div>
                </div>
              )}

              <div className='flex gap-4 mt-4'>
                <button
                  className='rounded-md py-2 px-4 border bg-success-500 text-white'
                  onClick={() => setShowForm(true)}
                >
                  Express Interest
                </button>
                <button
                  className='rounded-md py-2 px-4 border bg-danger-500 text-white'
                  onClick={() => setShowForm(true)}
                >
                  Reject
                </button>
                <button
                  className='rounded-md py-2 px-4 border bg-info-500 text-white'
                  onClick={() => setShowForm(true)}
                >
                  Evaluate
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CuratedDealflow;
