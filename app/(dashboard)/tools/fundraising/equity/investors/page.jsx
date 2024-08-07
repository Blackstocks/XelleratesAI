'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import useUserDetails from '@/hooks/useUserDetails';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/components/Loading';
import { supabase } from '@/lib/supabaseclient';
import AddDealflow from '@/components/AddDealflow';

const InvestorDealflow = () => {
  const { user, loading: userLoading } = useUserDetails();
  const { profile, loading: profileLoading } = useCompleteUserDetails();
  const [investors, setInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [investorsLoading, setInvestorsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dealflowEntries, setDealflowEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
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
  const [connectClicked, setConnectClicked] = useState(false);

  const itemsPerPage = 8;
  const router = useRouter();

  useEffect(() => {
    const fetchInvestors = async () => {
      setInvestorsLoading(true);
      try {
        const { data, error } = await supabase.from('investor_signup').select('*');
        if (error) throw error;

        const locations = new Set();
        const investmentTypes = new Set();
        const sectors = new Set();
        const investmentStages = new Set();

        data.forEach((item) => {
          item.Geography?.split(',').forEach((loc) => locations.add(loc.trim()));
          item.typeof?.split(',').forEach((type) => investmentTypes.add(type.trim()));
          item.sectors?.split(',').forEach((sec) => sectors.add(sec.trim()));
          item.investment_stage?.split(',').forEach((stage) => investmentStages.add(stage.trim()));
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
    const fetchDealflowEntries = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('add_dealflow')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          setDealflowEntries(data);
        } catch (error) {
          console.error('Error fetching dealflow entries:', error.message);
        }
      }
    };

    fetchDealflowEntries();
  }, [user]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleCloseModal = () => {
    setSelectedInvestor(null);
  };

  const handleConnect = async (userType) => {
    console.log('Connect button clicked');
    console.log('User Details:', {
      name: profile.name,
      email: profile.email,
      mobile: profile.mobile,
      companyName: profile.company_name,
      linkedinProfile: profile.linkedin_profile,
      userType: userType,
    });

    try {
      const { data, error } = await supabase.from('connected_startups').insert([
        {
          startup_name: profile.company_name,
          founder_name: profile.name,
          linkedin_profile: profile.linkedin_profile,
          email: profile.email,
          mobile: profile.mobile,
          user_type: userType,
        },
      ]);

      if (error) {
        throw error;
      }

      console.log('Data inserted:', data);
      setConnectClicked(true);
    } catch (error) {
      console.error('Error inserting data:', error.message);
    }
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
  };

  const handleAddDealflow = (newEntry) => {
    setDealflowEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const handleUpdateDealflow = (updatedEntry) => {
    setDealflowEntries((prevEntries) =>
      prevEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    );
  };

  const totalPages = Math.ceil(filteredInvestors.length / itemsPerPage);
  const currentInvestors = filteredInvestors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (userLoading || profileLoading || investorsLoading) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Investor Connect</title>
      </Head>
      <main className={`container mb-1 p-4 relative ${showModal ? 'blur' : ''}`}>
        <div className='absolute top-4 left-4 z-20'>
          <button
            onClick={() => router.back()}
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            Back
          </button>
        </div>
        <div className="flex justify-end mb-1">
          <button
            onClick={() => setShowModal(true)}
            className="py-2 px-4 bg-red-500 text-white rounded"
          >
            Add Dealflow
          </button>
        </div>
        <h1 className='text-3xl font-bold mb-4 text-center'>
          Investor Connect
        </h1>
        <p className='mb-2 text-center'>
          Welcome to the Investor Connect page. Here you can find information
          about investors interested in various sectors and stages.
        </p>
        
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
              <label className='block text-sm font-medium mb-1'>Investment Type</label>
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
              <label className='block text-sm font-medium mb-1'>Investment Stage</label>
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

        <div className='relative mb-4'>
          {connectClicked ? (
            <div className='absolute inset-0 flex justify-center items-center flex-col z-10'>
              <div className='bg-[#1a235e] text-white p-4 rounded shadow text-center'>
                <p className='text-lg font-bold mb-2'>
                  Our Investment Banker will connect with you soon.
                </p>
              </div>
            </div>
          ) : filteredInvestors.length > 0 ? (
            <div className='absolute inset-0 flex justify-center items-center flex-col z-10'>
              <div className='bg-[#1a235e] text-white p-4 rounded shadow text-center message-container'>
                <p className='text-lg font-bold mb-2'>
                  We have identified {filteredInvestors.length} investors for you.
                </p>
                <p className='text-md mb-4'>
                  Connect with our investment banker.
                </p>
                <button
                  onClick={() => handleConnect('equity')}
                  className='py-2 px-4 bg-[#e7ad6c] text-white rounded transition duration-200'
                >
                  Connect
                </button>
              </div>
            </div>
          ) : (
            <div className='absolute inset-0 flex justify-center items-center flex-col z-10'>
              <div className='bg-[#1a235e] text-white p-4 rounded shadow text-center message-container'>
                <p className='text-lg font-bold mb-2'>
                  We have identified 0 investors for you.
                </p>
                <p className='text-md mb-4'>
                  Connect with our investment banker.
                </p>
                <button
                  onClick={() => handleConnect('equity')}
                  className='py-2 px-4 bg-[#e7ad6c] text-white rounded transition duration-200'
                >
                  Connect
                </button>
              </div>
            </div>
          )}

          <div className='overflow-x-auto filter blur-sm blur-container'>
            <table className='min-w-full bg-white border border-gray-300'>
              <thead>
                <tr>
                  <th className='py-4 px-4 border-b border-gray-300 text-left'>
                    S.No
                  </th>
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
                </tr>
              </thead>
              <tbody>
                {currentInvestors.map((investor, index) => (
                  <tr
                    key={investor.id}
                    className={`hover:bg-gray-100 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    }`}
                    onClick={() => {
                      setSelectedInvestor(investor);
                      setShowForm(false);
                    }}
                  >
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      <div>
                        <span className='text-black-500 hover:underline cursor-pointer'>
                          {investor.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      {investor.Geography || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      {investor.typeof || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      {investor.sectors || 'N/A'}
                    </td>
                    <td className='py-2 px-4 border-b border-gray-300 text-sm'>
                      {investor.investment_stage || 'N/A'}
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
      <AddDealflow
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddDealflow={handleAddDealflow}
        onUpdateDealflow={handleUpdateDealflow}
        user={user}
        dealflowEntries={dealflowEntries}
      />
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
