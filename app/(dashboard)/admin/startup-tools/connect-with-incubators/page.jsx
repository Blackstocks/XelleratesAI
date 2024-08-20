'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import { supabase } from '@/lib/supabaseclient';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const ConnectWithIncubators = () => {
  const [incubators, setIncubators] = useState([]);
  const [connections, setConnections] = useState([]);
  const [incubatorsLoading, setIncubatorsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [startupsData, setStartupsData] = useState([]);
  const [startupsProfileData, setStartupsProfileData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const [filters, setFilters] = useState({
    state: [],
    city: [],
    category: [],
  });

  const [selectedFilters, setSelectedFilters] = useState({
    state: '',
    city: '',
    category: '',
  });

  const itemsPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchIncubatorsAndConnections = async () => {
      setIncubatorsLoading(true);
      try {
        const { data: connectionsData, error: connectionsError } =
          await supabase
            .from('connect_startup_incubator')
            .select('id, incubator_id, startup_id, status');
        if (connectionsError) throw connectionsError;

        setConnections(connectionsData);

        const incubatorIds = connectionsData.map((conn) => conn.incubator_id);
        const { data: incubatorsData, error: incubatorsError } = await supabase
          .from('Incubators')
          .select('*')
          .in('id', incubatorIds);
        if (incubatorsError) throw incubatorsError;

        setIncubators(incubatorsData);

        const startupIds = connectionsData.map((conn) => conn.startup_id);
        const { data: startupsData, error: startupsError } = await supabase
          .from('company_profile')
          .select('*')
          .in('id', startupIds);
        if (startupsError) throw startupsError;

        setStartupsData(startupsData);

        const profileIds = startupsData.map((startup) => startup.profile_id);
        const { data: startupsProfilesData, error: startupsProfilesError } =
          await supabase.from('profiles').select('*').in('id', profileIds);
        if (startupsProfilesError) throw startupsProfilesError;

        setStartupsProfileData(startupsProfilesData);

        const states = new Set();
        const cities = new Set();
        const categories = new Set();

        incubatorsData.forEach((item) => {
          const [city, state] = item.portCity
            ?.split(',')
            .map((str) => str.trim());
          states.add(state);
          cities.add(city);
          if (item.portTag) categories.add(item.portTag.trim());
          if (item.portTag2) categories.add(item.portTag2.trim());
        });

        setFilters({
          state: Array.from(states).sort(),
          city: Array.from(cities).sort(),
          category: Array.from(categories).sort(),
        });

        setIncubatorsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setIncubatorsLoading(false);
      }
    };

    fetchIncubatorsAndConnections();
  }, []);

  useEffect(() => {
    let filtered = incubators;

    if (selectedFilters.state) {
      filtered = filtered.filter(
        (incubator) =>
          incubator.portCity?.split(', ')[1] === selectedFilters.state
      );
    }
    if (selectedFilters.city) {
      filtered = filtered.filter(
        (incubator) =>
          incubator.portCity?.split(', ')[0] === selectedFilters.city
      );
    }
    if (selectedFilters.category) {
      filtered = filtered.filter(
        (incubator) =>
          incubator.portTag === selectedFilters.category ||
          incubator.portTag2 === selectedFilters.category
      );
    }

    setCurrentPage(1);
  }, [selectedFilters, incubators]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      state: '',
      city: '',
      category: '',
    });
  };

  const formatHeading = (heading) => {
    return heading
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredIncubators = incubators.filter((incubator) =>
    Object.values(incubator).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredIncubators.length / itemsPerPage);
  const currentIncubators = filteredIncubators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (incubatorsLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Incubator Connect</title>
      </Head>
      <main className='container mx-auto p-4 relative'>
        <div className='absolute top-4 left-4 z-20'>
          <button
            onClick={() => router.back()}
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            Back
          </button>
        </div>
        <div className='absolute top-4 right-4 z-20'>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded py-2 px-4"
          />
        </div>
        <h1 className='text-3xl font-bold mb-4 text-center'>
          Incubator Connect
        </h1>
        <p className='mb-6 text-center'>
          Welcome to the Incubator Connect page. Here you can find information
          about various incubators.
        </p>

        <div className='relative mb-4'>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-300'>
              <thead>
                <tr>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    S.No
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    Incubator Name
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    Sector
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    City
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    State
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    Startup Name
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    Email
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    Mobile
                  </th>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentIncubators.map((incubator, index) => {
                  const connection = connections.find(
                    (conn) => conn.incubator_id === incubator.id
                  );

                  const startup = connection
                    ? startupsData.find(
                        (startup) => startup.id === connection.startup_id
                      )
                    : null;
                  const startupProfile = startup
                    ? startupsProfileData.find(
                        (profile) => profile.id === startup.profile_id
                      )
                    : null;

                  const isApproved = connection
                    ? connection.status === 'approved'
                    : false;

                  const handleApprove = async () => {
                    try {
                      if (!connection || !connection.id) {
                        throw new Error(
                          'Connection ID is undefined or invalid.'
                        );
                      }

                      const { error } = await supabase
                        .from('connect_startup_incubator')
                        .update({ status: 'approved' })
                        .eq('id', connection.id);
                      if (error) throw error;

                      toast.success('Incubator approved successfully!');
                      setConnections((prevConnections) =>
                        prevConnections.map((conn) =>
                          conn.id === connection.id
                            ? { ...conn, status: 'approved' }
                            : conn
                        )
                      );
                    } catch (error) {
                      console.error(
                        'Error approving incubator:',
                        error.message
                      );
                      toast.error('Failed to approve incubator.');
                    }
                  };

                  return (
                    <tr
                      key={incubator.id}
                      className={`transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                      }`}
                    >
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        <div>
                          <span className='text-black-500'>
                            {formatHeading(incubator.portHeading) || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {`${incubator.portTag || ''}${
                          incubator.portTag2 ? ', ' + incubator.portTag2 : ''
                        }` || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {incubator.portCity?.split(', ')[1] || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {incubator.portCity?.split(', ')[0] || 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {startup ? startup.company_name : 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {startupProfile ? startupProfile.email : 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        {startupProfile ? startupProfile.mobile : 'N/A'}
                      </td>
                      <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                        <button
                          onClick={handleApprove}
                          className={`px-4 py-2 rounded ${
                            isApproved ? 'bg-gray-500' : 'bg-green-500'
                          } text-white`}
                          disabled={isApproved}
                        >
                          {isApproved ? 'Approved' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className='flex justify-between items-center mt-4'>
          <button
            onClick={handlePreviousPage}
            className='py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200'
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className='text-gray-700'>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            className='py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200'
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </main>

      <style jsx>{`
        .z-10 {
          z-index: 10;
        }
        .blur-sm {
          filter: blur(4px);
        }
      `}</style>
    </>
  );
};

export default ConnectWithIncubators;
