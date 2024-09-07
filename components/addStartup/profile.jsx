'use client';

import React, { useState, useEffect } from 'react';
import VerticalNavTabs from '@/components/addStartup/profileSideBar'; // Assuming profileSideBar contains the profile update form
import Loading from '@/app/loading';
import { supabase } from '@/lib/supabaseclient';

const Profile = ({ profileData }) => {
  const [loadingUserCompleteProfile, setLoadingUserCompleteProfile] = useState(true);
  const [profile, setProfile] = useState(null); // State to store the fetched profile
  const [error, setError] = useState(null); // State to handle errors
  
  // Function to fetch profile data
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('name', profileData.name)
        .eq('company_name', profileData.companyName)
        .eq('email', profileData.email);

        console.log("got profile: ", data);

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError('An error occurred while fetching the profile.');
    } finally {
      setLoadingUserCompleteProfile(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

  console.log(profileData);

  if (loadingUserCompleteProfile) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className='space-y-5 profile-page'>
      {/* Directly render the profile update section */}
      <VerticalNavTabs
        loading={loadingUserCompleteProfile}
        user={profileData} // Pass the profileData directly instead of using a user object
        investorSignup={profileData.investorSignup}
        profile={profile ? profile[0] : null} // Use fetched profile data if available
        companyProfile={profileData.companyProfile}
        businessDetails={profileData.businessDetails}
        founderInformation={profileData.founderInformation}
        fundingInformation={profileData.fundingInformation}
        ctoInfo={profileData.ctoInfo}
        companyDocuments={profileData.companyDocuments}
        fetchData={fetchData} // Fetch data to refresh the profile after updates
        companyId={profileData?.id}
      />
    </div>
  );
};

export default Profile;
