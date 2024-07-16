import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useCompleteUserDetails = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [founderInformation, setFounderInformation] = useState(null);
  const [cofounderInformation, setCofounderInformation] = useState(null);
  const [fundingInformation, setFundingInformation] = useState(null);
  const [ctoInfo, setCtoInfo] = useState(null);
  const [companyDocuments, setCompanyDocuments] = useState(null);
  const [investorSignup, setInvestorSignup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profileError) throw profileError;

          setProfile(profileData);
          setUser(user);

          if (profileData.user_type === 'startup') {
            await fetchStartupDetails(profileData.id);
          } else if (profileData.user_type === 'investor') {
            await fetchInvestorDetails(profileData.id);
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
        const { data: companyProfileData, error: companyProfileError } =
          await supabase
            .from('company_profile')
            .select('*')
            .eq('profile_id', profileId)
        if (companyProfileError) throw companyProfileError;
        if (!companyProfileData || companyProfileData.length !== 1) {
          throw new Error(
            `Expected one row for company_profile, but found ${companyProfileData.length}`
          );
        }

        setCompanyProfile(companyProfileData[0]);
        const companyId = companyProfileData[0]?.id;

        const fetchDetails = async (table) => {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('company_id', companyId)
          if (error) throw error;
          console.log(data)
          return data;
        };

        const [
          businessDetailsData,
          founderInformationData,
          cofounderInformationData,
          fundingInformationData,
          ctoInfoData,
          companyDocumentsData,
        ] = await Promise.all([
          fetchDetails('business_details'),
          fetchDetails('founder_information'),
          fetchDetails('cofounder_information'),
          fetchDetails('funding_information'),
          fetchDetails('CTO_info'),
          fetchDetails('company_documents'),
        ]);

        setBusinessDetails(businessDetailsData[0]);
        setFounderInformation(founderInformationData[0]);
        setCofounderInformation(cofounderInformationData[0]);
        setFundingInformation(fundingInformationData[0]);
        setCtoInfo(ctoInfoData[0]);
        setCompanyDocuments(companyDocumentsData);
      } catch (error) {
        console.error('Error fetching startup details:', error.message);
      }
    };

    const fetchInvestorDetails = async (profileId) => {
      try {
        const { data: investorSignupData, error: investorSignupError } =
          await supabase
            .from('investor_signup')
            .select('*')
            .eq('profile_id', profileId)
            .single();
        if (investorSignupError) throw investorSignupError;
        setInvestorSignup(investorSignupData);
      } catch (error) {
        console.error('Error fetching investor details:', error.message);
      }
    };

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
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    cofounderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    loading,
    updateUserLocally,
  };
};

export default useCompleteUserDetails;
