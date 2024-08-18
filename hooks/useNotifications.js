'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import useUserDetails from '@/hooks/useUserDetails';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { companyProfile, investorSignup, loading } = useCompleteUserDetails();
  const { user } = useUserDetails();

  useEffect(() => {
    if (loading) {
      console.log('Loading user details...');
      return;
    }

    if (!user?.id) {
      console.log('User ID not available');
      return;
    }

    const fetchNotifications = async () => {
      try {
        let query;
        if (user?.user_type === 'startup') {
          if (companyProfile?.id) {
            query = supabase
              .from('notifications')
              .select('*')
              .eq('receiver_id', companyProfile?.id);
          } else {
            console.log('Company profile ID not available');
          }
        } else if (user?.user_type === 'investor') {
          if (user?.id) {
            query = supabase
              .from('notifications')
              .select('*')
              .eq('receiver_id', user?.id);
          } else {
            console.log('Investor signup ID not available');
          }
        } else {
          console.log('User type not recognized:', user?.user_type);
        }

        if (!query) {
          console.log('No valid query created');
          return;
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        const notificationsWithLogos = await Promise.all(
          data.map(async (notification) => {
            let logo = null;

            // First, try to get the logo directly from the profiles table
            let { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('company_logo')
              .eq('id', notification.sender_id)
              .single();

            if (!profileError && profileData?.company_logo) {
              logo = profileData.company_logo;
            } else {
              // If not found in profiles, check the company_profile table
              let { data: companyProfileData, error: companyProfileError } =
                await supabase
                  .from('company_profile')
                  .select('profile_id')
                  .eq('id', notification.sender_id)
                  .single();

              if (!companyProfileError && companyProfileData?.profile_id) {
                // Use the profile_id to get the logo from profiles
                let {
                  data: profileFromCompanyProfileData,
                  error: profileFromCompanyProfileError,
                } = await supabase
                  .from('profiles')
                  .select('company_logo')
                  .eq('id', companyProfileData.profile_id)
                  .single();

                if (
                  !profileFromCompanyProfileError &&
                  profileFromCompanyProfileData?.company_logo
                ) {
                  logo = profileFromCompanyProfileData.company_logo;
                }
              }
            }

            return {
              ...notification,
              company_logo: logo,
            };
          })
        );

        setNotifications(notificationsWithLogos);
      } catch (error) {
        console.error('Unexpected error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const notificationSubscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (_payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationSubscription);
    };
  }, [loading, companyProfile?.id, investorSignup?.id]);

  return notifications;
};

export default useNotifications;
