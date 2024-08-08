import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseclient';

const useMatchingStartups = () => {
  const { user, loading: authLoading } = useAuth();
  const [matchingStartups, setMatchingStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    const fetchMatchingStartups = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        // console.log('session', session);

        const response = await fetch('/api/matchStartups', {
          headers: {
            'Content-Type': 'application/json',
            supabaseToken: session?.access_token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch matching startups');
        }

        const data = await response.json();
        setMatchingStartups(data.startups);
        setCount(data.count);
      } catch (error) {
        console.error('Error fetching matching startups:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMatchingStartups();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  return { matchingStartups, loading, count };
};

export default useMatchingStartups;
