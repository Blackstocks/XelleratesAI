'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/app/loading';
import { supabase } from '@/lib/supabaseclient';

const InvestorDealflow = () => {
  const { user, loading: userLoading } = useUserDetails();
  const [investors, setInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [investorsLoading, setInvestorsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    location: [],
    investmentType: [],
    sector: [],
    investmentStage: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    location: '',
    investmentType: '',
    sector: '',
    investmentStage: '',
  });
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  const itemsPerPage = 8;
  const router = useRouter();

  useEffect(() => {
    const fetchInvestors = async () => {
      setInvestorsLoading(true);
      try {
        const { data, error } = await supabase
          .from('investor_signup')
          .select('*');
        if (error) throw error;

        const locations = new Set();
        const investmentTypes = new Set();
        const sectors = new Set();
        const investmentStages = new Set();

        data.forEach((item) => {
          item.Geography?.split(',').forEach((loc) =>
            locations.add(loc.trim())
          );
          item.typeof
            ?.split(',')
            .forEach((type) => investmentTypes.add(type.trim()));
          item.sectors?.split(',').forEach((sec) => sectors.add(sec.trim()));
          item.investment_stage
            ?.split(',')
            .forEach((stage) => investmentStages.add(stage.trim()));
        });

        setFilters({
          location: Array.from(locations).sort(),
          investmentType: Array.from(investmentTypes).sort(),
          sector: Array.from(sectors).sort(),
          investmentStage: Array.from(investmentStages).sort(),
        });

        setInvestors(data);
        setFilteredInvestors(data);
      } catch (error) {
        console.error('Error fetching investors:', error.message);
      } finally {
        setInvestorsLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      const filtered = investors.filter((investor) => {
        const matchesLocation =
          selectedFilters.location === '' ||
          investor.Geography?.includes(selectedFilters.location);
        const matchesInvestmentType =
          selectedFilters.investmentType === '' ||
          investor.typeof?.includes(selectedFilters.investmentType);
        const matchesSector =
          selectedFilters.sector === '' ||
          investor.sectors?.includes(selectedFilters.sector);
        const matchesInvestmentStage =
          selectedFilters.investmentStage === '' ||
          investor.investment_stage?.includes(selectedFilters.investmentStage);

        const matchesSearchQuery = [
          investor.name,
          investor.company_name,
          investor.Geography,
          investor.typeof,
          investor.sectors,
          investor.investment_stage,
        ].some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
          matchesLocation &&
          matchesInvestmentType &&
          matchesSector &&
          matchesInvestmentStage &&
          matchesSearchQuery
        );
      });

      setFilteredInvestors(filtered);
      setCurrentPage(1); // Reset to first page when filters or search query changes
    };

    applyFilters();
  }, [selectedFilters, searchQuery, investors]);

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
      location: '',
      investmentType: '',
      sector: '',
      investmentStage: '',
    });
    setSearchQuery(''); // Clear search query when filters are cleared
    setFilteredInvestors(investors); // Reset to original investor list
    setCurrentPage(1); // Reset to first page
  };

  const totalPages = Math.ceil(filteredInvestors.length / itemsPerPage);
  const currentInvestors = filteredInvestors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (userLoading || investorsLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Investor Connect</title>
      </Head>
      <main className='container mb-1 p-4 relative'>
        <div className='absolute top-4 right-4 z-20'>
          <input 
            type='text'
            placeholder='Search investors...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded'
          />
        </div>
        <h1 className='text-3xl font-bold mb-4 text-center'>
          Registered Investors
        </h1>
        <div className='mb-4'>
          <h2 className='text-xl font-bold mb-2'>Filters</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'>
            <div>
              <label className='block text-sm font-medium mb-1'>Location</label>
              <select
                name='location'
                value={selectedFilters.location}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select Location</option>
                {filters.location.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Investment Type
              </label>
              <select
                name='investmentType'
                value={selectedFilters.investmentType}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select Investment Type</option>
                {filters.investmentType.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Sector</label>
              <select
                name='sector'
                value={selectedFilters.sector}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select Sector</option>
                {filters.sector.map((sector, index) => (
                  <option key={index} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Investment Stage
              </label>
              <select
                name='investmentStage'
                value={selectedFilters.investmentStage}
                onChange={handleFilterChange}
                className='w-full px-3 py-2 border border-gray-300 rounded'
              >
                <option value=''>Select Investment Stage</option>
                {filters.investmentStage.map((stage, index) => (
                  <option key={index} value={stage}>
                    {stage}
                  </option>
                ))}
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

        <div className='overflow-x-auto'>
          <h2 className='text-xl font-bold mb-2'>Investors</h2>
          <table className='min-w-full bg-white border border-gray-300'>
            <thead>
              <tr>
                <th className='py-4 px-4 border-b border-gray-300 text-left'>
                  Investor Info
                </th>
                <th className='py-4 px-4 border-b border-gray-300 text-left'>
                  Location
                </th>
                <th className='py-4 px-4 border-b border-gray-300 text-left'>
                  Investment Type
                </th>
                <th className='py-4 px-4 border-b border-gray-300 text-left'>
                  Sector
                </th>
                <th className='py-4 px-4 border-b border-gray-300 text-left'>
                  Investment Stage
                </th>
                <th className='py-4 px-4 border-b border-gray-300 text-left'>
                  Company Name
                </th>
              </tr>
            </thead>
            <tbody>
              {currentInvestors.map((investor, index) => {
                const sectorsArray = investor.sectors
                  ? investor.sectors.split(',')
                  : [];

                return (
                  <tr
                    key={index}
                    className={`hover:bg-gray-100 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    }`}
                  >
                    <td className='py-2 px-4 border-b border-gray-300'>
                      {investor.name || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300'>
                      {investor.Geography || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300'>
                      {investor.typeof || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300'>
                      {sectorsArray.length > 0 ? (
                        <ul>
                          {sectorsArray.map((sector, index) => (
                            <li key={index}>{sector.trim()}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>N/A</p>
                      )}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300'>
                      {investor.investment_stage || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300'>
                      {investor.company_name || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
        .blur {
          filter: blur(5px);
        }
        .z-10 {
          z-index: 10;
        }
      `}</style>
    </>
  );
};

export default InvestorDealflow;
