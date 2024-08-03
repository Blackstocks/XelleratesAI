'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useCompleteUserDetails from '@/hooks/useCompletionPercentage';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import Textarea from '@/components/ui/Textarea';
import { supabase } from '@/lib/supabaseclient';

const InvestorDealflow = () => {
  const { user, loading: userLoading } = useUserDetails();
  const [investors, setInvestors] = useState([]);
  const [investorsLoading, setInvestorsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedInvestmentType, setSelectedInvestmentType] = useState('All');
  const [selectedChequeSize, setSelectedChequeSize] = useState('All');
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const { companyProfile } = useCompleteUserDetails();

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchInvestors = async () => {
      setInvestorsLoading(true);
      try {
        const { data, error } = await supabase
          .from('investor_signup')
          .select('*');
        if (error) throw error;
        setInvestors(data);
      } catch (error) {
        console.error('Error fetching investors:', error.message);
      } finally {
        setInvestorsLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSector, selectedStage, selectedLocation, selectedInvestmentType, selectedChequeSize]);

  if (userLoading || investorsLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  const uniqueSectors = [
    'All',
    ...new Set(investors.map((investor) => investor.sectors).filter(Boolean)),
  ];

  const uniqueStages = [
    'All',
    ...new Set(
      investors.map((investor) => investor.investment_stage).filter(Boolean)
    ),
  ];

  const uniqueLocations = [
    'All',
    ...new Set(
      investors
        .map((investor) => {
          try {
            const geographyData = JSON.parse(investor.Geography || '{}').label;
            return geographyData || 'N/A';
          } catch (error) {
            return 'N/A';
          }
        })
        .filter((location) => location !== 'N/A')
    ),
  ];

  const uniqueInvestmentTypes = [
    'All',
    ...new Set(investors.map((investor) => investor.typeof).filter(Boolean)),
  ];

  const uniqueChequeSizes = [
    'All',
    ...new Set(investors.map((investor) => investor.cheque_size).filter(Boolean)),
  ];

  const filteredInvestors = investors.filter((investor) => {
    return (
      (selectedSector === 'All' || investor.sectors === selectedSector) &&
      (selectedStage === 'All' || investor.investment_stage === selectedStage) &&
      (selectedLocation === 'All' ||
        (investor.Geography &&
          (() => {
            try {
              return JSON.parse(investor.Geography || '{}').label === selectedLocation;
            } catch (error) {
              return false;
            }
          })())) &&
      (selectedInvestmentType === 'All' || investor.typeof === selectedInvestmentType) &&
      (selectedChequeSize === 'All' || investor.cheque_size === selectedChequeSize)
    );
  });

  const totalPages = Math.ceil(filteredInvestors.length / itemsPerPage);
  const currentInvestors = filteredInvestors.slice(
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
    setSelectedInvestor(null);
  };

  const handleClearFilters = () => {
    setSelectedSector('All');
    setSelectedStage('All');
    setSelectedLocation('All');
    setSelectedInvestmentType('All');
    setSelectedChequeSize('All');
  };

  const handleExpressInterest = async (
    startupId,
    investorId,
    message,
    dateTime
  ) => {
    try {
      const response = await fetch('/api/express-interest_startup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: startupId,
          receiverId: investorId,
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
      setShowForm(false);
    } catch (error) {
      console.error('Unexpected error sending interest notification:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Investor Connect</title>
      </Head>
      <main className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-4 text-center'>
          Investor Connect
        </h1>
        <p className='mb-6 text-center'>
          Welcome to the Investor Connect page. Here you can find information
          about investors interested in various sectors and stages.
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
              htmlFor='investment-type-filter'
              className='block text-sm font-medium text-gray-700'
            >
              Investment Type:
            </label>
            <select
              id='investment-type-filter'
              value={selectedInvestmentType}
              onChange={(e) => setSelectedInvestmentType(e.target.value)}
              className='mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
            >
              {uniqueInvestmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-4 lg:mb-0'>
            <label
              htmlFor='cheque-size-filter'
              className='block text-sm font-medium text-gray-700'
            >
              Cheque Size:
            </label>
            <select
              id='cheque-size-filter'
              value={selectedChequeSize}
              onChange={(e) => setSelectedChequeSize(e.target.value)}
              className='mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
            >
              {uniqueChequeSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
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
          <h2 className='text-xl font-bold'>Registered Investors</h2>
          {currentInvestors.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full bg-white border border-gray-300'>
                <thead>
                  <tr>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      S.No
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Investor Info
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Sector
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Investment Stage
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Investment Type
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Cheque Size
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvestors.map((investor, index) => (
                    <tr
                      key={investor.id}
                      className={`hover:bg-gray-100 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedInvestor(investor);
                        setShowForm(false);
                      }}
                    >
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        <div>
                          <span className='text-black-500 hover:underline cursor-pointer'>
                            {investor.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {investor.sectors || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {investor.investment_stage || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {investor.typeof || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {investor.cheque_size || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {(() => {
                          try {
                            return JSON.parse(investor.Geography).label || 'N/A';
                          } catch (error) {
                            return 'N/A';
                          }
                        })()}
                      </td>
                    </tr>
                  ))}
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
            <p>No investors registered.</p>
          )}
        </div>
      </main>
      <Modal isOpen={!!selectedInvestor} onClose={handleCloseModal}>
        {selectedInvestor && (
          <div className='flex flex-col lg:flex-row lg:space-x-4 w-full h-full overflow-auto'>
            <div className='flex-none lg:w-2/5 p-4 border-r border-gray-300 flex flex-col items-center'>
              <div className='mb-4 flex flex-col items-center'>
                <h2 className='text-2xl font-bold mb-2 text-center'>
                  {selectedInvestor.name || 'N/A'}
                </h2>
              </div>
              <div className='space-y-2 w-full'>
                <button
                  className='w-full rounded-lg py-2 px-4 border bg-[#14213d] text-white'
                  onClick={() => setShowForm(true)}
                >
                  Express Interest
                </button>
              </div>
            </div>
            <div className='flex-1 p-4 overflow-y-auto'>
              {showForm ? (
                <div className='express-interest-form mt-4'>
                  <Textarea
                    label={'Message to the Investor'}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder='Write your message here'
                    className='w-full p-2 border rounded'
                  ></Textarea>
                  <button
                    className='mr-1rem rounded-md py-2 px-4 border bg-[#14213d] text-white'
                    onClick={() => {
                      handleExpressInterest(
                        companyProfile?.id,
                        selectedInvestor?.id,
                        message
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
                <div>
                  <h3 className='text-xl font-bold mb-4'>Investor Profile</h3>
                  <p className='mb-4'>
                    <strong>Name:</strong> {selectedInvestor.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Type of Investment:</strong>{' '}
                    {selectedInvestor.typeof || 'N/A'}
                  </p>
                  <p>
                    <strong>Cheque Size:</strong>{' '}
                    {selectedInvestor.cheque_size || 'N/A'}
                  </p>
                  <p>
                    <strong>Investment Thesis:</strong>{' '}
                    {selectedInvestor.investment_thesis || 'N/A'}
                  </p>
                  <p>
                    <strong>Sectors:</strong>{' '}
                    {selectedInvestor.sectors || 'N/A'}
                  </p>
                  <p>
                    <strong>Investment Strategy:</strong>{' '}
                    {selectedInvestor.investment_stage || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default InvestorDealflow;
