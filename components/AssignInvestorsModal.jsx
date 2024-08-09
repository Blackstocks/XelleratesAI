import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const AssignInvestorsModal = ({ isOpen, onClose, onSave }) => {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestors, setSelectedInvestors] = useState([]);
  const [filters, setFilters] = useState({
    sector: '',
    Geography: '',
    cheque_size: '',
    investment_stage: '',
    typeof: '',
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

  const getOptions = (key) => {
    const options = new Set();
    investors.forEach((investor) => {
      const values = investor[key]?.split(',').map((value) => value.trim());
      if (values) {
        values.forEach((value) => options.add(value));
      }
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const filteredInvestors = investors.filter((investor) => {
    return (
      (!filters.sector || investor.sectors?.includes(filters.sector)) &&
      (!filters.Geography || investor.Geography?.includes(filters.Geography)) &&
      (!filters.cheque_size || investor.cheque_size === filters.cheque_size) &&
      (!filters.investment_stage || investor.investment_stage?.includes(filters.investment_stage)) &&
      (!filters.typeof || investor.typeof?.includes(filters.typeof))
    );
  });

  const handleCheckboxChange = (investor) => {
    setSelectedInvestors((prevSelected) => {
      if (prevSelected.includes(investor)) {
        return prevSelected.filter((item) => item !== investor);
      } else {
        return [...prevSelected, investor];
      }
    });
  };

  return (
    <div className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded shadow-lg p-4 max-w-4xl w-full overflow-auto max-h-full">
        <h2 className="text-2xl font-bold mb-4">Assign Investors</h2>
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-1/5 px-2">
            <label className="block text-sm font-medium">Sector</label>
            <select name="sector" value={filters.sector} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
              <option value="">Select Sector</option>
              {getOptions('sectors').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="w-1/5 px-2">
            <label className="block text-sm font-medium">Geography</label>
            <select name="Geography" value={filters.Geography} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
              <option value="">Select Geography</option>
              {getOptions('Geography').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="w-1/5 px-2">
            <label className="block text-sm font-medium">Cheque Size</label>
            <select name="cheque_size" value={filters.cheque_size} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
              <option value="">Select Cheque Size</option>
              {getOptions('cheque_size').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="w-1/5 px-2">
            <label className="block text-sm font-medium">Investment Stage</label>
            <select name="investment_stage" value={filters.investment_stage} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
              <option value="">Select Investment Stage</option>
              {getOptions('investment_stage').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="w-1/5 px-2">
            <label className="block text-sm font-medium">Type</label>
            <select name="typeof" value={filters.typeof} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded">
              <option value="">Select Type</option>
              {getOptions('typeof').map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-300">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    onChange={(e) =>
                      setSelectedInvestors(e.target.checked ? filteredInvestors : [])
                    }
                    checked={selectedInvestors.length === filteredInvestors.length}
                  />
                </th>
                <th className="py-2 px-4 border-b border-gray-300">Name</th>
                <th className="py-2 px-4 border-b border-gray-300">Email</th>
                <th className="py-2 px-4 border-b border-gray-300">Mobile</th>
                <th className="py-2 px-4 border-b border-gray-300">Sector</th>
                <th className="py-2 px-4 border-b border-gray-300">Geography</th>
                <th className="py-2 px-4 border-b border-gray-300">Cheque Size</th>
                <th className="py-2 px-4 border-b border-gray-300">Investment Stage</th>
                <th className="py-2 px-4 border-b border-gray-300">Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestors.map((investor) => (
                <tr key={investor.id}>
                  <td className="py-2 px-4 border-b border-gray-300">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={selectedInvestors.includes(investor)}
                      onChange={() => handleCheckboxChange(investor)}
                    />
                  </td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.name}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.email}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.mobile}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.sectors}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.Geography}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.cheque_size}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.investment_stage}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{investor.typeof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded">
            Close
          </button>
          <button
            onClick={() => onSave(selectedInvestors)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignInvestorsModal;
