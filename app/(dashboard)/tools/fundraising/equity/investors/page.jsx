"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import useUserDetails from "@/hooks/useUserDetails";
import useCompleteUserDetails from "@/hooks/useCompleUserDetails";
import Loading from "@/app/loading";
import { supabase } from "@/lib/supabaseclient";
import AddDealflow from "@/components/AddDealflow";

const InvestorDealflow = () => {
  const { user, loading: userLoading } = useUserDetails();
  const { profile, loading: profileLoading } = useCompleteUserDetails();
  const [investors, setInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [investorsLoading, setInvestorsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dealflowEntries, setDealflowEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    location: "",
    investmentType: "",
    sector: "",
    investmentStage: "",
  });
  const [connectClicked, setConnectClicked] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  const [assignedInvestors, setAssignedInvestors] = useState([]);
  const [filteredAssignedInvestors, setFilteredAssignedInvestors] = useState([]);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const itemsPerPage = 8;
  const router = useRouter();

  useEffect(() => {
    const fetchInvestors = async () => {
      setInvestorsLoading(true);
      try {
        const { data, error } = await supabase
          .from("investor_signup")
          .select("*");
        if (error) throw error;

        setInvestors(data);
        setFilteredInvestors(data); // Initialize filtered investors with all investors
      } catch (error) {
        console.error("Error fetching investors:", error.message);
      } finally {
        setInvestorsLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  useEffect(() => {
    const fetchDealflowEntries = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("add_dealflow")
            .select("*")
            .eq("user_id", user.id);

          if (error) throw error;

          setDealflowEntries(data);
        } catch (error) {
          console.error("Error fetching dealflow entries:", error.message);
        }
      }
    };

    fetchDealflowEntries();
  }, [user]);

  useEffect(() => {
    if (user) {
      const checkConnectionStatus = async () => {
        try {
          const { data, error } = await supabase
            .from("connected_startup_equity")
            .select("has_connected, id, inputToStartup")
            .eq("user_id", user.id)
            .single();
          if (error) throw error;

          setHasConnected(data.has_connected);

          if (data.has_connected) {
            await fetchAssignedInvestors(data.id, data.inputToStartup);
          }
        } catch (error) {
          console.error("Error checking connection status:", error.message);
        }
      };

      checkConnectionStatus();

      const fetchAssignedInvestors = async (id, inputToStartup) => {
        try {
          const { data, error } = await supabase
            .from("assigned_dealflow")
            .select(
              `
              investor_signup (
                name,
                email,
                mobile,
                sectors,
                typeof,
                cheque_size,
                investment_stage,
                Geography,
                company_name
              ),
              input_to_startup,
              status,
              comments,
              id
            `
            )
            .eq("startup_id", id);

          if (error) throw error;

          // Map the inputToStartup to each assigned investor
          const mappedInvestors = data.map((investor) => ({
            ...investor,
            suggestion: inputToStartup, // Assign the suggestion value
          }));

          setAssignedInvestors(mappedInvestors);
          setFilteredAssignedInvestors(mappedInvestors); // Initialize filtered assigned investors with all assigned investors
        } catch (error) {
          console.error("Error fetching assigned investors:", error.message);
        }
      };
    }
  }, [user, hasConnected]);

  useEffect(() => {
    // Apply filters and search to both the main and assigned investors
    const applyFilters = (investorsList) => {
      return investorsList.filter((investor) => {
        const matchesLocation =
          !filters.location ||
          investor.Geography?.split(",").map(loc => loc.trim()).includes(filters.location);
        const matchesInvestmentType =
          !filters.investmentType ||
          investor.typeof?.split(",").map(type => type.trim()).includes(filters.investmentType);
        const matchesSector =
          !filters.sector ||
          investor.sectors?.split(",").map(sec => sec.trim()).includes(filters.sector);
        const matchesInvestmentStage =
          !filters.investmentStage ||
          investor.investment_stage?.split(",").map(stage => stage.trim()).includes(filters.investmentStage);

        const matchesSearch =
          !searchQuery ||
          investor.name?.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          matchesLocation &&
          matchesInvestmentType &&
          matchesSector &&
          matchesInvestmentStage &&
          matchesSearch
        );
      });
    };

    setFilteredInvestors(applyFilters(investors));
    setFilteredAssignedInvestors(applyFilters(assignedInvestors));
    setCurrentPage(1); // Reset to first page when filters or search change
  }, [filters, searchQuery, investors, assignedInvestors]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      location: "",
      investmentType: "",
      sector: "",
      investmentStage: "",
    });
    setSearchQuery(""); // Clear search query as well
  };

  const handleAddDealflow = (newEntry) => {
    setDealflowEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const handleUpdateDealflow = (updatedEntry) => {
    setDealflowEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
  };

  const totalPages = Math.ceil(filteredInvestors.length / itemsPerPage);
  const currentInvestors = filteredInvestors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (userLoading || profileLoading || investorsLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Investor Connect</title>
      </Head>
      <main
        className={`container mb-1 p-4 relative ${showModal ? "blur" : ""}`}
      >
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => router.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
        <div className="flex justify-end mb-1">
          <button
            onClick={() => setShowModal(true)}
            className="py-2 px-4 bg-red-500 text-white rounded"
          >
            Add Dealflow
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-center">
          Investor Connect
        </h1>
        <p className="mb-2 text-center">
          Welcome to the Investor Connect page. Here you can find information
          about investors interested in various sectors and stages.
        </p>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Location</option>
                {Array.from(new Set(investors.flatMap(inv => inv.Geography?.split(',').map(loc => loc.trim())))).sort().map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Investment Type
              </label>
              <select
                name="investmentType"
                value={filters.investmentType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Investment Type</option>
                {Array.from(new Set(investors.flatMap(inv => inv.typeof?.split(',').map(type => type.trim())))).sort().map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sector</label>
              <select
                name="sector"
                value={filters.sector}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Sector</option>
                {Array.from(new Set(investors.flatMap(inv => inv.sectors?.split(',').map(sec => sec.trim())))).sort().map((sector, index) => (
                  <option key={index} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Investment Stage
              </label>
              <select
                name="investmentStage"
                value={filters.investmentStage}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Investment Stage</option>
                {Array.from(new Set(investors.flatMap(inv => inv.investment_stage?.split(',').map(stage => stage.trim())))).sort().map((stage, index) => (
                  <option key={index} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded transition duration-200 w-1/2"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Search</h2>
          <input
            type="text"
            placeholder="Search by Investor Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {hasConnected ? (
          <div className="overflow-x-auto">
            <h2 className="text-xl font-bold mb-2">Assigned Investors</h2>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Investor Info
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Location
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Investment Type
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Sector
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Investment Stage
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Company Name
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Suggestion
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Status
                  </th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignedInvestors.map((investor, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-gray-100 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <td className="py-2 px-4 border-b border-gray-300">
                      {investor.investor_signup?.name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {investor.investor_signup?.Geography || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {investor.investor_signup?.typeof || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {investor.investor_signup?.sectors || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {investor.investor_signup?.investment_stage || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {investor.investor_signup?.company_name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {investor.input_to_startup || "N/A"}
                    </td>
                    <td
                      className="py-2 px-4 border-b border-gray-300"
                      style={{ minWidth: "150px" }}
                    >
                      {investor.status || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      <input
                        type="text"
                        value={investor.comments || ""}
                        onChange={(e) =>
                          handleCommentChange(investor.id, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        style={{ minWidth: "150px" }}
                        placeholder="Enter comments"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative mb-4">
            {connectClicked ? (
              <div className="absolute inset-0 flex justify-center items-center flex-col z-10">
                <div className="bg-[#1a235e] text-white p-4 rounded shadow text-center">
                  <p className="text-lg font-bold mb-2">
                    Our Investment Banker will connect with you soon.
                  </p>
                </div>
              </div>
            ) : filteredInvestors.length > 0 ? (
              <div className="absolute inset-0 flex justify-center items-center flex-col z-10">
                <div className="bg-[#1a235e] text-white p-4 rounded shadow text-center message-container">
                  <p className="text-lg font-bold mb-2">
                    We have identified {filteredInvestors.length} investors for
                    you.
                  </p>
                  <p className="text-md mb-4">
                    Connect with our investment banker.
                  </p>
                  <button
                    onClick={() => handleConnect("equity")}
                    className="py-2 px-4 bg-[#e7ad6c] text-white rounded transition duration-200"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex justify-center items-center flex-col z-10">
                <div className="bg-[#1a235e] text-white p-4 rounded shadow text-center message-container">
                  <p className="text-lg font-bold mb-2">
                    We have identified 0 investors for you.
                  </p>
                  <p className="text-md mb-4">
                    Connect with our investment banker.
                  </p>
                  <button
                    onClick={() => handleConnect("equity")}
                    className="py-2 px-4 bg-[#e7ad6c] text-white rounded transition duration-200"
                  >
                    Connect
                  </button>
                </div>
              </div>
            )}

            <div className={`overflow-x-auto ${!hasConnected && "blur-sm"}`}>
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      S.No
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Investor Info
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Location
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Investment Type
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Sector
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Investment Stage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvestors.map((investor, index) => (
                    <tr
                      key={investor.id}
                      className={`hover:bg-gray-100 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      }`}
                      onClick={() => {
                        setSelectedInvestor(investor);
                        setShowForm(false);
                      }}
                    >
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        <div>
                          <span className="text-black-500 hover:underline cursor-pointer">
                            {investor.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {investor.Geography || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {investor.typeof || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {investor.sectors || "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-300 text-sm">
                        {investor.investment_stage || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePreviousPage}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </main>
      <AddDealflow
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddDealflow={handleAddDealflow}
        onUpdateDealflow={handleUpdateDealflow}
        user={user}
        dealflowEntries={dealflowEntries}
      />
      {isMessageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#1a235e] text-white p-6 rounded-lg shadow-lg relative z-60">
            <p className="text-lg font-bold mb-4 text-center">
              Our investment banker will reach out to you shortly.
            </p>
            <button
              onClick={() => setIsMessageModalOpen(false)}
              className="block mx-auto py-2 px-4 bg-[#e7ad6c] text-white rounded"
            >
              Close
            </button>
          </div>
          <div
            className="fixed inset-0 bg-black opacity-50 z-50"
            onClick={() => setIsMessageModalOpen(false)}
          ></div>
        </div>
      )}
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

export default InvestorDealflow;
