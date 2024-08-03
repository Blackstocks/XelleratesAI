'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useInvestors from '@/hooks/useInvestors';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import Textarea from '@/components/ui/Textarea';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const InvestorDealflow = () => {
  const { user, loading: userLoading } = useUserDetails();
  const { investors, loading: investorsLoading } = useInvestors();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedInvestmentType, setSelectedInvestmentType] = useState('All');
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const { companyProfile } = useCompleteUserDetails();

  console.log('Investors:', investors);

  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSector, selectedStage, selectedLocation, selectedInvestmentType]);

  if (userLoading || investorsLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  const uniqueSectors = [
    'All',
    ...new Set(
      investors
        .flatMap(
          (investor) =>
            investor.investor_signup.map((signup) => signup.sectors) || 'N/A'
        )
        .filter((sector) => sector !== 'N/A')
    ),
  ];

  const uniqueStages = [
    'All',
    ...new Set(
      investors
        .flatMap(
          (investor) =>
            investor.investor_signup.map((signup) => signup.investment_stage) ||
            'N/A'
        )
        .filter((stage) => stage !== 'N/A')
    ),
  ];

  const uniqueLocations = [
    'All',
    ...new Set(
      investors
        .flatMap((investor) => {
          try {
            const geographyData = investor.investor_signup
              .map((signup) => signup.Geography)
              .filter(Boolean);
            return geographyData.length > 0
              ? JSON.parse(geographyData[0] || '{}').label || 'N/A'
              : 'N/A';
          } catch (error) {
            return 'N/A';
          }
        })
        .filter((location) => location !== 'N/A')
    ),
  ];

  const uniqueInvestmentTypes = [
    'All',
    ...new Set(
      investors
        .flatMap(
          (investor) =>
            investor.investor_signup.map((signup) => signup.typeof) || 'N/A'
        )
        .filter((type) => type !== 'N/A')
    ),
  ];

  const filteredInvestors = investors.filter((investor) => {
    const investorData = investor.investor_signup[0] || {};
    return (
      (selectedSector === 'All' || investorData.sectors === selectedSector) &&
      (selectedStage === 'All' ||
        investorData.investment_stage === selectedStage) &&
      (selectedLocation === 'All' ||
        (investorData.Geography &&
          JSON.parse(investorData.Geography || '{}').label ===
            selectedLocation)) &&
      (selectedInvestmentType === 'All' ||
        investorData.typeof === selectedInvestmentType)
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
        <title>Investor Dealflow</title>
      </Head>
      <main className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-4 text-center'>
          Investor Dealflow
        </h1>
        <p className='mb-6 text-center'>
          Welcome to the Investor Dealflow page. Here you can find information
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
                  {currentInvestors.map((investor, index) => {
                    const investorData = investor.investor_signup[0] || {};
                    return (
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
                          {investorData.investment_stage || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {investorData.typeof || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {investorData.cheque_size || 'N/A'}
                        </td>
                        <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                          {investorData.Geography
                            ? JSON.parse(investorData.Geography).label
                            : 'N/A'}
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
                    {selectedInvestor.investor_signup[0]?.typeof || 'N/A'}
                  </p>
                  <p>
                    <strong>Cheque Size:</strong>{' '}
                    {selectedInvestor.investor_signup[0]?.cheque_size || 'N/A'}
                  </p>
                  <p>
                    <strong>Investment Thesis:</strong>{' '}
                    {selectedInvestor.investor_signup[0]?.investment_thesis ||
                      'N/A'}
                  </p>
                  <p>
                    <strong>Sectors:</strong>{' '}
                    {selectedInvestor.investor_signup[0]?.sectors || 'N/A'}
                  </p>
                  <p>
                    <strong>Investment Strategy:</strong>{' '}
                    {selectedInvestor.investor_signup[0]?.investment_stage ||
                      'N/A'}
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
