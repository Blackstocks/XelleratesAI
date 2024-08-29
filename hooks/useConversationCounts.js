import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient'; // Adjust the path to your Supabase client

const useConversationCounts = (userId) => {
  // console.log('userId', userId);
  const [openConversationsCount, setOpenConversationsCount] = useState(0);
  const [closedConversationsCount, setClosedConversationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversationCounts = async () => {
      try {
        setLoading(true);
        // Define open and closed statuses
        const openStatuses = [
          'moving_forward',
          'evaluated',
          'meeting_done, curated_deal',
        ];
        const closedStatuses = ['rejected', 'investment'];

        // Fetch data from Supabase based on companyProfileId
        const { data, error } = await supabase
          .from('investor_startup_assignments')
          .select('status')
          .eq('investor_id', userId);

        if (error) {
          throw new Error(error.message);
        }

        // Calculate the counts for open and closed conversations
        const openCount = data.filter((item) =>
          openStatuses.includes(item.status)
        ).length;
        const closedCount = data.filter((item) =>
          closedStatuses.includes(item.status)
        ).length;

        setOpenConversationsCount(openCount);
        setClosedConversationsCount(closedCount);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch the conversation counts
    fetchConversationCounts();
  }, [userId]); // Re-run the effect when companyProfileId changes

  // console.log('openConversationsCount', openConversationsCount);
  // console.log('closedConversationsCount', closedConversationsCount);

  return { openConversationsCount, closedConversationsCount, loading, error };
};

export default useConversationCounts;
