import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';

const AssignDealflowModal = ({ isOpen, onClose, dealflowId, startupId, onAssign }) => {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestors, setSelectedInvestors] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    investmentType: '',
    sector: '',
    investmentStage: '',
  });

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const { data, error } = await supabase.from('investor_signup').select('*');
        if (error) throw error;
        setInvestors(data);
      } catch (error) {
        console.error('Error fetching investors:', error.message);
      }
    };

    fetchInvestors();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const filteredInvestors = investors.filter((investor) => {
    return (
      (!filters.location || investor.Geography?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.investmentType || investor.typeof?.toLowerCase().includes(filters.investmentType.toLowerCase())) &&
      (!filters.sector || investor.sectors?.toLowerCase().includes(filters.sector.toLowerCase())) &&
      (!filters.investmentStage || investor.investment_stage?.toLowerCase().includes(filters.investmentStage.toLowerCase()))
    );
  });

  const handleCheckboxChange = (investorId) => {
    setSelectedInvestors((prevSelected) =>
      prevSelected.includes(investorId)
        ? prevSelected.filter((id) => id !== investorId)
        : [...prevSelected, investorId]
    );
  };

  const handleAssign = () => {
    onAssign(selectedInvestors);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg overflow-y-auto h-3/4">
          <h2 className="text-2xl font-bold mb-4">Assign Investors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Location</option>
                {[...new Set(investors.flatMap((inv) => inv.Geography?.split(',').map((loc) => loc.trim())))].sort().map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Investment Type</label>
              <select
                name="investmentType"
                value={filters.investmentType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Investment Type</option>
                {[...new Set(investors.flatMap((inv) => inv.typeof?.split(',').map((type) => type.trim())))].sort().map((type, index) => (
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
                {[...new Set(investors.flatMap((inv) => inv.sectors?.split(',').map((sec) => sec.trim())))].sort().map((sector, index) => (
                  <option key={index} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Investment Stage</label>
              <select
                name="investmentStage"
                value={filters.investmentStage}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Investment Stage</option>
                {[...new Set(investors.flatMap((inv) => inv.investment_stage?.split(',').map((stage) => stage.trim())))].sort().map((stage, index) => (
                  <option key={index} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-y-auto h-64">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Select</th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Name</th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Email</th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Mobile</th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Location</th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Investment Type</th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Sector</th>
                  <th className="py-4 px-4 border-b border-gray-300 text-left">Investment Stage</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestors.map((investor) => (
                  <tr key={investor.id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedInvestors.includes(investor.id)}
                        onChange={() => handleCheckboxChange(investor.id)}
                      />
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">{investor.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">{investor.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">{investor.mobile || 'N/A'}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">{investor.Geography || 'N/A'}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">{investor.typeof || 'N/A'}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">{investor.sectors || 'N/A'}</td>
                    <td className="py-2 px-4 border-b border-gray-300 text-sm">{investor.investment_stage || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleAssign} className="py-2 px-4 bg-blue-500 text-white rounded">Assign</button>
            <button onClick={onClose} className="py-2 px-4 ml-2 bg-gray-500 text-white rounded">Cancel</button>
          </div>
        </div>
      </div>
    )
  );
};

export default AssignDealflowModal;
