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

  useEffect(() => {
    if (authLoading) return;

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

        setProfile(data.profile);
        setCompanyProfile(data.companyProfile);
        setBusinessDetails(data.businessDetails[0]);
        setFounderInformation(data.founderInformation[0]);
        setFundingInformation(data.fundingInformation[0]);
        setCtoInfo(data.ctoInfo[0]);
        setCompanyDocuments(data.companyDocuments[0]);
        setInvestorSignup(data.investorSignup);
      } catch (error) {
        console.error('Error fetching user details:', error.message);
      } finally {
        setLoading(false);
      }
    };

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
  };
};

export default useCompleteUserDetails;
