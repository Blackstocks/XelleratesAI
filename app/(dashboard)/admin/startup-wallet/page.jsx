"use client";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import useUserDetails from "@/hooks/useUserDetails";
import useStartupsRawApproved from "@/hooks/useStartupsRawApproved";
import Loading from "@/app/loading";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseclient";
import WalletModal from "@/components/WalletModal"; // Correct import path

const StartupWallet = () => {
  const { user, loading: userLoading } = useUserDetails();
  const { startups, loading: startupsLoading } = useStartupsRawApproved();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [walletDetails, setWalletDetails] = useState([]);
  const [walletCredit, setWalletCredit] = useState({});

  const handleOpenModal = (startup) => {
    setSelectedStartup(startup);
    setIsModalOpen(true);
    fetchWalletData(startup.id); // Fetch wallet data when opening modal
  };

  const handleCloseModal = () => {
    setSelectedStartup(null);
    setIsModalOpen(false);
  };

  const fetchWalletData = async (startupId) => {
    // Check if startupId is valid and correctly formatted
    if (!startupId || !/^[0-9a-fA-F-]{36}$/.test(startupId)) {
      console.error('Invalid startup_id format:', startupId);
      toast.error('Invalid startup ID format.');
      return; // Exit if the startup_id is not valid
    }
  
    try {
      // Fetch wallet payment data
      const { data: walletData, error } = await supabase
        .from('wallet_payments')
        .select('*')
        .eq('startup_id', startupId);
  
      if (error) {
        console.error('Error fetching wallet data:', error.message);
        toast.error('Error fetching wallet data.');
      } else {
        console.log('Fetched wallet data:', walletData); // Debugging: log fetched wallet data
        setWalletDetails(walletData);
      }
  
      // Fetch wallet credit data, handle empty result gracefully
      const { data: walletCreditData, error: walletCreditError } = await supabase
        .from('wallet_credits')
        .select('*')
        .eq('startup_id', startupId)
        .maybeSingle(); // Use maybeSingle() to handle cases where no row is found
  
      if (walletCreditError) {
        console.error('Error fetching wallet credit data:', walletCreditError.message);
        toast.error('Error fetching wallet credit data.');
      } else if (!walletCreditData) {
        console.log('No wallet credit data found for this user. Initializing with default values.');
        setWalletCredit({ credit_balance: 0, referral_balance: 0 }); // Initialize with default values
      } else {
        console.log('Fetched wallet credit data:', walletCreditData); // Debugging: log fetched wallet credit data
        setWalletCredit(walletCreditData);
      }
    } catch (error) {
      console.error('Unexpected error fetching wallet data:', error.message);
      toast.error('Unexpected error fetching wallet data.');
    }
  };
  

  const handleUpdateStartup = async (walletDetails) => {
    const { balance, cashback, referral, payment_method } = walletDetails;
    // Update the wallet details in the database
    const { error } = await supabase.from("wallets").upsert({
      startup_id: selectedStartup.id,
      balance,
      cashback,
      referral,
      payment_method,
      updated_at: new Date(),
    });

    if (error) {
      console.error("Error updating wallet details:", error.message);
      toast.error("Error updating wallet details.");
    } else {
      toast.success("Wallet details updated successfully!");
      handleCloseModal();
    }
  };

  if (userLoading || startupsLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Startup Wallet</title>
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Startup Wallet</h1>
        {startups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    S.No
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Startup Info
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Founder Name
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Sector
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Date of Incorporation
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Stage
                  </th>
                </tr>
              </thead>
              <tbody>
                {startups.map((startup, index) => {
                  const companyProfile = startup.company_profile;
                  const company_logos = startup?.company_logo;
                  const founderInfo = companyProfile?.founder_information;

                  return (
                    <tr
                      key={startup.id}
                      className={`hover:bg-gray-100 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      }`}
                      onClick={() => handleOpenModal(startup)}
                    >
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {index + 1}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm flex items-center space-x-2">
                        {company_logos ? (
                          <img
                            src={company_logos}
                            alt={companyProfile?.company_name}
                            className="w-10 h-10 object-contain rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded">
                            N/A
                          </div>
                        )}
                        <div>
                          <span className="text-black-500 hover:underline cursor-pointer">
                            {companyProfile?.company_name || "N/A"}
                          </span>
                          <p className="text-gray-500 text-xs">
                            {companyProfile?.country
                              ? (() => {
                                  try {
                                    const parsed = JSON.parse(
                                      companyProfile.country
                                    );
                                    return parsed.label || "N/A";
                                  } catch (e) {
                                    return "N/A";
                                  }
                                })()
                              : "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {founderInfo?.founder_name || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {companyProfile?.industry_sector || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {companyProfile?.incorporation_date
                          ? new Date(
                              companyProfile.incorporation_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {companyProfile?.current_stage || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No startups registered.</p>
        )}
      </main>
      <WalletModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleUpdateStartup}
        user={selectedStartup} // Pass the selected startup object
        walletDetails={walletDetails}
        walletCredit={walletCredit}
      />
    </>
  );
};

export default StartupWallet;
