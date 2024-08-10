import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Adjust the import path as necessary
import { supabase } from '@/lib/supabaseclient';

const useCompleteUserDetails = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [founderInformation, setFounderInformation] = useState(null);
  const [fundingInformation, setFundingInformation] = useState(null);
  const [ctoInfo, setCtoInfo] = useState(null);
  const [companyDocuments, setCompanyDocuments] = useState(null);
  const [investorSignup, setInvestorSignup] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch('/api/user-details', {
        headers: {
          'Content-Type': 'application/json',
          'supabase-token': session.access_token,
        },
      });
      const data = await response.json();

      setProfile(data.profile ?? null);
      setInvestorSignup(data?.investorSignupData ?? null);
      setCompanyProfile(data?.companyProfile ?? null);
      setBusinessDetails(data?.businessDetails?.[0] ?? null);
      setFounderInformation(data?.founderInformation?.[0] ?? null);
      setFundingInformation(data?.fundingInformation?.[0] ?? null);
      setCtoInfo(data?.ctoInfo?.[0] ?? null);
      setCompanyDocuments(data?.companyDocuments?.[0] ?? null);
    } catch (error) {
      console.error(
        'Error fetching user details, contact the administrator:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

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
    fetchData, // Expose the fetchData function
  };
};

export default useCompleteUserDetails;
