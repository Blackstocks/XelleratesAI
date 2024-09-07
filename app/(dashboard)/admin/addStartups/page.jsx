'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal3 from '@/components/Modal3'; // Modal component
import RegForm1 from '@/components/RegForm1'; // Form component
import { supabase } from '@/lib/supabaseclient';
import Profile from '@/components/addStartup/profile';

const AddStartupsPage = () => {
  const [startups, setStartups] = useState([]); // State to store startup data
  const [showModal, setShowModal] = useState(false); // State to control modal visibility for adding startup
  const [showProfileModal, setShowProfileModal] = useState(false); // State to control modal visibility for profile
  const [selectedProfile, setSelectedProfile] = useState(null); // State to store selected profile for update

  // Fetch the startups mapped to investors from the database
  const fetchMappedStartups = async () => {
    try {
      // Fetch from investor_startup_mapping
      const { data: mappedStartups, error } = await supabase
        .from('investor_startup_mapping')
        .select(`
          id,
          investor_id,
          startup_id,
          status,
          created_at,
          investor:profiles!investor_id (id, name, company_logo),
          startup:profiles!startup_id (id, name, company_logo)
        `);

      if (error) {
        console.error('Error fetching mapped startups:', error.message);
        toast.error('Error fetching mapped startups.');
        return;
      }

      setStartups(mappedStartups); // Store the fetched data in state
    } catch (err) {
      console.error('Unexpected error fetching startups:', err);
      toast.error('An unexpected error occurred while fetching startups.');
    }
  };

  // Fetch startups on component mount
  useEffect(() => {
    fetchMappedStartups();
  }, []);

  // Function to open the modal for adding a new startup
  const handleAddStartup = () => {
    setShowModal(true); // Show the modal with the form
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  // Function to handle successful submission from RegForm1
  const handleSubmitSuccess = () => {
    setShowModal(false); // Close the modal
    fetchMappedStartups(); // Refresh the table data after successful submission
  };

  // Function to handle update button click and open profile component in a modal
  const handleUpdateStartup = (startup) => {
    setSelectedProfile(startup); // Set the startup profile to view in Profile component
    setShowProfileModal(true); // Show the profile modal
  };

  // Function to close the profile modal
  const handleCloseProfileModal = () => {
    setShowProfileModal(false); // Close the profile modal
  };

  return (
    <div className="p-6">
      {/* Header with "Add Startup" button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Startups Mapped to Investor</h2>
        <button className="btn btn-primary" onClick={handleAddStartup}>
          Add Startup
        </button>
      </div>

      {/* Display the table or a message if no entries are available */}
      {startups.length === 0 ? (
        <p>No entries available (NA)</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Investor & Startup</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {startups.map((startup) => (
              <tr key={startup.id}>
                {/* Combined Investor and Startup column */}
                <td className="py-2 px-4 border-b">
                  <div className="flex items-center space-x-4">
                    {/* Investor details */}
                    <div className="flex items-center space-x-2">
                      <img src={startup.investor.company_logo || '/default-logo.png'} alt="Investor Logo" className="h-8 w-8" />
                      <span>{startup.investor.name}</span>
                    </div>
                    {/* Divider */}
                    <span className="text-gray-500">|</span>
                    {/* Startup details */}
                    <div className="flex items-center space-x-2">
                      <img src={startup.startup.company_logo || '/default-logo.png'} alt="Startup Logo" className="h-8 w-8" />
                      <span>{startup.startup.name}</span>
                    </div>
                  </div>
                </td>

                {/* Action column with Update button */}
                <td className="py-2 px-4 border-b">
                  <button className="btn btn-secondary" onClick={() => handleUpdateStartup(startup.startup)}>
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
          {/* Pass handleSubmitSuccess correctly as a function */}
          <RegForm1 onSuccess={handleSubmitSuccess} />
        </Modal3>
      )}

      {/* Modal for Viewing/Updating Profile */}
      {showProfileModal && (
        <Modal3 onClose={handleCloseProfileModal}>
          <Profile profileData={selectedProfile} />
        </Modal3>
      )}
    </div>
  );
};

export default AddStartupsPage;