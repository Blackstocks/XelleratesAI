'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseclient';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import useUserDetails from '@/hooks/useUserDetails';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { companyProfile, loading } = useCompleteUserDetails();
  const { user } = useUserDetails();

  // Memoized function to fetch additional notification details
  const fetchNotificationDetails = useCallback(async (notification) => {
    let logo = null;
    let companyName = null;
    let senderName = null;

    // Try fetching from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('company_logo, name')
      .eq('id', notification.sender_id)
      .single();

    if (!profileError && profileData) {
      logo = profileData.company_logo;
      senderName = profileData.name;
    } else {
      // If not found, try fetching from company_profile table
      const { data: companyProfileData, error: companyProfileError } =
        await supabase
          .from('company_profile')
          .select('profile_id, company_name')
          .eq('id', notification.sender_id)
          .single();

      if (!companyProfileError && companyProfileData) {
        companyName = companyProfileData.company_name;
        const {
          data: profileFromCompanyProfileData,
          error: profileFromCompanyProfileError,
        } = await supabase
          .from('profiles')
          .select('company_logo, name')
          .eq('id', companyProfileData.profile_id)
          .single();

        if (!profileFromCompanyProfileError && profileFromCompanyProfileData) {
          logo = profileFromCompanyProfileData.company_logo;
          senderName = profileFromCompanyProfileData.name;
        }
      }
    }

    return {
      ...notification,
      company_logo: logo,
      company_name: companyName,
      sender_name: senderName,
    };
  }, []);

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (loading || !user?.id) return;

    let query;
    if (user.user_type === 'startup' && companyProfile?.id) {
      query = supabase
        .from('notifications')
        .select('*')
        .eq('receiver_id', companyProfile.id);
    } else if (user.user_type === 'investor' && user?.id) {
      query = supabase
        .from('notifications')
        .select('*')
        .eq('receiver_id', user.id);
    } else {
      console.log('User type not recognized or missing ID:', user?.user_type);
      return;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    const notificationsWithDetails = await Promise.all(
      data.map(fetchNotificationDetails)
    );
    setNotifications(notificationsWithDetails);
  }, [fetchNotificationDetails, loading, user, companyProfile?.id]);

  // Fetch notifications on component mount and set up real-time updates
  useEffect(() => {
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
  }, [fetchNotifications]);

  return notifications;
};

export default useNotifications;
