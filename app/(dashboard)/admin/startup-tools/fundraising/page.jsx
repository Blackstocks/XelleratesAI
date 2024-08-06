'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';

const Fundraising = () => {
  const [connectedStartups, setConnectedStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('equity');

  useEffect(() => {
    const fetchConnectedStartups = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('connected_startups')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setConnectedStartups(data);
      } catch (error) {
        console.error('Error fetching connected startups:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectedStartups();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('connected_startups')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setConnectedStartups((prevStartups) =>
        prevStartups.map((startup) =>
          startup.id === id ? { ...startup, status: newStatus } : startup
        )
      );
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };

  const handleCommentChange = async (id, newComment) => {
    try {
      const { data, error } = await supabase
        .from('connected_startups')
        .update({ comment: newComment })
        .eq('id', id);

      if (error) throw error;

      setConnectedStartups((prevStartups) =>
        prevStartups.map((startup) =>
          startup.id === id ? { ...startup, comment: newComment } : startup
        )
      );
    } catch (error) {
      console.error('Error updating comment:', error.message);
    }
  };

  const filteredStartups = connectedStartups.filter(
    (startup) => startup.user_type === selectedType
  );

  const getStatusClass = (status) => {
    if (status === 'pending') return 'bg-red-500 text-white';
    if (status === 'follow up') return 'bg-yellow-500 text-white';
    if (status === 'reached') return 'bg-green-500 text-white';
    return '';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Fundraising</h1>
      <div className="mb-4">
        <button
          onClick={() => setSelectedType('equity')}
          className={`py-2 px-4 rounded mr-2 ${
            selectedType === 'equity' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Equity
        </button>
        <button
          onClick={() => setSelectedType('debt')}
          className={`py-2 px-4 rounded ${
            selectedType === 'debt' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Debt
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Company Name
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Founder Name
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Email
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Mobile
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                LinkedIn
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Status
              </th>
              <th className="py-4 px-4 border-b border-gray-300 text-left">
                Comment
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStartups.map((startup, index) => (
              <tr
                key={startup.id}
                className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
              >
                <td className="py-2 px-4 border-b border-gray-300">
                  {startup.startup_name}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  {startup.founder_name}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  {startup.email}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  {startup.mobile}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <a
                    href={startup.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <select
                    value={startup.status}
                    onChange={(e) => handleStatusChange(startup.id, e.target.value)}
                    className={`w-full px-2 py-1 border rounded ${
                      startup.status === 'pending'
                        ? 'bg-red-500'
                        : startup.status === 'follow up'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    } text-white`}
                  >
                    <option value="pending" className="bg-white text-black-500">Pending</option>
                    <option value="follow up" className="bg-white text-black-500">Follow Up</option>
                    <option value="reached" className="bg-white text-black-500">Reached</option>
                  </select>
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <textarea
                    value={startup.comment || ''}
                    onChange={(e) =>
                      handleCommentChange(startup.id, e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Fundraising;
