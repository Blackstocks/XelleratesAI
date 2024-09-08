import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useStartupsRawApproved = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startupCount, setStartupCount] = useState(0); // State for the number of startups

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        // Fetch the count of startups from the company_profile table
        const { count, error: countError } = await supabase
          .from('company_profile')
          .select('id', { count: 'exact' });

        if (countError) throw countError;

        setStartupCount(count);

        // Fetch the startup details with status = 'approved'
        const { data, error } = await supabase
          .from('company_profile')
          .select(
            `
            id,
            company_name,
            profiles!inner (*)
          `
          )
          .eq('profiles.user_type', 'startup')
          .eq('profiles.status', 'approved'); // Filter by approved status in the profiles table

        if (error) throw error;

        console.log('Fetched Approved Startups Data:', data);
        setStartups(data);
      } catch (error) {
        console.error('Error fetching startups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  return { startups, loading, startupCount };
};

export default useStartupsRawApproved;
