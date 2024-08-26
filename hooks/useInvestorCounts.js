import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useInvestorCounts = ({ startupId }) => {
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
        const { count: assignedCount, error: assignedError } = await supabase
          .from('assigned_dealflow')
          .select('*', { count: 'exact' })
          .eq('startup_id', startupId); // Filtering based on startupId

        if (assignedError) throw assignedError;

        setAssignedInvestorCount(assignedCount);
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
