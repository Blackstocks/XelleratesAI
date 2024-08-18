"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseclient";
import AssignInvestorsModal from "@/components/AssignInvestorsModal";
import ViewAssignedInvestorsModal from "@/components/ViewAssignedInvestorsModal";

const Fundraising = () => {
  const [connectedStartups, setConnectedStartups] = useState([]);
  const [newDealflows, setNewDealflows] = useState([]); // State for new dealflow entries
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("equity");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [comments, setComments] = useState({}); // State to track comments
  // const [showGSTINModal, setShowGSTINModal] = useState(false);
  // const [selectedGSTINData, setSelectedGSTINData] = useState(null);

  useEffect(() => {
    const fetchConnectedStartups = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("connected_startups")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setConnectedStartups(data);
        // Initialize comments state from the fetched data
        const initialComments = data.reduce((acc, startup) => {
          acc[startup.id] = startup.comment || "";
          return acc;
        }, {});
        setComments(initialComments);
      } catch (error) {
        console.error("Error fetching connected startups:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchNewDealflows = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("add_dealflow")
          .select("*")
          .eq("is_updated", false) // Only fetch entries that haven't been updated
          .order("created_at", { ascending: false });

        if (error) throw error;

        setNewDealflows(data);
      } catch (error) {
        console.error("Error fetching new dealflows:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedStartups();
    fetchNewDealflows(); // Fetch new dealflows when component mounts
  }, []);

  const openAssignModal = (startup) => {
    setSelectedStartup(startup);
    setShowAssignModal(true);
  };

  const openViewModal = (startup) => {
    setSelectedStartup(startup);
    setShowViewModal(true);
  };

  const handleSaveAssignedInvestors = async (investors) => {
    if (!selectedStartup) {
      console.error("No startup selected");
      return;
    }

    const selectedStartupId = selectedStartup.id;

    const assignedData = investors.map((investor) => ({
      startup_id: selectedStartupId,
      investor_id: investor.id,
      created_at: new Date(),
    }));

    try {
      const { error } = await supabase
        .from("assigned_dealflow")
        .insert(assignedData);

      if (error) {
        throw error;
      }

      setShowAssignModal(false);
    } catch (error) {
      console.error("Error saving assigned investors:", error.message);
    }
  };

  const handleUpdateDealflow = async (dealflow) => {
    try {
      // Insert the dealflow entry into the investor_signup table
      const { error: insertError } = await supabase
        .from("investor_signup")
        .insert([
          {
            name: dealflow.name,
            email: dealflow.email,
            mobile: dealflow.mobile,
            typeof: dealflow.typeof,
            investment_thesis: dealflow.investment_thesis,
            cheque_size: dealflow.cheque_size,
            sectors: dealflow.sector,
            investment_stage: dealflow.investment_stage,
            created_at: new Date(),
            profile_id: dealflow.user_id,
            id: dealflow.id,
            Geography: dealflow.Geography,
            company_name: dealflow.company_name,
          },
        ]);

      if (insertError) throw insertError;

      // Update the is_updated status in the add_dealflow table
      const { error: updateError } = await supabase
        .from("add_dealflow")
        .update({ is_updated: true })
        .eq("id", dealflow.id);

      if (updateError) throw updateError;

      // Remove the entry from the newDealflows state
      setNewDealflows((prevDealflows) =>
        prevDealflows.filter((df) => df.id !== dealflow.id)
      );
    } catch (error) {
      console.error("Error updating dealflow:", error.message);
    }
  };

  const handleCommentChange = (startupId, comment) => {
    setComments((prevComments) => ({
      ...prevComments,
      [startupId]: comment,
    }));
  };

  const saveComment = async (startupId) => {
    try {
      const comment = comments[startupId];
      const { error } = await supabase
        .from("connected_startups")
        .update({ comment })
        .eq("id", startupId);

      if (error) throw error;

      console.log("Comment saved successfully");
    } catch (error) {
      console.error("Error saving comment:", error.message);
    }
  };

  // const openGSTINModal = async (userId) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("debt_gstin")
  //       .select("*")
  //       .eq("user_id", userId);

  //     if (error) throw error;

  //     setSelectedGSTINData(data);
  //     setShowGSTINModal(true);
  //   } catch (error) {
  //     console.error("Error fetching GSTIN information:", error.message);
  //   }
  // };

  const filteredStartups = connectedStartups.filter(
    (startup) => startup.user_type === selectedType
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Fundraising</h1>
      <div className="mb-4">
        <button
          onClick={() => setSelectedType("equity")}
          className={`py-2 px-4 rounded mr-2 ${
            selectedType === "equity" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Equity
        </button>
        <button
          onClick={() => setSelectedType("debt")}
          className={`py-2 px-4 rounded mr-2 ${
            selectedType === "debt" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Debt
        </button>
        <button
          onClick={() => setSelectedType("newDealflow")}
          className={`py-2 px-4 rounded ${
            selectedType === "newDealflow"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          New Dealflow
        </button>
      </div>

      {selectedType === "newDealflow" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Name
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Email
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Mobile
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Investment Thesis
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Cheque Size
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
                  Type Of
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Geography
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Update
                </th>
              </tr>
            </thead>
            <tbody>
              {newDealflows.map((dealflow, index) => (
                <tr
                  key={dealflow.id}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.email}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.mobile}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.investment_thesis}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.cheque_size}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.sector}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.investment_stage}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.company_name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.typeof}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    {dealflow.Geography}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">
                    <button
                      onClick={() => handleUpdateDealflow(dealflow)}
                      className="py-1 px-2 bg-blue-500 text-white rounded"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Company Name
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Founder Name
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Email
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Mobile
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                LinkedIn
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Comment
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                {selectedType === "debt" ? "Requested Debt Investor" : "Assign"}
              </th>
              {selectedType === "equity" && (
                <th className="py-4 px-4 border-b border-gray-300 text-left">
                  Assigned
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredStartups.map((startup, index) => (
              <tr
                key={startup.id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="py-2 px-4 border-b border-gray-300">
                  {startup.startup_name}
                </td>
                <td
                  className="py-2 px-4 border-b border-gray-300 cursor-pointer text-blue-500"
                  onClick={() =>
                    selectedType === "debt" && openGSTINModal(startup.user_id)
                  }
                >
                  {startup.founder_name}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  {startup.email}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  {startup.mobile}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <a
                    href={startup.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <textarea
                    value={comments[startup.id] || ""}
                    onChange={(e) =>
                      handleCommentChange(startup.id, e.target.value)
                    }
                    onBlur={() => saveComment(startup.id)} // Save the comment on blur (when focus leaves the textarea)
                    className="w-full p-1 border rounded"
                    rows="2"
                  />
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  {selectedType === "debt" ? (
                    startup.connected_investor ? (
                      startup.connected_investor
                        .split(", ")
                        .map((investor, index) => (
                          <span key={index} className="block">
                            {investor}
                          </span>
                        ))
                    ) : (
                      <span>No Investors Connected</span>
                    )
                  ) : (
                    <button
                      onClick={() => openAssignModal(startup)}
                      className="py-1 px-2 bg-blue-500 text-white rounded"
                    >
                      Assign
                    </button>
                  )}
                </td>
                {selectedType === "equity" && (
                  <td className="py-2 px-4 border-b border-gray-300">
                    <button
                      onClick={() => openViewModal(startup)}
                      className="py-1 px-2 bg-green-500 text-white rounded"
                    >
                      View
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAssignModal && (
        <AssignInvestorsModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSave={handleSaveAssignedInvestors}
        />
      )}

      {showViewModal && (
        <ViewAssignedInvestorsModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          startupId={selectedStartup ? selectedStartup.id : null}
        />
      )}

{/* {showGSTINModal && selectedGSTINData && (
  <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">GSTIN Information</h2>
      <table className="min-w-full bg-white">
        <tbody>
          {selectedGSTINData.map((gstinInfo, index) => (
            <React.Fragment key={gstinInfo.id}>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">GSTIN:</td>
                <td className="py-2 px-4">{gstinInfo.gstin}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Legal Name:</td>
                <td className="py-2 px-4">{gstinInfo.legal_name}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Constitution:</td>
                <td className="py-2 px-4">{gstinInfo.constitution}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Registration Date:</td>
                <td className="py-2 px-4">{gstinInfo.registration_date}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Status:</td>
                <td className="py-2 px-4">{gstinInfo.status}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Taxpayer Type:</td>
                <td className="py-2 px-4">{gstinInfo.taxpayer_type}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Center Jurisdiction:</td>
                <td className="py-2 px-4">{gstinInfo.center_jurisdiction}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">State Jurisdiction:</td>
                <td className="py-2 px-4">{gstinInfo.state_jurisdiction}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Cancellation Date:</td>
                <td className="py-2 px-4">{gstinInfo.cancellation_date || "N/A"}</td>
              </tr>
              <tr className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="py-2 px-4 font-semibold">Nature of Business Activities:</td>
                <td className="py-2 px-4">
                  {Array.isArray(gstinInfo.nature_business_activities)
                    ? gstinInfo.nature_business_activities.join(", ")
                    : gstinInfo.nature_business_activities}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => setShowGSTINModal(false)}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
      >
        Close
      </button>
    </div>
  </div>
)} */}

    </div>
  );
};

export default Fundraising;
