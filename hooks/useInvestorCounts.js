import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useInvestorCounts = (startupId, userId) => {
  // console.log('startupId', startupId);
  // console.log('userId', userId);
  const [investorCount, setInvestorCount] = useState(0);
  const [assignedInvestorCount, setAssignedInvestorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestorCounts = async () => {
      setLoading(true);

      try {
        // Fetch total investors count
        const { count: totalCount, error: totalError } = await supabase
          .from('investor_signup')
          .select('*', { count: 'exact' });

        if (totalError) throw totalError;

        setInvestorCount(totalCount);

        // Fetch assigned investors count for the specific startup
        if (userId) {
          try {
            // Step 1: Fetch the id from connected_startup_equity by matching user_id
            const { data: connectedEquityData, error: connectedEquityError } =
              await supabase
                .from('connected_startup_equity')
                .select('id')
                .eq('user_id', userId);

            if (connectedEquityError) throw connectedEquityError;

            // Extract the id from the result
            const startupEquityId = connectedEquityData?.[0]?.id;

            // console.log('startupEquityId', startupEquityId);

            if (startupEquityId) {
              // Step 2: Use the id to fetch the count of assigned dealflows
              const { count: assignedCount, error: assignedError } =
                await supabase
                  .from('assigned_dealflow')
                  .select('*', { count: 'exact' })
                  .eq('startup_id', startupEquityId);

              if (assignedError) throw assignedError;

              // Set the assigned investor count
              setAssignedInvestorCount(assignedCount);
            } else {
              console.error(
                'No matching startup equity found for the given userId.'
              );
            }
          } catch (error) {
            console.error('Error fetching assigned dealflow count:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching investor counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestorCounts();
  }, [startupId]);

  return { investorCount, assignedInvestorCount, loading };
};

export default useInvestorCounts;
