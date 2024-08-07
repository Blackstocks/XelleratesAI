import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const useIncubatorConnections = (companyProfileId) => {
  const [connectedIncubators, setConnectedIncubators] = useState([]);
  const [connecting, setConnecting] = useState({}); // Track connecting state for each incubator
  const [loading, setLoading] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('connect_startup_incubator')
          .select('incubator_id')
          .eq('startup_id', companyProfileId);

        if (error) throw error;

        setConnectedIncubators(data.map((item) => item.incubator_id));
      } catch (error) {
        console.error('Error fetching connections:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyProfileId) {
      fetchConnections();
    }
  }, [companyProfileId]);

  const connectToIncubator = async (incubatorId) => {
    try {
      setConnecting((prev) => ({ ...prev, [incubatorId]: true })); // Set connecting state for this incubator
      const { data, error } = await supabase
        .from('connect_startup_incubator')
        .insert([
          {
            startup_id: companyProfileId,
            incubator_id: incubatorId,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      setConnectedIncubators((prev) => [...prev, incubatorId]);
      setModalContent('Connection successful. We will get back to you soon.');
      setShowConnectionModal(true); // Show the modal after successful connection
      toast.success('Connection request sent successfully');
    } catch (error) {
      console.error('Error connecting to incubator:', error.message);
      toast.error('Error connecting to incubator');
    } finally {
      setConnecting((prev) => ({ ...prev, [incubatorId]: false })); // Reset connecting state for this incubator
    }
  };

  return {
    connectedIncubators,
    connecting,
    loading,
    connectToIncubator,
    showConnectionModal,
    setShowConnectionModal,
  };
};

export default useIncubatorConnections;
