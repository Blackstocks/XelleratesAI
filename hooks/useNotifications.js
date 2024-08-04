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
            // console.log(
            //   'Fetching notifications for startup:',
            //   companyProfile?.id
            // );
            query = supabase
              .from('notifications')
              .select('*')
              .eq('receiver_id', companyProfile?.id);
          } else {
            console.log('Company profile ID not available');
          }
        } else if (user?.user_type === 'investor') {
          if (user?.id) {
            // console.log('Fetching notifications for investor:', user?.id);
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

        // console.log('Fetched notifications:', data);
        setNotifications(data);
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
          // console.log('Notification change detected, refetching notifications');
          fetchNotifications();
        }
      )
      .subscribe();

    // console.log('Subscribed to notifications channel');

    return () => {
      //   console.log('Unsubscribing from notifications channel');
      supabase.removeChannel(notificationSubscription);
    };
  }, [loading, companyProfile?.id, investorSignup?.id]);

  return notifications;
};

export default useNotifications;
// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseclient';
// import useUserDetails from '@/hooks/useUserDetails';

// const useNotifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const { user } = useUserDetails();

//   useEffect(() => {
//     if (!user?.id) {
//       console.log('User ID not available');
//       return;
//     }

//     const fetchNotifications = async () => {
//       try {
//         const { data, error } = await supabase
//           .from('notifications')
//           .select('*')
//           .eq('receiver_id', user.id);

//         if (error) {
//           console.error('Error fetching notifications:', error);
//           return;
//         }

//         setNotifications(data);
//       } catch (error) {
//         console.error('Unexpected error fetching notifications:', error);
//       }
//     };

//     fetchNotifications();

//     const notificationSubscription = supabase
//       .channel('public:notifications')
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'notifications' },
//         (_payload) => {
//           console.log('Notification change detected, refetching notifications');
//           fetchNotifications();
//         }
//       )
//       .subscribe();

//     console.log('Subscribed to notifications channel');

//     return () => {
//       supabase.removeChannel(notificationSubscription);
//     };
//   }, [user?.id]);

//   return notifications;
// };

// export default useNotifications;
