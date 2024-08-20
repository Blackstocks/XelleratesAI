'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/app/loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserDetails from '@/hooks/useUserDetails';

const NotificationDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const { user } = useUserDetails();

  useEffect(() => {
    const fetchNotification = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching notification:', error);
        toast.error('Error fetching notification');
      } else {
        setNotification(data);

        // Update the notification status to "read" when the notification is loaded
        if (data.notification_read_status !== 'read') {
          await supabase
            .from('notifications')
            .update({ notification_read_status: 'read' })
            .eq('id', id);

          toast.success('Notification marked as read.');
        }
      }
      setLoading(false);
    };

    fetchNotification();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    setIsSubmitting(true);

    const updateData = { notification_status: status };
    let zoomMeetingLink = '';

    if (status === 'accepted' && selectedSlot) {
      try {
        const response = await fetch('/api/createZoomMeeting', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timeSlot: selectedSlot }),
        });

        const data = await response.json();

        if (response.ok) {
          zoomMeetingLink = data.meetingLink;
          updateData.accepted_time_slot = selectedSlot;
          updateData.zoom_meeting_link = zoomMeetingLink;
        } else {
          toast.error('Failed to create Zoom meeting');
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('Error creating Zoom meeting:', error);
        toast.error('Failed to create Zoom meeting');
        setIsSubmitting(false);
        return;
      }
    }

    const { error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating notification status:', error);
      toast.error('Failed to update notification status');
      setIsSubmitting(false);
      return;
    }

    if (status === 'accepted') {
      if (
        user?.user_type === 'startup' &&
        notification.available_time_slots?.length > 0
      ) {
        const { error: createError } = await supabase
          .from('notifications')
          .insert({
            sender_id: notification.receiver_id,
            receiver_id: notification.sender_id,
            notification_status: 'accepted',
            notification_type: 'startup_accepted',
            notification_read_status: 'unread',
            notification_message: `Startup has accepted the interest. Join with the link: ${zoomMeetingLink}`,
          });

        if (createError) {
          console.error('Error creating investor notification:', createError);
          toast.error('Failed to notify investor');
        } else {
          const newEventData = {
            name: `Meeting scheduled with startup ${notification.receiver_id}`,
            date: selectedSlot,
            details: notification.notification_message,
            user_id: notification.sender_id,
            zoom_link: zoomMeetingLink,
            sender_id: notification.receiver_id,
            receiver_id: notification.sender_id,
          };

          const { error: eventError } = await supabase
            .from('events')
            .insert([newEventData]);

          if (eventError) {
            console.error('Error adding event:', eventError);
            toast.error('Failed to add event');
          } else {
            toast.success('Event created and investor notified.');
            router.push('/schedule');
          }
        }
      } else {
        toast.success(
          'You have accepted the interest. You can now interact with the other party.'
        );
        router.push('/chat');
      }
    } else {
      toast.success(`Notification has been ${status}`);
      router.push('/notifications');
    }

    setIsSubmitting(false);
  };

  if (loading) return <Loading />;

  if (!notification) return <p>Notification not found</p>;

  return (
    <div className='container mx-auto p-4'>
      <ToastContainer />
      <h1 className='text-2xl font-bold mb-4'>Notification Details</h1>
      <p>
        <strong>Type:</strong> {notification.notification_type}
      </p>
      <p>
        <strong>Message:</strong> {notification.notification_message}
      </p>
      <p>
        <strong>Status:</strong> {notification.notification_status}
      </p>

      {notification.available_time_slots?.length > 0 && (
        <div>
          <strong>Available Time Slots:</strong>
          <ul className='mt-2'>
            {notification.available_time_slots.map((slot, index) => (
              <li key={index} className='mt-1'>
                <label className='inline-flex items-center'>
                  <input
                    type='radio'
                    name='time_slot'
                    value={slot}
                    checked={selectedSlot === slot}
                    onChange={() => setSelectedSlot(slot)}
                    className='form-radio'
                  />
                  <span className='ml-2'>
                    {new Date(slot).toLocaleString()}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {notification.notification_status === 'pending' && (
        <div className='mt-4'>
          <button
            onClick={() => handleUpdateStatus('accepted')}
            className='bg-green-500 text-white py-2 px-4 rounded mr-2'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Accept'}
          </button>
          <button
            onClick={() => handleUpdateStatus('rejected')}
            className='bg-red-500 text-white py-2 px-4 rounded'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}

      {notification.notification_status === 'accepted' && (
        <p className='mt-4 text-green-500'>
          You have accepted the interest. You can now interact with the other
          party.
        </p>
      )}
    </div>
  );
};

export default NotificationDetail;
