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
            .single();
        if (companyProfileError) throw companyProfileError;

        setCompanyProfile(companyProfileData);
        const companyId = companyProfileData?.id;

        const fetchDetails = async (table) => {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('company_id', companyId)
            .maybeSingle();
          if (error) throw error;
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

        setBusinessDetails(businessDetailsData);
        setFounderInformation(founderInformationData);
        setCofounderInformation(cofounderInformationData);
        setFundingInformation(fundingInformationData);
        setCtoInfo(ctoInfoData);
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

  const updateDetailsLocally = (section, updatedData) => {
    if (section === 'companyProfile') {
      setCompanyProfile((prev) => ({ ...prev, ...updatedData }));
      console.log('companyProfile', companyProfile);
    } else if (section === 'businessDetails') {
      setBusinessDetails((prev) => ({ ...prev, ...updatedData }));
    } else if (section === 'founderInformation') {
      setFounderInformation((prev) => ({ ...prev, ...updatedData }));
    } else if (section === 'cofounderInformation') {
      setCofounderInformation((prev) => ({ ...prev, ...updatedData }));
    } else if (section === 'fundingInformation') {
      setFundingInformation((prev) => ({ ...prev, ...updatedData }));
    } else if (section === 'ctoInfo') {
      setCtoInfo((prev) => ({ ...prev, ...updatedData }));
    } else if (section === 'companyDocuments') {
      setCompanyDocuments((prev) => ({ ...prev, ...updatedData }));
    } else {
      setProfile((prev) => ({ ...prev, ...updatedData }));
    }
  };

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
    updateDetailsLocally,
  };
};

export default useCompleteUserDetails;
