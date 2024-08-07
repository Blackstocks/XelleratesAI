'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Modal from '@/components/Modal1';
import Loading from '@/components/Loading';
import { supabase } from '@/lib/supabaseclient';
import useIncubatorConnections from '@/hooks/useIncubatorConnections';

const IncubatorDetails = () => {
  const { companyProfile, loading: profileLoading } = useCompleteUserDetails();
  const {
    connectedIncubators,
    connecting,
    loading,
    connectToIncubator,
    showConnectionModal,
    setShowConnectionModal,
  } = useIncubatorConnections(companyProfile?.id);
  const [incubators, setIncubators] = useState([]);
  const [filteredIncubators, setFilteredIncubators] = useState([]);
  const [incubatorsLoading, setIncubatorsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    state: [],
    city: [],
    category: [],
  });

  const [selectedFilters, setSelectedFilters] = useState({
    state: '',
    city: '',
    category: '',
    connectionStatus: '', // New filter for connected or non-connected
  });

  const itemsPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const fetchIncubators = async () => {
      setIncubatorsLoading(true);
      try {
        const { data, error } = await supabase.from('Incubators').select('*');
        if (error) throw error;

        const states = new Set();
        const cities = new Set();
        const categories = new Set();

        data.forEach((item) => {
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

        // Sort the fetched data such that connected incubators appear last
        const sortedData = data.sort((a, b) => {
          const aConnected = connectedIncubators.includes(a.id);
          const bConnected = connectedIncubators.includes(b.id);
          return aConnected - bConnected;
        });

        setIncubators(sortedData);
        setFilteredIncubators(sortedData);
      } catch (error) {
        console.error('Error fetching incubators:', error.message);
      } finally {
        setIncubatorsLoading(false);
      }
    };

    fetchIncubators();
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
    if (selectedFilters.connectionStatus) {
      if (selectedFilters.connectionStatus === 'connected') {
        filtered = filtered.filter((incubator) =>
          connectedIncubators.includes(incubator.id)
        );
      } else if (selectedFilters.connectionStatus === 'non-connected') {
        filtered = filtered.filter(
          (incubator) => !connectedIncubators.includes(incubator.id)
        );
      }
    }

    // Sort connected incubators to the end
    filtered.sort((a, b) => {
      const aConnected = connectedIncubators.includes(a.id);
      const bConnected = connectedIncubators.includes(b.id);
      return aConnected - bConnected;
    });

    setFilteredIncubators(filtered);
    setCurrentPage(1); // Reset to first page whenever filters change
  }, [selectedFilters, incubators, connectedIncubators]);

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
      connectionStatus: '',
    });
  };

  const formatHeading = (heading) => {
    return heading
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const totalPages = Math.ceil(filteredIncubators.length / itemsPerPage);
  const currentIncubators = filteredIncubators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (profileLoading || incubatorsLoading) {
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
        <h1 className='text-3xl font-bold mb-4 text-center'>
          Incubator Connect
        </h1>
        <p className='mb-6 text-center'>
          Welcome to the Incubator Connect page. Here you can find information
          about various incubators.
        </p>
        <div className='mb-4'>
          <h2 className='text-xl font-bold mb-2'>Filters</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'>
            <div>
              <label className='block text-sm font-medium mb-1'>State</label>
              <select
                name='state'
                value={selectedFilters.state}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select State</option>
                {filters.state.map((state, index) => (
                  <option key={index} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>City</label>
              <select
                name='city'
                value={selectedFilters.city}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select City</option>
                {filters.city.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Sector</label>
              <select
                name='category'
                value={selectedFilters.category}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select Sector</option>
                {filters.category.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Connection Status
              </label>
              <select
                name='connectionStatus'
                value={selectedFilters.connectionStatus}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select Status</option>
                <option value='connected'>Connected</option>
                <option value='non-connected'>Non-Connected</option>
              </select>
            </div>
            <div className='flex items-end'>
              <button
                onClick={handleClearFilters}
                className='py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded transition duration-200 w-1/2'
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentIncubators.map((incubator, index) => (
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
                      {incubator.portCity?.split(', ')[0] || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      {incubator.portCity?.split(', ')[1] || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      {connectedIncubators.includes(incubator.id) ? (
                        <button
                          className='bg-gray-400 text-white px-4 py-2 rounded'
                          disabled
                        >
                          Connected
                        </button>
                      ) : (
                        <button
                          className='bg-blue-500 text-white px-4 py-2 rounded'
                          onClick={() => connectToIncubator(incubator.id)}
                          disabled={connecting[incubator.id] || loading}
                        >
                          {connecting[incubator.id]
                            ? 'Connecting...'
                            : 'Connect'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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
      <Modal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      >
        <div className='bg-[#1a235e] text-white p-6 rounded-lg shadow-lg text-center max-w-md mx-auto'>
          <p className='text-lg font-bold mb-2'>
            Connection successful. We will get back to you soon.
          </p>
          <button
            className='mt-4 py-2 px-4 bg-[#e7ad6c] text-white rounded transition duration-200'
            onClick={() => setShowConnectionModal(false)}
          >
            Close
          </button>
        </div>
      </Modal>
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

export default IncubatorDetails;
