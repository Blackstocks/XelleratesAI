'use client';
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import useUserDetails from '@/hooks/useUserDetails';
import useStartupsRawApproved from '@/hooks/useStartupsRawApproved';
import Loading from '@/app/loading';
import { toast } from 'react-toastify';
import { supabase } from '@/lib/supabaseclient';
import WalletModal from '@/components/WalletModal'; // Adjust the import path as needed

const StartupWallet = () => {
  const { user, loading: userLoading } = useUserDetails();
  const { startups, loading: startupsLoading } = useStartupsRawApproved();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [activeTab, setActiveTab] = useState('startupProfile');
  const [picker1, setPicker1] = useState(new Date());
  const [picker2, setPicker2] = useState(new Date());
  const [picker3, setPicker3] = useState(new Date());
  const [gstInformation, setGstInformation] = useState(null);
  const [loadingGstInformation, setLoadingGstInformation] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const toastIdRef = useRef(null);
  const itemsPerPage = 20;

  const fetchGstInformation = async (userId) => {
    console.log('Fetching GST information for user ID:', userId);
    setLoadingGstInformation(true);
    try {
      const { data, error } = await supabase
        .from('debt_gstin')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setGstInformation(data[0] || null);
    } catch (error) {
      console.error('Error fetching GST information:', error.message);
      setGstInformation(null);
    } finally {
      setLoadingGstInformation(false);
    }
  };

  const handleOpenModal = (startup) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStartup(null);
    setIsModalOpen(false);
  };

  const handleUpdateStartup = async (e) => {
    e.preventDefault();
    const updatedData = {
      company_name: e.target[0].value,
      // Add other fields here
    };

    // Update the startup details in the database
    const { error } = await supabase
      .from('company_profile')
      .update(updatedData)
      .eq('id', selectedStartup.id);

    if (error) {
      console.error('Error updating startup:', error.message);
      toast.error('Error updating startup details.');
    } else {
      toast.success('Startup details updated successfully!');
      handleCloseModal();
    }
  };

  if (userLoading || startupsLoading) {
    return <Loading />;
  }

  const totalPages = Math.ceil(startups.length / itemsPerPage);
  const currentStartups = startups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleExpressInterest = async (startupId, investorId, message, dateTime) => {
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
    }
  };

  return (
    <>
      <Head>
        <title>Startup Wallet</title>
      </Head>
      <main className='container mx-auto p-4'>
        <h1 className='text-3xl font-bold mb-4 text-center'>Startup Wallet</h1>
        {currentStartups.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-300'>
              <thead>
                <tr>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>S.No</th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>Startup Info</th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>Founder Name</th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>Sector</th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>Date of Incorporation</th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>Stage</th>
                </tr>
              </thead>
              <tbody>
                {currentStartups.map((startup, index) => {
                  const companyProfile = startup.company_profile;
                  const company_logos = startup?.company_logo;
                  const founderInfo = companyProfile?.founder_information;

                  return (
                    <tr
                      key={startup.id}
                      className={`hover:bg-gray-100 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                      }`}
                      onClick={() => handleOpenModal(startup)}
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
                                    const parsed = JSON.parse(companyProfile.country);
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
                        {founderInfo?.founder_name || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {companyProfile?.industry_sector || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {companyProfile?.incorporation_date
                          ? new Date(companyProfile.incorporation_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {companyProfile?.current_stage || 'N/A'}
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
      </main>
      <WalletModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleUpdateStartup}
        startup={selectedStartup}
      />
    </>
  );
};

export default StartupWallet;
