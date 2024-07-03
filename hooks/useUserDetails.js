import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useUserDetails = () => {
  const [user, setUser] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;

        setUser(profile);

        if (profile.user_type === 'investor') {
          const { data: investor, error: investorError } = await supabase
            .from('investor_signup')
            .select('*')
            .eq('profile_id', user.id)
            .single();
          if (investorError) throw investorError;

          setDetails({ ...investor, type: 'investor' });
        } else if (profile.user_type === 'startup') {
          await fetchStartupDetails(user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStartupDetails = async (profileId) => {
    try {
      const { data: startup, error: startupError } = await supabase
        .from('company_profile')
        .select('*')
        .eq('profile_id', profileId)
        .single();
      if (startupError) throw startupError;

      const companyId = startup.id;

      const fetchDetails = async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('company_id', companyId)
          .single();
        if (error) throw error;
        return data;
      };

      const [
        businessDetails,
        founderInformation,
        cofounderInformation,
        fundingInformation,
      ] = await Promise.all([
        fetchDetails('business_details'),
        fetchDetails('founder_information'),
        fetchDetails('cofounder_information'),
        fetchDetails('funding_information'),
      ]);

      setDetails({
        ...startup,
        businessDetails,
        founderInformation,
        cofounderInformation,
        fundingInformation,
        type: 'startup',
      });
    } catch (error) {
      console.error('Error fetching startup details:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const updateDetailsLocally = (updatedData) => {
    setDetails((prevDetails) => ({
      ...prevDetails,
      ...updatedData,
    }));
  };

  const updateUserLocally = (updatedUser) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  return {
    user,
    details,
    loading,
    updateUserLocally,
    fetchUserDetails,
    updateDetailsLocally,
  };
};

export default useUserDetails;
