"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";

const Fundraising = () => {
  const [connectedStartups, setConnectedStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("equity");
  const [newDealflows, setNewDealflows] = useState([]);
  const [showNewDealflows, setShowNewDealflows] = useState(false);
  const [updatedDealflowIds, setUpdatedDealflowIds] = useState([]);

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
      } catch (error) {
        console.error("Error fetching connected startups:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedStartups();
  }, []);

  useEffect(() => {
    const fetchNewDealflows = async () => {
      try {
        const { data, error } = await supabase
          .from("add_dealflow")
          .select(
            `
            *,
            profiles (
              company_name
            )
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        setNewDealflows(data);
      } catch (error) {
        console.error("Error fetching new dealflows:", error.message);
      }
    };

    fetchNewDealflows();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("connected_startups")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setConnectedStartups((prevStartups) =>
        prevStartups.map((startup) =>
          startup.id === id ? { ...startup, status: newStatus } : startup
        )
      );
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  const handleCommentChange = async (id, newComment) => {
    try {
      const { error } = await supabase
        .from("connected_startups")
        .update({ comment: newComment })
        .eq("id", id);

      if (error) throw error;

      setConnectedStartups((prevStartups) =>
        prevStartups.map((startup) =>
          startup.id === id ? { ...startup, comment: newComment } : startup
        )
      );
    } catch (error) {
      console.error("Error updating comment:", error.message);
    }
  };

  const handleUpdateDealflow = async (dealflow) => {
    try {
      const { error } = await supabase.from("investor_signup").insert([
        {
          name: dealflow.name,
          email: dealflow.email,
          mobile: dealflow.mobile,
          typeof:dealflow.typeof,
          investment_thesis: dealflow.investment_thesis,
          cheque_size: dealflow.cheque_size,
          sectors: dealflow.sector,
          investment_stage: dealflow.investment_stage,
          created_at: new Date(),
          profile_id: dealflow.user_id,
          profile_photo: "", // You can add profile photo if available
          id: dealflow.id,
          Geography: dealflow.Geography, // Updated field
          company_name: dealflow.company_name,
        },
      ]);

      if (error) throw error;

      setUpdatedDealflowIds((prevIds) => [...prevIds, dealflow.id]);
    } catch (error) {
      console.error("Error updating dealflow:", error.message);
    }
  };

  const filteredStartups = connectedStartups.filter(
    (startup) => startup.user_type === selectedType
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Introduction":
        return "bg-red-500 text-white";
      case "Pitch":
        return "bg-yellow-500 text-white";
      case "Meeting":
        return "bg-yellow-500 text-white";
      case "Term Sheet":
        return "bg-yellow-500 text-white";
      case "Transaction Documents":
        return "bg-green-500 text-white";
      case "Deal closed won":
        return "bg-green-500 text-white";
      case "Deal closed lost":
        return "bg-gray-500 text-white";
      case "Rejected":
        return "bg-gray-500 text-white";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Fundraising</h1>
      <div className="mb-4">
        <button
          onClick={() => setShowNewDealflows(false)}
          className={`py-2 px-4 rounded mr-2 ${
            !showNewDealflows && selectedType === "equity"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Equity
        </button>
        <button
          onClick={() => setShowNewDealflows(false)}
          className={`py-2 px-4 rounded mr-2 ${
            !showNewDealflows && selectedType === "debt"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Debt
        </button>
        <button
          onClick={() => setShowNewDealflows(true)}
          className={`py-2 px-4 rounded ${
            showNewDealflows ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          New Dealflow
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : showNewDealflows ? (
        <div className="max-h-[65vh] overflow-y-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Added by
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Name
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Email
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Mobile
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Investment Thesis
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Cheque Size
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Sector
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Investment Stage
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Company Name
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Investor Type
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Location
                </th>
                <th className="py-4 px-4 border-b border-gray-300 text-left text-sm">
                  Update Status
                </th>
              </tr>
            </thead>
            <tbody>
              {newDealflows.map((dealflow, index) => (
                <tr
                  key={dealflow.id}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.profiles?.company_name || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.name || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.email || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.mobile || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.investment_thesis || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.cheque_size || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.sector || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.investment_stage || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.company_name || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.typeof || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    {dealflow.Geography || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300 text-sm">
                    <button
                      onClick={() => handleUpdateDealflow(dealflow)}
                      className={`py-1 px-2 rounded ${
                        updatedDealflowIds.includes(dealflow.id)
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {updatedDealflowIds.includes(dealflow.id)
                        ? "Updated"
                        : "Update"}
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
                Status
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Comment
              </th>
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
                <td className="py-2 px-4 border-b border-gray-300">
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
                  <select
                    value={startup.status}
                    onChange={(e) =>
                      handleStatusChange(startup.id, e.target.value)
                    }
                    className={`w-full px-2 py-1 border rounded ${getStatusClass(
                      startup.status
                    )}`}
                  >
                    <option
                      value="Introduction"
                      className="bg-white text-black"
                    >
                      Introduction
                    </option>
                    <option value="Pitch" className="bg-white text-black">
                      Pitch
                    </option>
                    <option value="Meeting" className="bg-white text-black">
                      Meeting
                    </option>
                    <option value="Term Sheet" className="bg-white text-black">
                      Term Sheet
                    </option>
                    <option
                      value="Transaction Documents"
                      className="bg-white text-black"
                    >
                      Transaction Documents
                    </option>
                    <option
                      value="Deal closed won"
                      className="bg-white text-black"
                    >
                      Deal closed won
                    </option>
                    <option
                      value="Deal closed lost"
                      className="bg-white text-black"
                    >
                      Deal closed lost
                    </option>
                    <option value="Rejected" className="bg-white text-black">
                      Rejected
                    </option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <textarea
                    value={startup.comment || ""}
                    onChange={(e) =>
                      handleCommentChange(startup.id, e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Fundraising;
