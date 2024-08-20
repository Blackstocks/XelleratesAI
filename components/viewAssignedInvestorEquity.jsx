import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabaseclient";

const ViewAssignedInvestorsModal = ({ isOpen, onClose, startupId }) => {
  const [assignedInvestors, setAssignedInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const statusOptions = [
    { label: "Introduction", color: "bg-gray-500 text-black" },
    { label: "Pitch", color: "bg-yellow-500 text-black" },
    { label: "Meeting", color: "bg-yellow-500 text-black" },
    { label: "Term Sheet", color: "bg-yellow-500 text-black" },
    { label: "Transaction", color: "bg-yellow-500 text-black" },
    { label: "Document", color: "bg-yellow-500 text-black" },
    { label: "Deal Closed Won", color: "bg-green-500 text-black" },
    { label: "Deal Closed Lost", color: "bg-red-500 text-black" },
    { label: "Rejected", color: "bg-red-500 text-black" },
  ];

  useEffect(() => {
    if (isOpen && startupId) {
      const fetchAssignedInvestors = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("assigned_dealflow")
            .select(`
              id,
              status,
              investor_id,
              input_to_startup,
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
              )
            `)
            .eq("startup_id", startupId);

          if (error) throw error;

          setAssignedInvestors(data);
        } catch (error) {
          console.error("Error fetching assigned investors:", error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchAssignedInvestors();
    }
  }, [isOpen, startupId]);

  const handleStatusChange = async (investorId, newStatus) => {
    try {
      const { error } = await supabase
        .from("assigned_dealflow")
        .update({ status: newStatus })
        .eq("startup_id", startupId)
        .eq("investor_id", investorId);

      if (error) throw error;

      setAssignedInvestors((prevInvestors) =>
        prevInvestors.map((investor) =>
          investor.investor_id === investorId ? { ...investor, status: newStatus } : investor
        )
      );
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  const handleInputChange = async (investorId, newInput) => {
    try {
      const { error } = await supabase
        .from("assigned_dealflow")
        .update({ input_to_startup: newInput })
        .eq("startup_id", startupId)
        .eq("investor_id", investorId);

      if (error) throw error;

      setAssignedInvestors((prevInvestors) =>
        prevInvestors.map((investor) =>
          investor.investor_id === investorId ? { ...investor, input_to_startup: newInput } : investor
        )
      );
    } catch (error) {
      console.error("Error updating input to startup:", error.message);
    }
  };

  const getStatusColorClass = (status) => {
    const statusOption = statusOptions.find(option => option.label === status);
    return statusOption ? statusOption.color : "";
  };

  const filteredInvestors = assignedInvestors.filter(investor =>
    Object.values(investor.investor_signup).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 max-w-full max-h-full" style={{ width: '1200px', height: '70vh' }}>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Assigned Investors</h2>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4"
          />
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-300 text-xs">
              <thead>
                <tr>
                  <th className="py-2 px-2 border-b border-gray-300 text-left" style={{ minWidth: '200px' }}>Name</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Email</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Mobile</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Sector</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Type Of</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Cheque Size</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Investment Stage</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Geography</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Company Name</th>
                  <th className="py-2 px-2 border-b border-gray-300 text-left">Input to Startup</th>
                  <th className="py-2 px-4 border-b border-gray-300 text-left" style={{ minWidth: '150px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestors.map((investor, index) => (
                  <tr key={investor.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                    <td className="py-2 px-2 border-b border-gray-300" style={{ minWidth: '200px' }}>{investor.investor_signup.name}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.email}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.mobile}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.sectors}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.typeof}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.cheque_size}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.investment_stage}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.Geography}</td>
                    <td className="py-2 px-2 border-b border-gray-300">{investor.investor_signup.company_name}</td>
                    <td className="py-2 px-2 border-b border-gray-300">
                      <textarea
                        value={investor.input_to_startup || ""}
                        onChange={(e) => handleInputChange(investor.investor_id, e.target.value)}
                        className="w-full p-1 border rounded"
                        style={{ minWidth: '150px' }}
                        rows="2"
                      />
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      <select
                        value={investor.status || "Introduction"}
                        onChange={(e) => handleStatusChange(investor.investor_id, e.target.value)}
                        className={`w-full p-1 border rounded ${getStatusColorClass(investor.status || "Introduction")}`}
                        style={{ minWidth: '150px' }}
                      >
                        {statusOptions.map((option) => (
                          <option
                            key={option.label}
                            value={option.label}
                            className="bg-white text-black"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewAssignedInvestorsModal;
