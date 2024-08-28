'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/app/loading';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useUserDetails from '@/hooks/useUserDetails';

const NotificationDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [notification, setNotification] = useState(null);
  const [senderDetails, setSenderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const { user } = useUserDetails();

  useEffect(() => {
    const fetchNotification = async () => {
      if (!id) return;

      // Fetch the notification from the notifications table
      const { data: notificationData, error: notificationError } =
        await supabase
          .from('notifications')
          .select('*, sender_id')
          .eq('id', id)
          .single();

      if (notificationError) {
        console.error('Error fetching notification:', notificationError);
        toast.error('Error fetching notification');
      } else {
        setNotification(notificationData);

        // Fetch the sender details using the sender_id from the profiles table
        const { data: senderData, error: senderError } = await supabase
          .from('profiles')
          .select('name, company_name')
          .eq('id', notificationData.sender_id)
          .single();

        if (senderError) {
          console.error('Error fetching sender details:', senderError);
          toast.error('Error fetching sender details');
        } else {
          setSenderDetails(senderData); // Assuming you have a state to store sender details
        }

        // Update the notification status to "read" when the notification is loaded
        if (notificationData.notification_read_status !== 'read') {
          await supabase
            .from('notifications')
            .update({ notification_read_status: 'read' })
            .eq('id', id);
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
        try {
          // Fetch startup details
          const { data: startupData, error: startupError } = await supabase
            .from('company_profile')
            .select(
              'profile_id,company_name,linkedin_profile,country,industry_sector'
            )
            .eq('id', notification.receiver_id)
            .single();

          if (startupError) {
            console.error('Error fetching startup details:', startupError);
            toast.error('Failed to fetch startup details');
            return;
          }
          const { data: startupProfileData, error: startupProfileError } =
            await supabase
              .from('profiles')
              .select('company_logo')
              .eq('id', startupData?.profile_id)
              .single();

          if (startupProfileError) {
            console.error(
              'Error fetching startup details:',
              startupProfileError
            );
            toast.error('Failed to fetch startup details');
            return;
          }
          const { data: startupFounderData, error: startupFounderError } =
            await supabase
              .from('founder_information')
              .select('founder_name')
              .eq('company_id', notification.receiver_id)
              .single();

          if (startupFounderError) {
            console.error(
              'Error fetching startup details:',
              startupFounderError
            );
            toast.error('Failed to fetch startup details');
            return;
          }
          const { data: InvestorData, error: InvestorError } = await supabase
            .from('profiles')
            .select('name,linkedin_profile, company_logo')
            .eq('id', notification.sender_id)
            .single();

          if (InvestorError) {
            console.error('Error fetching startup details:', InvestorError);
            toast.error('Failed to fetch startup details');
            return;
          }
          const { data: InvestorSignData, error: InvestorSignError } =
            await supabase
              .from('investor_signup')
              .select('sectors,company_name, investment_stage,typeof')
              .eq('profile_id', notification.sender_id)
              .single();

          if (InvestorSignError) {
            console.error('Error fetching startup details:', InvestorSignError);
            toast.error('Failed to fetch startup details');
            return;
          }

          const InvestorSignSectors = InvestorSignData?.sectors || 'Sectors';
          const InvestorType = InvestorSignData?.typeof || 'Type';
          const InvestorSignCompany =
            InvestorSignData?.company_name || 'Company';
          const InvestorSignStage =
            InvestorSignData?.investment_stage || 'Stage';
          const InvestorSignLogo = InvestorData?.company_logo || 'Company Logo';
          const Investorlinkedinprofile =
            InvestorData?.linkedin_profile || 'Linkedin Profile';
          const InvestorName = InvestorData?.name || 'Investor';

          const startupName = startupData?.company_name || 'Startup';
          const linkedinProfile =
            startupData?.linkedin_profile || 'Linkedin Profile';
          const startupLogo =
            startupProfileData?.company_logo || 'Company Logo';
          const startupFounder =
            startupFounderData?.founder_name || 'Founder Name';
          const startupCountry = startupData?.country || 'Country';
          const startupIndustry =
            startupData?.industry_sector || 'Industry Sector';

          // Create notification for investor with startup name
          const { error: createError } = await supabase
            .from('notifications')
            .insert({
              sender_id: notification.receiver_id,
              receiver_id: notification.sender_id,
              notification_status: 'accepted',
              notification_type: 'startup_accepted',
              notification_read_status: 'unread',
              notification_message: `${startupName} has accepted the interest. Join with the link: <a href="${zoomMeetingLink}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">Click Here</a>`,
            });

          if (createError) {
            console.error('Error creating investor notification:', createError);
            toast.error('Failed to notify investor');
          } else {
            // Create event with the startup name in the event name
            const newEventData = {
              name: `Meeting has been arranged between ${startupName} and ${InvestorName}`,
              date: selectedSlot,
              details: notification.notification_message,
              user_id: notification.sender_id,
              zoom_link: zoomMeetingLink,
              sender_id: notification.receiver_id,
              receiver_id: notification.sender_id,
              startup_name: startupName,
              startup_linkedin_profile: linkedinProfile,
              startup_logo: startupLogo,
              startup_founder: startupFounder,
              startup_country: startupCountry,
              startup_industry: startupIndustry,
              investor_name: InvestorName,
              investor_stage: InvestorSignStage,
              investor_company: InvestorSignCompany,
              investor_sectors: InvestorSignSectors,
              investor_logo: InvestorSignLogo,
              investor_linkedin_profile: Investorlinkedinprofile,
              investor_type: InvestorType,
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
        } catch (err) {
          console.error('Unexpected error:', err);
          toast.error('Something went wrong while scheduling the meeting');
        }
      } else {
        toast.success(
          'You have accepted the interest. You can now interact with the other party.'
        );
        router.push('/chat');
      }
    } else {
      // toast.success(`Notification has been ${status}`);
      router.push('/notifications');
    }

    setIsSubmitting(false);
  };

  if (loading) return <Loading />;

  if (!notification) return <p>Notification not found</p>;

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Notification Details</h1>
      {/* <p>
        <strong>Type:</strong> {notification.notification_type}
      </p> */}
      {notification.notification_type === 'express_interest' &&
        senderDetails && (
          <p>
            <strong>{senderDetails.name}</strong> ({senderDetails.company_name})
            wants to schedule a meet with you.
          </p>
        )}

      <p>
        <strong>Message: </strong>
        <span
          dangerouslySetInnerHTML={{ __html: notification.notification_message }} // Correct usage here
        />
      </p>

      {/* <p>
        <strong>Status:</strong> {notification.notification_status}
      </p> */}

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

      {/* {notification.notification_status === 'accepted' && (
        <p className='mt-4 text-green-500'>
          You have accepted the interest. You can now interact with the other
          party.
        </p>
      )} */}
    </div>
  );
};

export default NotificationDetail;
