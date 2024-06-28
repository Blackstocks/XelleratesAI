'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';

const FormCompletionBanner = ({ profileId }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [userType, setUserType] = useState(null);
  const router = useRouter();
  const { user, loading } = useUserDetails();

  useEffect(() => {
    if (loading || !user) return;

    const fetchCompletionData = async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

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

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  if (!isBannerVisible) {
    return null;
  }

  return (
    <div className='completion-banner bg-grey-100 text-black  py-4 px-6 flex items-center justify-between shadow-md rounded-md'>
      <div>
        <p className='font-medium text-lg'>
          {completionPercentage === 100
            ? 'Your profile is complete'
            : 'Few steps away from completing your profile'}
        </p>
        <p className='text-sm'>Form Completion: {completionPercentage}%</p>
      </div>
      <button
        onClick={handleCloseBanner}
        className='ml-4 text-black red-500 text-xl font-bold'
        aria-label='Close Banner'
      >
        &#x2716;
      </button>
    </div>
  );
};

export default FormCompletionBanner;
