import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useHotDealsNew = (investorId) => {
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotDeals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('hot_deal_new')
        .select('startup_id, rank')
        .eq('investor_id', investorId)
        .order('rank', { ascending: true });

      if (error) {
        setError(error);
      } else {
        const startupIds = data.map((deal) => deal.startup_id);
        const { data: startups, error: startupsError } = await supabase
          .from('company_profile')
          .select('id, company_name, company_logo, founder_name')
          .in('id', startupIds);

        if (startupsError) {
          setError(startupsError);
        } else {
          const hotDealsWithDetails = data.map((deal) => {
            const startup = startups.find((s) => s.id === deal.startup_id);
            return {
              ...deal,
              companyName: startup.company_name,
              companyLogo: startup.company_logo,
              founderName: startup.founder_name,
            };
          });
          setHotDeals(hotDealsWithDetails);
        }
      }
      setLoading(false);
    };

    fetchHotDeals();
  }, [investorId]);

  return { hotDeals, loading, error };
};

export default useHotDealsNew;
