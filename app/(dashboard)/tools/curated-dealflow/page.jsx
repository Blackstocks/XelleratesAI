'use client';
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useStartups from '@/hooks/useStartups';
import Modal from '@/components/Modal';
import Loading from '@/app/loading';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Textarea from '@/components/ui/Textarea';
import Icon from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import generateReport from '@/components/report/report-functions';
import useNotificationStatus from '@/hooks/useNotificationStatus';
import { handleStatusChange } from '@/lib/actions/investorActions';

const CuratedDealflow = () => {
  const [expressLoading, setExpressLoading] = useState(false);
  const { user, loading: userLoading } = useUserDetails();
  const { startups, loading: startupsLoading } = useStartups(user?.id);
  // console.log('startups:', startups);
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
  const [isLoading, setIsLoading] = useState(false);
  const { isLoading: noticationsLoading, connectionStatus } =
    useNotificationStatus(user?.id, selectedStartup?.id);

  const toastIdRef = useRef(null);

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

  // useEffect(() => {
  //   if (user?.id && selectedStartup?.id) {
  //     fetchNotificationStatus(user.id, selectedStartup?.id);
  //   }
  // }, [user?.id, selectedStartup?.id]);

  // const fetchNotificationStatus = async (senderId, receiverId) => {
  //   setIsLoading(true);

  //   try {
  //     const { data, error } = await supabase
  //       .from('notifications')
  //       .select('notification_status')
  //       .eq('sender_id', senderId)
  //       .eq('receiver_id', receiverId)
  //       .eq('notification_type', 'express_interest');

  //     if (error) {
  //       console.error('Error fetching notification status:', error);
  //       return;
  //     }

  //     if (data && data.length > 0) {
  //       const status = data[0].notification_status;
  //       if (status === 'pending') {
  //         setConnectionStatus('connection_sent');
  //       } else if (status === 'accepted') {
  //         setConnectionStatus('connected');
  //       } else {
  //         setConnectionStatus('connect');
  //       }
  //     } else {
  //       setConnectionStatus('connect');
  //     }
  //   } catch (error) {
  //     console.error('Unexpected error fetching notification status:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const uniqueSectors = [
    'All',
    ...new Set(
      startups
        .map((startup) => startup.industry_sector || 'N/A')
        .filter((sector) => sector !== 'N/A')
    ),
  ];

  const uniqueStages = [
    'All',
    ...new Set(
      startups
        .map((startup) => startup.current_stage || 'N/A')
        .filter((stage) => stage !== 'N/A')
    ),
  ];

  const uniqueLocations = [
    'All',
    ...new Set(
      startups
        .map((startup) => {
          try {
            const countryData = JSON.parse(startup.country || '{}');
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
        return startup.funding_information?.total_funding_ask
          ? 'Funded'
          : 'Not Funded';
      })
    ),
  ];

  const filteredStartups = startups.filter((startup) => {
    return (
      (selectedSector === 'All' ||
        startup.industry_sector === selectedSector) &&
      (selectedStage === 'All' || startup.current_stage === selectedStage) &&
      (selectedLocation === 'All' ||
        JSON.parse(startup.country || '{}').label === selectedLocation) &&
      (selectedFunding === 'All' ||
        (selectedFunding === 'Funded' &&
          startup.funding_information?.total_funding_ask) ||
        (selectedFunding === 'Not Funded' &&
          !startup.funding_information?.total_funding_ask))
    );
  });

  const renderDocumentLink = (label, url) => (
    <li className='flex space-x-3 rtl:space-x-reverse'>
      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
        <Icon icon='heroicons:document' />
      </div>
      <div className='flex-1'>
        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
          {label}
        </div>
        {url ? (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:underline'
          >
            View Document
          </a>
        ) : (
          <span className='text-slate-600 dark:text-slate-50'>
            Not Provided
          </span>
        )}
      </div>
    </li>
  );

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

  const handleImageClick = async (type, selectedStartup) => {
    if (type === 'investment') {
      toastIdRef.current = toast.loading('Generating report, please wait...');

      const firstUpdate = setTimeout(() => {
        toast.update(toastIdRef.current, {
          render: 'Taking longer than usual...',
          type: toast.TYPE.INFO,
          isLoading: true,
          autoClose: false,
        });
      }, 15000);

      // Second update after 10 seconds
      const secondUpdate = setTimeout(() => {
        toast.update(toastIdRef.current, {
          render: 'Almost there...',
          type: toast.TYPE.INFO,
          isLoading: true,
          autoClose: false,
        });
      }, 30000);

      const clearToastUpdates = () => {
        clearTimeout(firstUpdate);
        clearTimeout(secondUpdate);
      };

      const shortDescription =
        selectedStartup?.companyProfile?.short_description ||
        'Default description';
      const industrySector =
        selectedStartup?.companyProfile?.industry_sector || 'Default sector';
      const currentStage =
        selectedStartup?.companyProfile?.current_stage || 'Not Available';
      const previousFunding =
        selectedStartup?.fundingInformation?.previous_funding || [];

      const companyProfile = {
        id: selectedStartup?.id,
        company_name: selectedStartup?.company_name,
        country: selectedStartup?.country,
        state_city: selectedStartup?.state_city,
        company_website: selectedStartup?.company_website,
        linkedin_profile: selectedStartup?.linkedin_profile,
        short_description: selectedStartup?.short_description,
        target_audience: selectedStartup?.target_audience,
        industry_sector: selectedStartup?.industry_sector,
        current_stage: selectedStartup?.current_stage,
        incorporation_date: selectedStartup?.incorporation_date,
      };

      try {
        // console.log('selectedStartup?.company_profile', selectedStartup);
        const result = await generateReport(
          companyProfile,
          selectedStartup?.funding_information,
          selectedStartup?.founder_information,
          selectedStartup?.business_details,
          selectedStartup?.company_documents[0],
          selectedStartup?.CTO_info,
          selectedStartup?.profiles,
          companyProfile?.short_description,
          companyProfile?.industry_sector,
          selectedStartup?.company_name || 'N/A',
          companyProfile?.current_stage,
          selectedStartup?.funding_information?.previous_funding
        );

        if (result.status === 'docs') {
          toast.update(toastIdRef.current, {
            render: (
              <div>
                Cannot generate report: Missing documents or incorrect format:
                <br />
                {result.message}
              </div>
            ),
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          });
          clearToastUpdates();
        } else {
          toast.update(toastIdRef.current, {
            render: 'Report generated successfully!',
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });
          clearToastUpdates();
          toastIdRef.current = null;

          try {
            const newWindow = window.open('', '_blank');

            if (newWindow) {
              newWindow.document.write(result.html);
              newWindow.document.close();
            } else {
              throw new Error(
                'Popup blocked. Please allow popups for this site.'
              );
            }
          } catch (error) {
            toast.update(toastIdRef.current, {
              render: `Cannot generate Report! ${error.message || error}`,
              type: 'error',
              isLoading: false,
              autoClose: 5000,
            });
            clearToastUpdates();
            toastIdRef.current = null;
          }
        }
      } catch (error) {
        toast.update(toastIdRef.current, {
          render: 'Cannot generate Report!',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        clearToastUpdates();
        toastIdRef.current = null;
        console.error('Error generating report:', error);
      }
    } else {
      setModalType(type);
      setIsModalOpen(true);
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
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 ${
            !startups ? 'filter blur-sm blur-container' : ''
          }`}
        >
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
              className='w-full px-3 py-2 border border-gray-300 rounded'
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
              className='w-full px-3 py-2 border border-gray-300 rounded'
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
              className='w-full px-3 py-2 border border-gray-300 rounded'
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
              className='w-full px-3 py-2 border border-gray-300 rounded'
            >
              {uniqueFundings.map((funding) => (
                <option key={funding} value={funding}>
                  {funding}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4 lg:mb-5'>
            <button
              onClick={handleClearFilters}
              className='py-2 px-4 bg-black-500 hover:bg-red-600 text-white rounded-md transition duration-200'
            >
              Clear All Filters
            </button>
          </div>
        </div>
        <div className='mb-4'>
          <h2
            className={`text-xl font-bold ${
              !startups ? 'filter blur-sm blur-container' : ''
            }`}
          >
            Registered Startups
          </h2>

          {startups ? (
            <div className={`overflow-x-auto`}>
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
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentStartups.map((startup, index) => {
                    const companyName = startup?.company_name || 'N/A';
                    const companyLogo = startup?.profiles?.company_logo;
                    const founderName =
                      startup.founder_information?.founder_name || 'N/A';
                    const industrySector = startup.industry_sector || 'N/A';
                    const incorporationDate = startup.incorporation_date
                      ? new Date(
                          startup.incorporation_date
                        ).toLocaleDateString()
                      : 'N/A';
                    const teamSize = startup.team_size || 'N/A';
                    const currentStage = startup.current_stage || 'N/A';
                    const fundingStatus = startup.funding_information
                      ?.total_funding_ask
                      ? 'Funded'
                      : 'Not Funded';

                    // Fetch the current status from the backend
                    const currentStatus = startup.status || 'evaluated'; // Default to 'evaluated' if status is not defined

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
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt={companyName}
                              className='w-10 h-10 object-contain rounded'
                            />
                          ) : (
                            <div className='w-10 h-10 bg-gray-200 flex items-center justify-center rounded'>
                              N/A
                            </div>
                          )}
                          <div>
                            <span className='text-black-500 hover:underline cursor-pointer'>
                              {companyName}
                            </span>
                            <p className='text-gray-500 text-xs'>
                              {startup.country
                                ? (() => {
                                    try {
                                      const parsed = JSON.parse(
                                        startup.country
                                      );
                                      return parsed.label || 'N/A';
                                    } catch (e) {
                                      return 'N/A';
                                    }
                                  })()
                                : 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {founderName}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {industrySector}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {incorporationDate}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {teamSize}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {currentStage}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {fundingStatus}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          <select
                            value={currentStatus} // Set fetched status as the default value
                            onClick={(e) => e.stopPropagation()} // Prevent row click when dropdown is clicked
                            onMouseDown={(e) => e.stopPropagation()} // Prevent mousedown event propagation
                            onChange={(e) => {
                              e.stopPropagation(); // Prevent row click when dropdown value is changed
                              handleStatusChange(
                                e.target.value,
                                startup.id,
                                user?.id
                              ); // Handle status change logic
                            }}
                            className='mt-1 block w-full mr-10 pl-4 pr-2 py-2.5 text-base bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition duration-150 ease-in-out sm:text-sm'
                          >
                            <option value='curated_deal' className='py-2 px-3'>
                              Curated Deal
                            </option>
                            <option value='evaluated' className='py-2 px-3'>
                              Evaluated
                            </option>
                            <option value='meeting_done' className='py-2 px-3'>
                              Meeting Done
                            </option>
                            <option
                              value='moving_forward'
                              className='py-2 px-3'
                            >
                              Moving Forward
                            </option>
                            <option value='rejected' className='py-2 px-3'>
                              Rejected
                            </option>
                            <option value='investment' className='py-2 px-3'>
                              Investment
                            </option>
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
            <div className='absolute inset-0 flex justify-center items-center flex-col z-10'>
              <div className='bg-[#1a235e] text-white p-4 rounded shadow text-center'>
                <p className='text-lg font-bold mb-2'>
                  Our Investment Banker will connect with you soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={!!selectedStartup} onClose={handleCloseModal}>
        {selectedStartup && (
          <div className='flex flex-col lg:flex-row lg:space-x-4 w-full h-full max-h-[70vh]'>
            {/* Left side */}
            <div className='flex-none lg:w-2/5 p-4 border-r border-gray-300 flex flex-col items-center'>
              <div className='mb-4 flex flex-col items-center'>
                {selectedStartup?.profiles?.company_logo && (
                  <img
                    src={selectedStartup?.profiles?.company_logo}
                    alt={selectedStartup.company_profile?.company_name}
                    className='w-32 h-32 object-contain mb-4'
                  />
                )}
                <h2 className='text-2xl font-bold mb-2 text-center'>
                  {selectedStartup?.company_name || 'N/A'}
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
                        selectedStartup?.id,
                        user?.id,
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
                                ? selectedStartup?.short_description
                                : `${selectedStartup?.short_description?.slice(
                                    0,
                                    100
                                  )}...`}
                              {selectedStartup?.short_description?.length >
                                100 && (
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
                              {selectedStartup?.incorporation_date
                                ? new Date(
                                    selectedStartup.incorporation_date
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
                              {selectedStartup?.country
                                ? JSON.parse(selectedStartup.country).label
                                : 'Not Provided'}
                              , {selectedStartup?.state_city || 'Not Provided'}
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
                              {selectedStartup?.office_address || 'N/A'}
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
                              {selectedStartup?.industry_sector || 'N/A'}
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
                              {selectedStartup?.team_size || 'N/A'}
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
                              {selectedStartup?.current_stage || 'N/A'}
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
                              {selectedStartup?.target_audience || 'N/A'}
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
                                ? selectedStartup?.usp_moat
                                : `${selectedStartup?.usp_moat?.slice(
                                    0,
                                    100
                                  )}...`}
                              {selectedStartup?.usp_moat?.length > 100 && (
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
                                href={selectedStartup?.company_website}
                                className='text-blue-600 hover:underline'
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {selectedStartup?.company_website || 'N/A'}
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
                                href={selectedStartup?.linkedin_profile}
                                className='text-blue-600 hover:underline'
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                {selectedStartup?.linkedin_profile || 'N/A'}
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
                              {selectedStartup?.media || 'N/A'}
                            </div>
                          </div>
                        </li>

                        {/* Social Media Handles */}
                        {selectedStartup?.social_media_handles?.map(
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
                        {selectedStartup?.media_presence?.map(
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
                          {selectedStartup?.founder_information?.founder_name ||
                            'Not provided'}
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
                          {selectedStartup?.founder_information
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
                          {selectedStartup?.founder_information
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
                              selectedStartup?.founder_information
                                ?.founder_linkedin
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.founder_information
                              ?.founder_linkedin || 'Not provided'}
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
                          {selectedStartup?.founder_information?.college_name ||
                            'Not provided'}
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
                          {selectedStartup?.founder_information
                            ?.graduation_year || 'Not provided'}
                        </div>
                      </div>
                    </li>

                    {/* Advisors Section */}
                    {selectedStartup?.founder_information?.advisors?.map(
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
                    {selectedStartup?.founder_information?.co_founders?.map(
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
                            selectedStartup?.founder_information
                              ?.co_founder_agreement || '#'
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          {selectedStartup?.founder_information
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
                          {selectedStartup?.CTO_info?.cto_name ||
                            'Not provided'}
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
                          {selectedStartup?.CTO_info?.cto_email ||
                            'Not provided'}
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
                          {selectedStartup?.CTO_info?.cto_mobile ||
                            'Not provided'}
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
                              selectedStartup?.CTO_info?.cto_linkedin || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info?.cto_linkedin ||
                              'Not provided'}
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
                          {selectedStartup?.CTO_info?.tech_team_size ||
                            'Not provided'}
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
                              selectedStartup?.CTO_info?.mobile_app_link_ios ||
                              '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info?.mobile_app_link_ios ||
                              'Not provided'}
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
                              selectedStartup?.CTO_info
                                ?.mobile_app_link_android || '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info
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
                              selectedStartup?.CTO_info?.technology_roadmap ||
                              '#'
                            }
                            className='text-blue-600 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {selectedStartup?.CTO_info?.technology_roadmap
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
                          {selectedStartup?.business_details
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
                          {selectedStartup?.business_details?.new_Customers ||
                            'N/A'}
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
                          {selectedStartup?.business_details
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
                          {selectedStartup?.business_details
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
                          {selectedStartup?.funding_information
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
                          {selectedStartup?.funding_information
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
                          {selectedStartup?.funding_information
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
                          {selectedStartup?.funding_information?.equity_split ||
                            'N/A'}
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
                          {selectedStartup?.funding_information
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
                          {selectedStartup?.funding_information?.arr || 'N/A'}
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
                          {selectedStartup?.funding_information?.mrr || 'N/A'}
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
                          {selectedStartup?.funding_information
                            ?.current_cap_table ? (
                            <a
                              href={
                                selectedStartup?.funding_information
                                  ?.current_cap_table || '#'
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
                                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700'>
                                  {selectedStartup?.funding_information?.previous_funding?.map(
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
                                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700'>
                                  {selectedStartup?.funding_information?.cap_table?.map(
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
                    {renderDocumentLink(
                      'Certificate of Incorporation',
                      selectedStartup?.company_documents[0]
                        ?.certificate_of_incorporation
                    )}
                    {renderDocumentLink(
                      'GST Certificate',
                      selectedStartup?.company_documents[0]?.gst_certificate
                    )}
                    {renderDocumentLink(
                      'Trademark',
                      selectedStartup?.company_documents[0]?.trademark
                    )}
                    {renderDocumentLink(
                      'Copyright',
                      selectedStartup?.company_documents[0]?.copyright
                    )}
                    {renderDocumentLink(
                      'Patent',
                      selectedStartup?.company_documents[0]?.patent
                    )}
                    {renderDocumentLink(
                      'Startup India Certificate',
                      selectedStartup?.company_documents[0]
                        ?.startup_india_certificate
                    )}
                    {renderDocumentLink(
                      'Due Diligence Report',
                      selectedStartup?.company_documents[0]
                        ?.due_diligence_report
                    )}
                    {renderDocumentLink(
                      'Business Valuation Report',
                      selectedStartup?.company_documents[0]
                        ?.business_valuation_report
                    )}
                    {renderDocumentLink(
                      'MIS',
                      selectedStartup?.company_documents[0]?.mis
                    )}
                    {renderDocumentLink(
                      'Financial Projections',
                      selectedStartup?.company_documents[0]
                        ?.financial_projections
                    )}
                    {renderDocumentLink(
                      'Balance Sheet',
                      selectedStartup?.company_documents[0]?.balance_sheet
                    )}
                    {renderDocumentLink(
                      'P&L Statement',
                      selectedStartup?.company_documents[0]?.pl_statement
                    )}
                    {renderDocumentLink(
                      'Cashflow Statement',
                      selectedStartup?.company_documents[0]?.cashflow_statement
                    )}
                    {renderDocumentLink(
                      'Pitch Deck',
                      selectedStartup?.company_documents[0]?.pitch_deck
                    )}
                    {renderDocumentLink(
                      'Video Pitch',
                      selectedStartup?.company_documents[0]?.video_pitch
                    )}
                    {renderDocumentLink(
                      'SHA (Previous/Existing Round)',
                      selectedStartup?.company_documents[0]?.sha
                    )}
                    {renderDocumentLink(
                      'Termsheet (Previous/Existing Round)',
                      selectedStartup?.company_documents[0]?.termsheet
                    )}
                    {renderDocumentLink(
                      'Employment Agreement',
                      selectedStartup?.company_documents[0]
                        ?.employment_agreement
                    )}
                    {renderDocumentLink(
                      'MoU',
                      selectedStartup?.company_documents[0]?.mou
                    )}
                    {renderDocumentLink(
                      'NDA',
                      selectedStartup?.company_documents[0]?.nda
                    )}
                  </div>
                </div>
              )}

              <div className='flex gap-4 mt-4'>
                <button
                  className={`rounded-md px-4 border text-white ${
                    connectionStatus === 'connected'
                      ? 'bg-gray-500 cursor-not-allowed' // Disabled state
                      : connectionStatus === 'connection_sent'
                      ? 'bg-success-500'
                      : 'bg-blue-500'
                  }`}
                  onClick={() => {
                    if (connectionStatus === 'connect') {
                      setShowForm(true);
                    }
                  }}
                  disabled={
                    isLoading ||
                    connectionStatus === 'connected' ||
                    connectionStatus === 'connection_sent'
                  }
                >
                  {isLoading
                    ? 'Loading...'
                    : connectionStatus === 'connected'
                    ? 'Connected'
                    : connectionStatus === 'connection_sent'
                    ? 'Connection Sent'
                    : 'Connect'}
                </button>

                <button className='rounded-md px-4 border bg-danger-500 text-white'>
                  Reject
                </button>
                <button className='rounded-md  px-4 border bg-info-500 text-white'>
                  Evaluate
                </button>
                <button
                  className='text-sm rounded-md  px-4 border bg-info-500 text-white'
                  onClick={() => {
                    handleImageClick('investment', selectedStartup);
                  }}
                >
                  Investment Readiness Report
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <style jsx>{`
        .blur {
          filter: blur(5px);
        }
        .z-10 {
          z-index: 10;
        }
      `}</style>
    </>
  );
};

export default CuratedDealflow;
