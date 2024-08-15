import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useCompleteUserDetails = () => {
  const [profile, setProfile] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [founderInformation, setFounderInformation] = useState(null);
  const [fundingInformation, setFundingInformation] = useState(null);
  const [ctoInfo, setCtoInfo] = useState(null);
  const [companyDocuments, setCompanyDocuments] = useState(null);
  const [investorSignup, setInvestorSignup] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasFetchedData = useRef(false); // Track whether data has been fetched

  const fetchData = async () => {
    if (hasFetchedData.current) return; // Skip if already fetched
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

      // Set only necessary data to minimize re-renders
      setProfile(data.profile ?? null);
      setInvestorSignup(data?.investorSignupData ?? null);
      setCompanyProfile(data?.companyProfile ?? null);
      setBusinessDetails(data?.businessDetails?.[0] ?? null);
      setFounderInformation(data?.founderInformation?.[0] ?? null);
      setFundingInformation(data?.fundingInformation?.[0] ?? null);
      setCtoInfo(data?.ctoInfo?.[0] ?? null);
      setCompanyDocuments(data?.companyDocuments?.[0] ?? null);

      hasFetchedData.current = true; // Mark data as fetched
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
    if (!hasFetchedData.current) {
      fetchData();
    }
  }, []); // Empty dependency array ensures the effect runs only once on mount

  return {
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
