'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/app/loading';

const AssignStartupsModal = ({ isOpen, onClose, profileId }) => {
  const [startups, setStartups] = useState([]);
  const [filteredStartups, setFilteredStartups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedStartups, setAddedStartups] = useState([]); // Track added startups
  const startupsRef = useRef(startups);

  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_profile')
          .select('*');
        if (error) throw error;
        setStartups(data);
        setFilteredStartups(data);
        startupsRef.current = data;

        // Fetch currently added startups for this investor
        const { data: hotDealsData, error: hotDealsError } = await supabase
          .from('hot_deals')
          .select('startup_id')
          .eq('investor_id', profileId);

        if (hotDealsError) throw hotDealsError;

        setAddedStartups(hotDealsData.map((deal) => deal.startup_id));
      } catch (error) {
        console.error('Error fetching startups:', error.message);
        setErrorMessage('Error fetching startups');
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();

    const subscription = supabase
      .channel('public:company_profile')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'company_profile' },
        (payload) => {
          setStartups((prevStartups) => {
            const newStartups = [...prevStartups, payload.new].sort((a, b) =>
              b.company_name.localeCompare(a.company_name)
            );
            startupsRef.current = newStartups;
            return newStartups;
          });
          setFilteredStartups((prevStartups) => {
            const newStartups = [...prevStartups, payload.new].sort((a, b) =>
              b.company_name.localeCompare(a.company_name)
            );
            return newStartups;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'company_profile' },
        (payload) => {
          setStartups((prevStartups) => {
            const updatedStartups = prevStartups
              .map((startup) =>
                startup.id === payload.new.id ? payload.new : startup
              )
              .sort((a, b) => b.company_name.localeCompare(a.company_name));
            startupsRef.current = updatedStartups;
            return updatedStartups;
          });
          setFilteredStartups((prevStartups) => {
            const updatedStartups = prevStartups
              .map((startup) =>
                startup.id === payload.new.id ? payload.new : startup
              )
              .sort((a, b) => b.company_name.localeCompare(a.company_name));
            return updatedStartups;
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'company_profile' },
        (payload) => {
          setStartups((prevStartups) => {
            const filteredStartups = prevStartups.filter(
              (startup) => startup.id !== payload.old.id
            );
            startupsRef.current = filteredStartups;
            return filteredStartups;
          });
          setFilteredStartups((prevStartups) => {
            const filteredStartups = prevStartups.filter(
              (startup) => startup.id !== payload.old.id
            );
            return filteredStartups;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profileId]);

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
    setFilteredStartups((prevStartups) =>
      prevStartups.filter((startup) => startup[name]?.includes(value))
    );
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = startups.filter((startup) => {
      return (
        startup?.company_name?.toLowerCase()?.includes(searchTerm) ||
        startup?.industry_sector?.toLowerCase()?.includes(searchTerm) ||
        startup?.country?.toLowerCase()?.includes(searchTerm) ||
        startup?.state_city?.toLowerCase()?.includes(searchTerm) ||
        startup?.current_stage?.toLowerCase()?.includes(searchTerm)
      );
    });

    setFilteredStartups(filtered);
  };

  const addStartupToHotDeals = async (startup) => {
    let retry = 0;
    const maxRetries = 3;

    while (retry < maxRetries) {
      try {
        // Fetch current hot deals to determine the used ranks
        const { data: currentHotDeals, error: fetchError } = await supabase
          .from('hot_deals')
          .select('*')
          .eq('investor_id', profileId)
          .order('rank', { ascending: true });

        if (fetchError) {
          console.error('Error fetching hot deals:', fetchError);
          setErrorMessage('Error fetching current hot deals');
          return;
        }

        // Ensure no more than 3 startups are assigned
        if (currentHotDeals.length >= 3) {
          setErrorMessage(
            'You can only assign a total of 3 startups per investor.'
          );
          return;
        }

        // Determine the next available rank
        const usedRanks = currentHotDeals.map((deal) => deal.rank);
        let nextRank = 1;
        while (usedRanks.includes(nextRank) && nextRank <= 3) {
          nextRank++;
        }

        if (nextRank > 3) {
          setErrorMessage(
            'All ranks are already assigned. Cannot add more startups.'
          );
          return;
        }

        const { data: companyData, error: companyError } = await supabase
          .from('company_profile')
          .select('profile_id, company_name')
          .eq('id', startup?.id)
          .single();

        if (companyError) {
          console.error('Error fetching company data:', companyError);
          setErrorMessage('Error fetching company data');
          return;
        }
        // Gather necessary data for insertion
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_logo')
          .eq('id', companyData?.profile_id)
          .single();

        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          setErrorMessage('Error fetching profile data');
          return;
        }

        const { data: founderData, error: founderError } = await supabase
          .from('founder_information')
          .select('founder_name')
          .eq('company_id', startup?.id)
          .single();

        if (founderError) {
          console.error('Error fetching founder data:', founderError);
          setErrorMessage('Error fetching founder data');
          return;
        }

        // Insert the new startup into hot_deals with the gathered data
        const { error } = await supabase.from('hot_deals').upsert({
          startup_id: startup?.id,
          investor_id: profileId,
          rank: nextRank,
          created_at: new Date(),
          company_name: companyData.company_name,
          company_logo: profileData.company_logo,
          founder_name: founderData.founder_name,
        });

        if (error) {
          if (error.code === '23505') {
            retry++;
            console.warn(
              `Rank conflict detected, retrying... (${retry}/${maxRetries})`
            );
            continue;
          } else {
            console.error('Error adding startup to hot deals:', error);
            setErrorMessage('Error adding startup to hot deals');
            return;
          }
        } else {
          setErrorMessage(null);
          setAddedStartups((prev) => [...prev, startup.id]); // Track added startups
          return; // Success, exit loop
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setErrorMessage('Unexpected error occurred');
        return;
      }
    }

    setErrorMessage(
      'Unable to assign startup after multiple attempts. Please try again.'
    );
  };

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

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

        {errorMessage && (
          <div className='bg-red-500 text-white p-2 mb-4 rounded'>
            {errorMessage}
          </div>
        )}

        <div className='max-h-64 overflow-y-auto'>
          <table className='min-w-full bg-white border border-gray-300'>
            <thead>
              <tr>
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
                <th className='py-2 px-4 border-b border-gray-300'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStartups.map((startup) => (
                <tr key={startup.id}>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.company_name}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.industry_sector}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.country
                      ? JSON.parse(startup.country).label
                      : 'N/A'}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.state_city}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    {startup.current_stage}
                  </td>
                  <td className='py-2 px-4 border-b border-gray-300'>
                    <button
                      onClick={() => addStartupToHotDeals(startup)}
                      className={`py-1 px-2 rounded ${
                        addedStartups.includes(startup.id)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-blue-500 text-white'
                      }`}
                      disabled={addedStartups.includes(startup.id)}
                    >
                      {addedStartups.includes(startup.id)
                        ? 'Added'
                        : 'Add to Hot Deals'}
                    </button>
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
        </div>
      </div>
    </div>
  );
};

export default AssignStartupsModal;
