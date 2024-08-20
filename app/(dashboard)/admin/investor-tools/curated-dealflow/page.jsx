'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import AssignStartupsModal from '@/components/AssignStartupsModal';
import ViewAssignedInvestorsModal from '@/components/ViewAssignedInvestorsModal';

const CuratedDealflow = () => {
  const [connectedInvestors, setConnectedInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConnectedInvestors = async () => {
      try {
        const { data, error } = await supabase
          .from('connected_investors')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setConnectedInvestors(data);
        setFilteredInvestors(data);

        const types = [...new Set(data.map((investor) => investor.user_type))];
        setUniqueTypes(types);
      } catch (error) {
        console.error('Error fetching connected investors:', error.message);
        setErrorMessage(
          'Failed to fetch connected investors. Please try again later.'
        );
      }
    };

    fetchConnectedInvestors();
  }, []);

  const openAssignModal = (investor) => {
    setSelectedInvestor(investor);
    setShowAssignModal(true);
  };

  const handleSaveAssignedStartups = async (startups) => {
    if (!selectedInvestor) {
      console.error('No investor selected');
      return;
    }

    const assignedData = startups.map((startup) => ({
      investor_id: selectedInvestor.profile_id,
      startup_id: startup.startup_id,
      created_at: new Date(),
    }));

    try {
      const { error } = await supabase
        .from('investor_startup_assignments')
        .insert(assignedData);

      if (error) {
        throw error;
      }

      setShowAssignModal(false);
    } catch (error) {
      console.error('Error saving assigned startups:', error.message);
      setErrorMessage('Failed to assign startups. Please try again later.');
    }
  };

  const openViewModal = (investor) => {
    setSelectedInvestor(investor);
    setShowViewModal(true);
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = connectedInvestors.filter((investor) => {
      return (
        investor.name.toLowerCase().includes(searchTerm) ||
        investor.email.toLowerCase().includes(searchTerm) ||
        investor.mobile.toLowerCase().includes(searchTerm)
      );
    });

    setFilteredInvestors(filtered);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);

    const filtered = connectedInvestors.filter((investor) => {
      const matchesType =
        !event.target.value || investor.user_type === event.target.value;
      const matchesSearch =
        investor.name.toLowerCase().includes(searchTerm) ||
        investor.email.toLowerCase().includes(searchTerm) ||
        investor.mobile.toLowerCase().includes(searchTerm);

      return matchesType && matchesSearch;
    });

    setFilteredInvestors(filtered);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-3xl font-bold'>Curated Dealflow</h1>
        <input
          type='text'
          value={searchTerm}
          onChange={handleSearch}
          placeholder='Search'
          className='py-2 px-4 rounded border border-gray-300'
          style={{ maxWidth: '300px' }}
        />
      </div>

      {errorMessage && (
        <div className='bg-red-500 text-white p-2 mb-4 rounded'>
          {errorMessage}
        </div>
      )}

      <div className='mb-4'>
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className='py-2 px-4 rounded border-gray-300'
        >
          <option value=''>All Types</option>
          {uniqueTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <table className='min-w-full bg-white border border-gray-300'>
        <thead>
          <tr>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Investor Name
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Email
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Mobile
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Assign
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              View Assigned Startups
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredInvestors.map((investor, index) => (
            <tr
              key={investor.id}
              className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
            >
              <td className='py-2 px-4 border-b border-gray-300'>
                {investor.name}
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                {investor.email}
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                {investor.mobile}
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                <button
                  onClick={() => openAssignModal(investor)}
                  className='py-1 px-2 bg-blue-500 text-white rounded'
                >
                  Assign Startups
                </button>
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                <button
                  onClick={() => openViewModal(investor)}
                  className='py-1 px-2 bg-green-500 text-white rounded'
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAssignModal && (
        <AssignStartupsModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          handleSaveAssignedStartups={handleSaveAssignedStartups}
          profileId={selectedInvestor ? selectedInvestor?.profile_id : null}
        />
      )}

      {showViewModal && (
        <ViewAssignedInvestorsModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          investorId={selectedInvestor ? selectedInvestor?.profile_id : null}
        />
      )}
    </div>
  );
};

export default CuratedDealflow;
