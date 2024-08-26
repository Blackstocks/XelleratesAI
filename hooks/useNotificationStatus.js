import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient'; // Make sure to adjust the import path accordingly

const useNotificationStatus = (senderId, receiverId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connect'); // Possible values: 'connect', 'connection_sent', 'connected'

  useEffect(() => {
    const fetchNotificationStatus = async () => {
      if (!senderId || !receiverId) return;

      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('notification_status')
          .eq('sender_id', senderId)
          .eq('receiver_id', receiverId)
          .eq('notification_type', 'express_interest');

        if (error) {
          console.error('Error fetching notification status:', error);
          return;
        }

        if (data && data.length > 0) {
          const status = data[0].notification_status;
          if (status === 'pending') {
            setConnectionStatus('connection_sent');
          } else if (status === 'accepted') {
            setConnectionStatus('connected');
          } else {
            setConnectionStatus('connect');
          }
        } else {
          setConnectionStatus('connect'); // No prior connection attempt
        }
      } catch (error) {
        console.error('Unexpected error fetching notification status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationStatus();
  }, [senderId, receiverId]);

  return { isLoading, connectionStatus };
};

export default useNotificationStatus;
