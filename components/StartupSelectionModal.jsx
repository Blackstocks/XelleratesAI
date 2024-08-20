import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify';

const StartupSelectionModal = ({ investor, onClose }) => {
  const [startups, setStartups] = useState([]);
  const [selectedStartups, setSelectedStartups] = useState({});

  useEffect(() => {
    const fetchStartups = async () => {
      const { data, error } = await supabase.from('company_profile').select('id, company_name');
      if (error) {
        console.error(error);
      } else {
        setStartups(data);
      }
    };
    fetchStartups();
  }, []);

  const handleSelection = (startupId, rank) => {
    setSelectedStartups((prev) => ({
      ...prev,
      [rank]: startupId,
    }));
  };

  const saveSelections = async () => {
    try {
      await supabase.from('hot_deal_new').delete().eq('investor_id', investor.id); // Clear previous selections

      const entries = Object.entries(selectedStartups).map(([rank, startupId]) => ({
        investor_id: investor.id,
        startup_id: startupId,
        rank: parseInt(rank),
      }));

      const { error } = await supabase.from('hot_deal_new').insert(entries);

      if (error) {
        throw error;
      }

      toast.success('Selections saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving selections:', error);
      toast.error('Error saving selections');
    }
  };

  return (
    <div>
      <h3>Select Startups for {investor.name}</h3>
      <ul>
        {startups.map((startup) => (
          <li key={startup.id}>
            <span>{startup.company_name}</span>
            <select onChange={(e) => handleSelection(startup.id, e.target.value)}>
              <option value="">Select Rank</option>
              <option value="1">1st</option>
              <option value="2">2nd</option>
              <option value="3">3rd</option>
            </select>
          </li>
        ))}
      </ul>
      <button onClick={saveSelections}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default StartupSelectionModal;
