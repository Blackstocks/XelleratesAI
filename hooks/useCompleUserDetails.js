import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useCompleteUserDetails = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [founderInformation, setFounderInformation] = useState(null);
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
          setUser(user);

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single();
          if (profileError) throw profileError;
          setProfile(profileData);

          if (profileData.user_type === 'startup') {
            await fetchStartupDetails(profileData.id);
          } else if (profileData.user_type === 'investor') {
            await fetchInvestorDetails(profileData.id);
          }

          // Set up real-time subscriptions
          subscribeToChanges(user.id, profileData.user_type);
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

        const [
          businessDetailsData,
          founderInformationData,
          fundingInformationData,
          ctoInfoData,
          companyDocumentsData,
        ] = await Promise.all([
          fetchDetails('business_details', companyId),
          fetchDetails('founder_information', companyId),
          fetchDetails('funding_information', companyId),
          fetchDetails('CTO_info', companyId),
          fetchDetails('company_documents', companyId),
        ]);

        setBusinessDetails(businessDetailsData[0]);
        setFounderInformation(founderInformationData[0]);
        setFundingInformation(fundingInformationData[0]);
        setCtoInfo(ctoInfoData[0]);
        setCompanyDocuments(companyDocumentsData[0]);
      } catch (error) {
        console.error('Error fetching startup details:', error.message);
      }
    };

    const fetchDetails = async (table, companyId) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('company_id', companyId);
      if (error) throw error;
      return data;
    };

    const fetchInvestorDetails = async (profileId) => {
      try {
        const { data: investorSignupData, error: investorSignupError } =
          await supabase
            .from('investor_signup')
            .select('*')
            .eq('profile_id', profileId)
            .maybeSingle();
        if (investorSignupError) throw investorSignupError;
        setInvestorSignup(investorSignupData);
      } catch (error) {
        console.error('Error fetching investor details:', error.message);
      }
    };

    const subscribeToChanges = (userId, userType) => {
      const subscription = supabase
        .channel('realtime-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          console.log('Realtime change:', payload);
          switch (payload.table) {
            case 'founder_information':
              setFounderInformation(payload.new);
              break;
            case 'company_profile':
              setCompanyProfile(payload.new);

              break;
            case 'business_details':
              setBusinessDetails(payload.new);
              break;
            case 'funding_information':
              setFundingInformation(payload.new);
              break;
            case 'CTO_info':
              setCtoInfo(payload.new);
              break;
            case 'company_documents':
              setCompanyDocuments(payload.new);
              break;
            // Handle other tables similarly if needed
            default:
              break;
          }
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchUserDetails();
  }, []);

  return {
    user,
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    loading,
  };
};

export default useCompleteUserDetails;
