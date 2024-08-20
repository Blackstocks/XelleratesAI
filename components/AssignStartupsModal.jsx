import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const AssignStartupsModal = ({
  isOpen,
  onClose,
  handleSaveAssignedStartups,
  profileId,
}) => {
  const [startups, setStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [selectedStartups, setSelectedStartups] = useState([]);
  const [filters, setFilters] = useState({
    sector: '',
    country: '',
    state_city: '',
    current_stage: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const { data, error } = await supabase
          .from('company_profile')
          .select('*');
        if (error) throw error;
        setStartups(data);
        setFilteredStartups(data);
      } catch (error) {
        console.error('Error fetching startups:', error.message);
      }
    };

    fetchStartups();
  }, []);

  const getOptions = (key) => {
    const options = new Set();
    startups.forEach((startup) => {
      const values = startup[key]?.split(',').map((value) => value.trim());
      if (values) {
        values.forEach((value) => options.add(value));
      }
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));

    const filtered = startups.filter((startup) => {
      const matchesSector =
        !filters.sector || startup.industry_sector?.includes(filters.sector);
      const matchesCountry =
        !filters.country || startup.country?.includes(filters.country);
      const matchesStateCity =
        !filters.state_city ||
        startup.state_city?.includes(filters.state_city);
      const matchesStage =
        !filters.current_stage ||
        startup.current_stage?.includes(filters.current_stage);
      const matchesSearch =
        (startup.company_name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (startup.industry_sector || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (startup.country || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (startup.state_city || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (startup.current_stage || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return (
        matchesSector &&
        matchesCountry &&
        matchesStateCity &&
        matchesStage &&
        matchesSearch
      );
    });

    setFilteredStartups(filtered);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = startups.filter((startup) => {
      return (
        (startup.company_name || '')
          .toLowerCase()
          .includes(searchTerm) ||
        (startup.industry_sector || '')
          .toLowerCase()
          .includes(searchTerm) ||
        (startup.country || '')
          .toLowerCase()
          .includes(searchTerm) ||
        (startup.state_city || '')
          .toLowerCase()
          .includes(searchTerm) ||
        (startup.current_stage || '')
          .toLowerCase()
          .includes(searchTerm)
      );
    });

    setFilteredStartups(filtered);
  };

  const handleCheckboxChange = (startup) => {
    setSelectedStartups((prevSelected) => {
      if (prevSelected.includes(startup)) {
        return prevSelected.filter((item) => item !== startup);
      } else {
        return [...prevSelected, startup];
      }
    });
  };

  const handleSave = () => {
    const assignments = selectedStartups.map((startup) => ({
      startup_id: startup.id,
      profile_id: profileId,
    }));
    handleSaveAssignedStartups(assignments);
    console.log(assignments);
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <div className='bg-white rounded shadow-lg p-4 max-w-4xl w-full overflow-auto max-h-full'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold'>Assign Startups</h2>
          <input
            type='text'
            value={searchTerm}
            onChange={handleSearch}
            placeholder='Search'
            className='py-2 px-4 rounded border border-gray-300'
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div className='flex flex-wrap -mx-2 mb-4'>
          <div className='w-1/4 px-2'>
            <label className='block text-sm font-medium'>Sector</label>
            <select
              name='sector'
              value={filters.sector}
              onChange={handleFilterChange}
              className='w-full px-3 py-2 border border-gray-300 rounded'
            >
              <option value=''>Select Sector</option>
              {getOptions('industry_sector').map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className='w-1/4 px-2'>
            <label className='block text-sm font-medium'>Country</label>
            <select
              name='country'
              value={filters.country}
              onChange={handleFilterChange}
              className='w-full px-3 py-2 border border-gray-300 rounded'
            >
              <option value=''>Select Country</option>
              {getOptions('country').map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className='w-1/4 px-2'>
            <label className='block text-sm font-medium'>State/City</label>
            <select
              name='state_city'
              value={filters.state_city}
              onChange={handleFilterChange}
              className='w-full px-3 py-2 border border-gray-300 rounded'
            >
              <option value=''>Select State/City</option>
              {getOptions('state_city').map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className='w-1/4 px-2'>
            <label className='block text-sm font-medium'>Current Stage</label>
            <select
              name='current_stage'
              value={filters.current_stage}
              onChange={handleFilterChange}
              className='w-full px-3 py-2 border border-gray-300 rounded'
            >
              <option value=''>Select Stage</option>
              {getOptions('current_stage').map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='max-h-64 overflow-y-auto'>
          <table className='min-w-full bg-white border border-gray-300'>
            <thead>
              <tr>
                <th className='py-2 px-4 border-b border-gray-300'>
                  <input
                    type='checkbox'
                    className='form-checkbox'
                    onChange={(e) =>
                      setSelectedStartups(
                        e.target.checked ? filteredStartups : []
                      )
                    }
                    checked={
                      selectedStartups.length === filteredStartups.length
                    }
                  />
                </th>
                <th className='py-2 px-4 border-b border-gray-300'>
                  Company Name
                </th>
                <th className='py-2 px-4 border-b border-gray-300'>Sector</th>
                <th className='py-2 px-4 border-b border-gray-300'>Country</th>
                <th className='py-2 px-4 border-b border-gray-300'>
                  State/City
                </th>
                <th className='py-2 px-4 border-b border-gray-300'>
                  Current Stage
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStartups.map((startup) => (
                <tr key={startup.id}>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    <input
                      type='checkbox'
                      className='form-checkbox'
                      checked={selectedStartups.includes(startup)}
                      onChange={() => handleCheckboxChange(startup)}
                    />
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.company_name}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.industry_sector}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.country}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.state_city}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.current_stage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='flex justify-end mt-4'>
          <button
            onClick={onClose}
            className='mr-2 px-4 py-2 bg-gray-200 rounded'
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className='px-4 py-2 bg-blue-500 text-white rounded'
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStartupsModal;
