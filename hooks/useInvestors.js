import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useInvestors = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles') // Assuming the table name is 'profiles'
          .select(
            `
            id,
            name,
            email,
            mobile,
            user_type,
            investor_signup (
              id,
              name,
              email,
              mobile,
              typeof,
              investment_thesis,
              cheque_size,
              sectors,
              investment_stage,
              created_at,
              profile_id,
              profile_photo
            )
          `
          )
          .eq('user_type', 'investor');

        if (error) throw error;

        console.log('Fetched Investors Data:', data);
        setInvestors(data);
      } catch (error) {
        console.error('Error fetching investors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  return { investors, loading };
};

export default useInvestors;
