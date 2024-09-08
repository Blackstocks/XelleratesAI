"use client";

import React, { useState, useEffect } from "react";
import VerticalNavTabs from "@/components/addStartup/profileSideBar"; // Assuming profileSideBar contains the profile update form
import Loading from "@/app/loading";
import { supabase } from "@/lib/supabaseclient";

const Profile = ({ profileData }) => {
  const [loadingUserCompleteProfile, setLoadingUserCompleteProfile] =
    useState(true);
  const [profile, setProfile] = useState(null); // State to store the fetched profile
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null); 
  const [businessDetail, setBusinessDetail] = useState(null);
  const [ctoInfo, setCtoInfo] = useState(null);
  const [founderInfo, setFounderInfo] = useState(null);
  const [companyDocument, setCompanyDocument] = useState(null);
  const [fundingInfo, setFundingInfo] = useState(null);
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileData.id);

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }

      const { data: companyData, error: companyDataError } = await supabase
        .from("company_profile")
        .select("*")
        .eq("profile_id", data[0]?.id);
      
      if (companyDataError) {
        setError(companyDataError.message);
      } else {
        setCompanyData(companyData[0]);
      }


    const { data:businessData, error: businessDataError } = await supabase
      .from("business_details")
      .select("*")
      .eq("company_id", companyData[0]?.id);
    
    if (businessDataError) {
      setError(businessDataError.message);
    } else {
      setBusinessDetail(businessData[0]);
    }

    const { data:ctoData, error: ctoDataError } = await supabase
      .from("CTO_info")
      .select("*")
      .eq("company_id", companyData[0]?.id);
    
    if (ctoDataError) {
      setError(ctoDataError.message);
    } else {
      setCtoInfo(ctoData[0]);
    }
    console.log(ctoData);

    const { data:founderData, error: founderDataError } = await supabase
      .from("founder_information")
      .select("*")
      .eq("company_id", companyData[0]?.id);
    
    if (founderDataError) {
      setError(founderDataError.message);
    } else {
      setFounderInfo(founderData[0]);
    }

    const { data:companyDocumentData, error: companyDocumentDataError } = await supabase
      .from("company_documents")
      .select("*")
      .eq("company_id", companyData[0]?.id);
    
    if (companyDocumentDataError) {
      setError(companyDocumentDataError.message);
    } else {
      setCompanyDocument(companyDocumentData[0]);
    }

    const { data:fundingData, error: fundingDataError } = await supabase
      .from("funding_information")
      .select("*")
      .eq("company_id", companyData[0]?.id);
    
    if (fundingDataError) {
      setError(fundingDataError.message);
    } else {
      setFundingInfo(fundingData[0]);
    }

    } catch (err) {
      setError("An error occurred while fetching the profile.");
    } finally {
      setLoadingUserCompleteProfile(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

  if (loadingUserCompleteProfile) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  console.log(founderInfo);
  return (
    <div className="space-y-5 profile-page">
      {/* Directly render the profile update section */}
      <VerticalNavTabs
        loading={loadingUserCompleteProfile}
        user={profileData} // Pass the profileData directly instead of using a user object
        investorSignup={profileData.investorSignup}
        profile={profile ? profile[0] : null} // Use fetched profile data if available
        companyProfile={companyData}
        businessDetails={businessDetail}
        founderInformation={founderInfo}
        fundingInformation={fundingInfo}
        ctoInfo={ctoInfo}
        companyDocuments={companyDocument}
        fetchData={fetchData} // Fetch data to refresh the profile after updates
        companyId={companyData?.id}
      />
    </div>
  );
};

export default Profile;
