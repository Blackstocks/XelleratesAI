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

  if (userLoading || investorsLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  const totalPages = Math.ceil(investors.length / itemsPerPage);
  const currentInvestors = investors.slice(
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
                      Location
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Investment Type
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Sector
                    </th>
                    <th className='py-4 px-4 border-b border-gray-300 text-left'>
                      Investment Stage
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
                        {investor.Geography || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {investor.typeof || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {investor.sectors || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {investor.investment_stage || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No investors registered.</p>
          )}
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
