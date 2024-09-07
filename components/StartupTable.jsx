// StartupTable.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal3 from '@/components/ui/Modal3'; // Use Modal3 component
import RegForm1 from './RegForm1'; // Import the form component
import Profile from '@/components/addStartup/profile';
import { supabase } from '@/lib/supabaseclient';

const StartupTable = () => {
  const [startups, setStartups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const fetchMappedStartups = async () => {
    try {
      const { data: mappedStartups, error } = await supabase
        .from('investor_startup_mapping')
        .select('investor_id, startup_id, status, created_at, profiles!investor_id(name, company_logo), profiles!startup_id(name, company_logo)');

      if (error) {
        console.error('Error fetching mapped startups:', error.message);
        toast.error('Error fetching mapped startups.');
        return;
      }

      setStartups(mappedStartups);
    } catch (err) {
      console.error('Unexpected error fetching startups:', err);
      toast.error('An unexpected error occurred while fetching startups.');
    }
  };

  useEffect(() => {
    fetchMappedStartups();
  }, []);

  const handleAddStartup = () => {
    setShowModal(true); // Open modal to add startup
  };

  const handleUpdateStartup = (startup) => {
    setSelectedProfile(startup); // Set the startup profile to view in Profile component
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  // Ensure handleSubmitSuccess is defined correctly as a function
  const handleSubmitSuccess = () => {
    setShowModal(false);
    fetchMappedStartups(); // Refresh the table data after a successful submission
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Startups Mapped to Investor</h2>
        <button className="btn btn-primary" onClick={handleAddStartup}>
          Add Startup
        </button>
      </div>

      {startups.length === 0 ? (
        <p>No entries available (NA)</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Investor Logo</th>
              <th className="py-2 px-4 border-b">Investor Name</th>
              <th className="py-2 px-4 border-b">Startup Logo</th>
              <th className="py-2 px-4 border-b">Startup Name</th>
              <th className="py-2 px-4 border-b">Update</th>
            </tr>
          </thead>
          <tbody>
            {startups.map((startup) => (
              <tr key={startup.startup_id}>
                <td className="py-2 px-4 border-b">
                  <img src={startup.profiles_investor_id.company_logo || '/default-logo.png'} alt="Investor Logo" className="h-8 w-8" />
                </td>
                <td className="py-2 px-4 border-b">{startup.profiles_investor_id.name}</td>
                <td className="py-2 px-4 border-b">
                  <img src={startup.profiles_startup_id.company_logo || '/default-logo.png'} alt="Startup Logo" className="h-8 w-8" />
                </td>
                <td className="py-2 px-4 border-b">{startup.profiles_startup_id.name}</td>
                <td className="py-2 px-4 border-b">
                  <button className="btn btn-secondary" onClick={() => handleUpdateStartup(startup.profiles_startup_id)}>
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Adding Startup */}
      {showModal && (
        <Modal3 onClose={handleCloseModal}>
          {/* Ensure the function handleSubmitSuccess is passed correctly */}
          <RegForm1 onSuccess={handleSubmitSuccess} />
        </Modal3>
      )}

      {/* Profile Component for Updating Startup */}
      {selectedProfile && <Profile profileData={selectedProfile} />}
    </div>
  );
};

export default StartupTable;
