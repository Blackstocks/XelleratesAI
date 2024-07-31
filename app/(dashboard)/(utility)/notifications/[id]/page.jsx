'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

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
      }
      setLoading(false);
    };

    fetchNotification();
  }, [id]);

  // Inside your function or block scope

  const handleUpdateStatus = async (status) => {
    if (status === 'accepted' && !selectedSlot) {
      toast.error('Please select a time slot.');
      return;
    }

    setIsSubmitting(true);

    // Update the current notification status
    const { error } = await supabase
      .from('notifications')
      .update({ notification_status: status, accepted_time_slot: selectedSlot })
      .eq('id', id);

    if (error) {
      console.error('Error updating notification status:', error);
      toast.error('Failed to update notification status');
      setIsSubmitting(false);
      return;
    }

    if (status === 'accepted') {
      // Create a new notification for the investor
      const { error: createError } = await supabase
        .from('notifications')
        .insert({
          sender_id: notification.receiver_id, // Startup's ID
          receiver_id: notification.sender_id, // Investor's ID
          notification_status: 'accepted',
          notification_type: 'startup_accepted',
          notification_read_status: 'unread',
          notification_message: `The startup has accepted your request for the time slot: ${selectedSlot}`,
        });

      if (createError) {
        console.error('Error creating investor notification:', createError);
        toast.error('Failed to notify investor');
      } else {
        // Define event data and insert into the database
        const newEventData = {
          name: `Meeting scheduled with startup ${notification.receiver_id}`,
          date: selectedSlot,
          details: `Meeting between startup and investor at ${new Date(
            selectedSlot
          ).toLocaleString()}`,
          user_id: notification.sender_id, // Assuming the event is for the investor
        };

        const { data: eventInsertData, error: eventError } = await supabase
          .from('events') // Replace 'events' with the correct table name
          .insert([newEventData]);

        if (eventError) {
          console.error('Error adding event:', eventError);
          toast.error('Failed to add event');
        } else {
          toast.success('Event created and investor notified.');
          router.push('/notifications');
        }
      }
    } else {
      toast.success(`Notification has been ${status}`);
      router.push('/notifications'); // Redirect after rejecting
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

      {notification.available_time_slots && (
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
          You have accepted the interest. You can now interact with the
          investor.
        </p>
      )}
    </div>
  );
};

export default NotificationDetail;
