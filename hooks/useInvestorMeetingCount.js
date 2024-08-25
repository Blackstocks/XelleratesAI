import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useInvestorMeetingCount = (investorId) => {
  const [meetingCount, setMeetingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeetingCount = async () => {
      setLoading(true);
      try {
        // Fetch count of scheduled meetings where the investor is either the sender or receiver
        const { count, error } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .or(`sender_id.eq.${investorId},receiver_id.eq.${investorId}`)
          .not('zoom_link', 'is', null)
          .not('date', 'is', null);

        if (error) throw error;

        setMeetingCount(count);
      } catch (error) {
        console.error('Error fetching meeting count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingCount();
  }, [investorId]);

  return { meetingCount, loading };
};

export default useInvestorMeetingCount;
