'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabaseclient'; // Import Supabase client
import useUserDetails from '@/hooks/useUserDetails';

const FormCompletionBanner = ({ profileId }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [userType, setUserType] = useState(null);
  const router = useRouter();
  const { user, loading } = useUserDetails(); // Ensure loading state is handled

  useEffect(() => {
    if (loading) return; // Wait for user data to load
    if (!user) return; // Ensure user is defined
    console.log(user); // Debugging

    const fetchCompletionData = async () => {
      // Fetch profile details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      console.log(profile.user_type); // Debugging
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      if (profile) {
        setUserType(profile.user_type);

        let fields = [];
        let data = null;

        if (profile.user_type === 'investor') {
          const { data: investorDetails, error: investorError } = await supabase
            .from('investor_signup')
            .select('*')
            .eq('profile_id', profileId)
            .single();

          if (investorError) {
            console.error('Error fetching investor details:', investorError);
            return;
          }

          data = investorDetails;
          fields = [
            'name',
            'email',
            'mobile',
            'typeof',
            'investment_thesis',
            'cheque_size',
            'sectors',
            'investment_stage',
          ];
        } else if (profile.user_type === 'startup') {
          const { data: startupDetails, error: startupError } = await supabase
            .from('startup_signup')
            .select('*')
            .eq('profile_id', profileId)
            .single();

          if (startupError) {
            console.error('Error fetching startup details:', startupError);
            return;
          }

          data = startupDetails;
          fields = [
            'name',
            'email',
            'mobile',
            'typeof',
            'business_model',
            'funding_stage',
            'sectors',
            'team_size',
          ];
        }

        if (data) {
          const filledFields = fields.filter((field) => data[field]);
          setCompletionPercentage(
            Math.round((filledFields.length / fields.length) * 100)
          );
        }
      }
    };

    fetchCompletionData();
  }, [profileId, user, loading]);

  // const handleButtonClick = ({ profileId }) => {
  //   console.log('Profile ID:', profileId); // Debugging
  //   console.log('User type:', userType); // Debugging
  //   if (userType === 'investor') {
  //     router.push(`investor-form?profile_id=${profileId}`);
  //   } else if (userType === 'startup') {
  //     router.push(`startup-form?profile_id=${profileId}`);
  //   }
  // };

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  if (!isBannerVisible) {
    return null;
  }

  return (
    <div className='completion-banner bg-blue-100 text-blue-800 py-4 px-6 flex items-center justify-between shadow-md rounded-md'>
      <div>
        <p className='font-medium text-lg'>
          {completionPercentage === 100
            ? 'Your profile is complete'
            : 'Few steps away from completing your profile'}
        </p>
        <p className='text-sm'>Form Completion: {completionPercentage}%</p>
      </div>
      {/* {completionPercentage < 100 && (
        <Button onClick={handleButtonClick} text='Complete Your Profile' />
      )} */}
      <button
        onClick={handleCloseBanner}
        className='ml-4 text-red-500 text-xl font-bold'
        aria-label='Close Banner'
      >
        &#x2716; {/* This is the Unicode for the cross mark */}
      </button>
    </div>
  );
};

export default FormCompletionBanner;
