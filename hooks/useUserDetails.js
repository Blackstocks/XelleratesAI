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

        if (profile.user_type === 'investor') {
          const { data: investor, error: investorError } = await supabase
            .from('investor_signup')
            .select('*')
            .eq('profile_id', profile.id)
            .single();
          if (investorError) throw investorError;

          setDetails({ ...investor, type: 'investor' });
        } else if (profile.user_type === 'startup') {
          await fetchStartupDetails(profile.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message);
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

      const companyId = startup?.id;
      if (!companyId) {
        throw new Error('No company profile found for this user.');
      }

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
        ctoInfo,
        companyDocuments,
      ] = await Promise.all([
        fetchDetails('business_details'),
        fetchDetails('founder_information'),
        fetchDetails('cofounder_information'),
        fetchDetails('funding_information'),
        fetchDetails('CTO_info'),
        fetchDetails('company_documents'),
      ]);

      setDetails({
        ...startup,
        businessDetails,
        founderInformation,
        cofounderInformation,
        fundingInformation,
        ctoInfo,
        companyDocuments,
        type: 'startup',
      });
    } catch (error) {
      console.error('Error fetching startup details:', error.message);
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
