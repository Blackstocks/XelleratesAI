import React, { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { supabase } from '@/lib/supabaseclient';

const ViewAssignedInvestorsModal = ({ isOpen, onClose, investorId }) => {
  const [connectedStartups, setConnectedStartups] = useState([]);
  const [loading, setLoading] = useState(true);

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
        } catch (error) {
          console.error('Error fetching connected startups:', error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchConnectedStartups();
    }
  }, [isOpen, investorId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className='p-4 max-w-full max-h-full'
        style={{ width: '800px', height: '400px' }}
      >
        <h2 className='text-xl font-bold mb-4'>Connected Startups</h2>
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
                  {/* <th className='py-2 px-2 border-b border-gray-300 text-left'>
                    Founder Name
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {connectedStartups.map(
                  (startup, index) => (
                    console.log('startup', startup),
                    (
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
                        {/* <td className='py-2 px-2 border-b border-gray-300'>
                      {startup.startups.founder_name}
                    </td> */}
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewAssignedInvestorsModal;
