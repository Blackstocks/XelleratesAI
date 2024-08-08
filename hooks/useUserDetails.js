import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useUserDetails = () => {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;

      const currentUser = data.user;
      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        if (profileError) throw profileError;

        setUser(profile);
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const updateUserLocally = (updatedUser) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  return {
    user,
    loading,
    updateUserLocally,
    fetchUserDetails,
  };
};

export default useUserDetails;
