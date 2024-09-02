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
  const [loading, setLoading] = useState(false); // State for loading animation
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredStartups, setFilteredStartups] = useState(startups); // State for filtered startups

  useEffect(() => {
    // Filter startups based on search query
    setFilteredStartups(
      startups.filter((startup) =>
        startup.company_profile?.company_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, startups]);

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
    setLoading(true); // Start loading
    if (!startupId || !/^[0-9a-fA-F-]{36}$/.test(startupId)) {
      console.error("Invalid startup_id format:", startupId);
      toast.error("Invalid startup ID format.");
      setLoading(false); // End loading
      return;
    }

    try {
      // Fetch wallet payment data
      const { data: walletData, error } = await supabase
        .from("wallet_payments")
        .select("*")
        .eq("startup_id", startupId);

      if (error) {
        console.error("Error fetching wallet data:", error.message);
        toast.error("Error fetching wallet data.");
      } else {
        setWalletDetails(walletData);
      }

      // Fetch wallet credit data, handle empty result gracefully
      const { data: walletCreditData, error: walletCreditError } =
        await supabase
          .from("wallet_credits")
          .select("*")
          .eq("startup_id", startupId)
          .maybeSingle();

      if (walletCreditError) {
        console.error(
          "Error fetching wallet credit data:",
          walletCreditError.message
        );
        toast.error("Error fetching wallet credit data.");
      } else if (!walletCreditData) {
        setWalletCredit({ credit_balance: 0, referral_balance: 0 }); // Initialize with default values
      } else {
        setWalletCredit(walletCreditData);
      }
    } catch (error) {
      console.error("Unexpected error fetching wallet data:", error.message);
      toast.error("Unexpected error fetching wallet data.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleUpdateStartup = async (walletDetails) => {
    const { balance, cashback, referral, payment_method } = walletDetails;
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

  const isExpiringSoon = (date) => {
    const today = new Date();
    const paymentDate = new Date(date);
    const timeDiff = paymentDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysRemaining <= 7; // Highlight if payment is due in 7 days or less
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-center">Startup Wallet</h1>
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search startups..."
            className="p-2 border border-gray-300 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredStartups.length > 0 ? (
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
                {filteredStartups.map((startup, index) => {
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
        user={selectedStartup}
        walletDetails={walletDetails}
        walletCredit={walletCredit}
      />
    </>
  );
};

export default StartupWallet;
