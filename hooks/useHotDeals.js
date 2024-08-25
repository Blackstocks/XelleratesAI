import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseclient'; // Ensure the correct path to your Supabase client

const useHotDeals = (investorId, shouldFetch = true) => {
  // console.log('useHotDeals investorId:', investorId);
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHotDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch hot deals directly from Supabase
      const { data, error: fetchError } = await supabase
        .from('hot_deals')
        .select(
          'startup_id, rank, name, company_logo, founder_name, company_name'
        )
        .eq('investor_id', investorId)
        .order('rank', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setHotDeals(data);
    } catch (error) {
      console.error('Error fetching hot deals:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [investorId]); // Dependency on id

  useEffect(() => {
    if (!shouldFetch || !investorId) return;

    fetchHotDeals();

    // Cleanup logic if needed, although we don't need an AbortController here
    // since Supabase queries aren't cancellable in the same way as fetch requests.
  }, [fetchHotDeals, shouldFetch, investorId]);

  // Manual refetch function
  const refetch = () => {
    fetchHotDeals();
  };

  return { hotDeals, loading, error, refetch };
};

export default useHotDeals;
