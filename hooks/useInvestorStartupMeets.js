import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useInvestorStartupMeets = (userId, companyProfileId) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        let data;

        if (companyProfileId) {
          // Fetch meetings for a startup
          const { data: startupMeetings, error: startupError } = await supabase
            .from('events')
            .select('*')
            .or(
              `sender_id.eq.${companyProfileId},receiver_id.eq.${companyProfileId}`
            )
            .order('date', { ascending: false });

          if (startupError) throw startupError;
          data = startupMeetings;
        } else if (userId) {
          // Fetch meetings for an investor
          const { data: investorMeetings, error: investorError } =
            await supabase
              .from('events')
              .select('*')
              .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
              .order('date', { ascending: false });

          if (investorError) throw investorError;
          data = investorMeetings;
        }

        setMeetings(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId || companyProfileId) {
      fetchMeetings();
    }
  }, [userId, companyProfileId]);

  return { meetings, loading, error };
};

export default useInvestorStartupMeets;
