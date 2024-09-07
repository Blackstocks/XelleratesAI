'use client';

import React, { useState, useEffect } from 'react';
import VerticalNavTabs from '@/components/addStartup/profileSideBar'; // Assuming profileSideBar contains the profile update form
import Loading from '@/app/loading';
import { supabase } from '@/lib/supabaseclient';

const Profile = ({ profileData }) => {
  const [loadingUserCompleteProfile, setLoadingUserCompleteProfile] = useState(true);
  const [profile, setProfile] = useState(null); // State to store the fetched profile
  const [error, setError] = useState(null); // State to handle errors
  
  const isValidUUID = (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };
  // Function to fetch profile data
  console.log(isValidUUID(profileData.id));

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileData.id)


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


  if (loadingUserCompleteProfile) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }
  console.log(profile);

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
