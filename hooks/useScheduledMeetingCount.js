import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useScheduledMeetingCount = (startupId) => {
  const [scheduledMeetingCount, setScheduledMeetingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduledMeetingCount = async () => {
      setLoading(true);
      try {
        // Fetch count of scheduled meetings with this startup
        const { count, error } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .or(`sender_id.eq.${startupId},receiver_id.eq.${startupId}`)
          .not('zoom_link', 'is', null)
          .not('date', 'is', null);

        if (error) throw error;

        setScheduledMeetingCount(count);
      } catch (error) {
        console.error('Error fetching scheduled meeting count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledMeetingCount();
  }, [startupId]);

  return { scheduledMeetingCount, loading };
};

export default useScheduledMeetingCount;
