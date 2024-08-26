import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseclient";

const DebtTab = ({ searchTerm }) => {
  const [connectedStartups, setConnectedStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedInvestorDetails, setSelectedInvestorDetails] = useState(null);
  const [showGSTINModal, setShowGSTINModal] = useState(false);
  const [showInvestorModal, setShowInvestorModal] = useState(false);

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

  const openGSTINModal = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("debt_gstin")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      setSelectedStartup(data[0]); // Assuming the first item is the correct one
      setShowGSTINModal(true);
    } catch (error) {
      console.error("Error fetching GSTIN information:", error.message);
    }
  };

  const openInvestorDetails = (investorDetails) => {
    setSelectedInvestorDetails(investorDetails);
    setShowInvestorModal(true);
  };

  const closeGSTINModal = () => {
    setShowGSTINModal(false);
    setSelectedStartup(null);
  };

  const closeInvestorModal = () => {
    setShowInvestorModal(false);
    setSelectedInvestorDetails(null);
  };

  const handleCommentChange = async (startupId, comment) => {
    try {
      const { error } = await supabase
        .from("connected_startups")
        .update({ comment })
        .eq("id", startupId);

      if (error) {
        console.error("Error updating comment:", error.message);
      } else {
        setConnectedStartups((prevStartups) =>
          prevStartups.map((startup) =>
            startup.id === startupId ? { ...startup, comment } : startup
          )
        );
      }
    } catch (error) {
      console.error("Error updating comment:", error.message);
    }
  };

  const filteredStartups = connectedStartups.filter(
    (startup) =>
      startup.startup_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.linkedin_profile
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div>
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
              Requested Debt Investor
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
              <td
                className="py-2 px-4 border-b border-gray-300 cursor-pointer text-blue-500"
                onClick={() => openGSTINModal(startup.user_id)}
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
                {startup.connected_investor}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                <input
                  type="text"
                  value={startup.comment || ""}
                  onChange={(e) =>
                    handleCommentChange(startup.id, e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded"
                  placeholder="Add a comment"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* GSTIN Modal */}
      {showGSTINModal && selectedStartup && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              GSTIN Information
            </h2>
            <table className="min-w-full bg-white">
              <tbody>
                <tr className="bg-gray-100">
                  <td className="py-2 px-4 font-semibold">GSTIN:</td>
                  <td className="py-2 px-4">{selectedStartup.gstin}</td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-semibold">Legal Name:</td>
                  <td className="py-2 px-4">{selectedStartup.legal_name}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="py-2 px-4 font-semibold">
                    Business Constitution:
                  </td>
                  <td className="py-2 px-4">
                    {selectedStartup.business_constitution}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-semibold">
                    Aggregate Turnover:
                  </td>
                  <td className="py-2 px-4">
                    {selectedStartup.aggregate_turn_over}
                  </td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="py-2 px-4 font-semibold">
                    Current Registration Status:
                  </td>
                  <td className="py-2 px-4">
                    {selectedStartup.current_registration_status}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-semibold">
                    State Jurisdiction:
                  </td>
                  <td className="py-2 px-4">
                    {selectedStartup.state_jurisdiction}
                  </td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="py-2 px-4 font-semibold">
                    Central Jurisdiction:
                  </td>
                  <td className="py-2 px-4">
                    {selectedStartup.central_jurisdiction}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-semibold">Taxpayer Type:</td>
                  <td className="py-2 px-4">{selectedStartup.tax_payer_type}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="py-2 px-4 font-semibold">
                    Authorized Signatories:
                  </td>
                  <td className="py-2 px-4">
                    {selectedStartup.authorized_signatory?.join(", ")}
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2 px-4 font-semibold">Business Details:</td>
                  <td className="py-2 px-4">
                    <ul className="list-disc list-inside">
                      {selectedStartup.business_details?.bzsdtls?.map(
                        (detail, index) => (
                          <li key={index}>
                            {detail.sdes} ({detail.saccd})
                          </li>
                        )
                      )}
                    </ul>
                  </td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="py-2 px-4 font-semibold">
                    Filing Status (Last 3 months):
                  </td>
                  <td className="py-2 px-4">
                    <ul className="list-disc list-inside">
                      {selectedStartup.filing_status?.[0]?.slice(0, 3).map(
                        (filing, index) => (
                          <li key={index}>
                            <div>
                              <strong>FY:</strong> {filing.fy}
                              <br />
                              <strong>Tax Period:</strong> {filing.taxp}
                              <br />
                              <strong>Return Type:</strong> {filing.rtntype}
                              <br />
                              <strong>Date of Filing:</strong> {filing.dof}
                              <br />
                              <strong>Status:</strong> {filing.status}
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              onClick={closeGSTINModal}
              className="mt-6 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtTab;
