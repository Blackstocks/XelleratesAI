// pages/api/fetchNotifications.js
import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      return res
        .status(400)
        .json({ error: 'Missing required query parameters' });
    }

    let query;

    // Determine the query based on the user type
    if (userType === 'startup') {
      query = supabase
        .from('notifications')
        .select('*')
        .eq('receiver_id', userId);
    } else if (userType === 'investor') {
      query = supabase
        .from('notifications')
        .select('*')
        .eq('receiver_id', userId);
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const { data: notifications, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error fetching notifications' });
    }

    // Fetch company logos for each notification
    const notificationsWithLogos = await Promise.all(
      notifications.map(async (notification) => {
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

    res.status(200).json(notificationsWithLogos);
  } catch (error) {
    res.status(500).json({ error: 'Unexpected error fetching notifications' });
  }
}
