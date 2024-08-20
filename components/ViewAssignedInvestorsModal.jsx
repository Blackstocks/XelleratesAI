import React, { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { supabase } from '@/lib/supabaseclient';

const ViewAssignedInvestorsModal = ({ isOpen, onClose, investorId }) => {
  const [connectedStartups, setConnectedStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && investorId) {
      const fetchConnectedStartups = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('investor_startup_assignments')
            .select(
              `
              startup_id,
              company_profile (
                company_name,
                industry_sector,
                current_stage,
                country
              )
            `
            )
            .eq('investor_id', investorId);

          if (error) throw error;

          setConnectedStartups(data);
          setFilteredStartups(data);
        } catch (error) {
          console.error('Error fetching connected startups:', error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchConnectedStartups();
    }
  }, [isOpen, investorId]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = connectedStartups.filter((startup) => {
      const companyName = startup.company_profile.company_name || '';
      const industrySector = startup.company_profile.industry_sector || '';
      const currentStage = startup.company_profile.current_stage || '';
      const country = startup.company_profile.country || '';

      return (
        companyName.toLowerCase().includes(searchTerm) ||
        industrySector.toLowerCase().includes(searchTerm) ||
        currentStage.toLowerCase().includes(searchTerm) ||
        country.toLowerCase().includes(searchTerm)
      );
    });

    setFilteredStartups(filtered);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className='p-4 max-w-full max-h-full'
        style={{ width: '800px', height: '400px' }}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold'>Connected Startups</h2>
          <input
            type='text'
            value={searchTerm}
            onChange={handleSearch}
            placeholder='Search'
            className='py-2 px-4 rounded border border-gray-300'
            style={{ maxWidth: '300px' }}
          />
        </div>
        <div className='overflow-x-auto overflow-y-auto max-h-[300px]'>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className='min-w-full bg-white border border-gray-300 text-sm'>
              <thead>
                <tr>
                  <th className='py-2 px-2 border-b border-gray-300 text-left'>
                    Startup Name
                  </th>
                  <th className='py-2 px-2 border-b border-gray-300 text-left'>
                    Sector
                  </th>
                  <th className='py-2 px-2 border-b border-gray-300 text-left'>
                    Stage
                  </th>
                  <th className='py-2 px-2 border-b border-gray-300 text-left'>
                    Country
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStartups.map((startup, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                  >
                    <td className='py-2 px-2 border-b border-gray-300'>
                      {startup.company_profile.company_name}
                    </td>
                    <td className='py-2 px-2 border-b border-gray-300'>
                      {startup.company_profile.industry_sector}
                    </td>
                    <td className='py-2 px-2 border-b border-gray-300'>
                      {startup.company_profile.current_stage}
                    </td>
                    <td className='py-2 px-2 border-b border-gray-300'>
                      {startup.company_profile.country}
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
