'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import {
  CheckIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/solid';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUserDetails();

  useEffect(() => {
    if (!id) return;
    fetchNotification();
  }, [id]);

  const fetchNotification = async () => {
    try {
      const { data: notificationData, error: notificationError } =
        await supabase
          .from('notifications')
          .select('*, sender_id')
          .eq('id', id)
          .single();

      if (notificationError) throw notificationError;

      setNotification(notificationData);

      if (user?.user_type === 'startup') {
        fetchSenderDetails(notificationData.sender_id);
      }

      if (notificationData.notification_read_status !== 'read') {
        await supabase
          .from('notifications')
          .update({ notification_read_status: 'read' })
          .eq('id', id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching notification:', error);
      toast.error('Error fetching notification');
      setLoading(false);
    }
  };

  const fetchSenderDetails = async (senderId) => {
    try {
      const { data: senderData, error: senderError } = await supabase
        .from('profiles')
        .select('name, company_name')
        .eq('id', senderId)
        .single();

      if (senderError) throw senderError;

      setSenderDetails(senderData);
    } catch (error) {
      console.error('Error fetching sender details:', error);
      toast.error('Error fetching sender details');
    }
  };

  const handleUpdateStatus = async (status) => {
    setIsSubmitting(true);
    try {
      let zoomMeetingLink = '';
      const updateData = { notification_status: status };

      if (status === 'accepted' && selectedSlot) {
        zoomMeetingLink = await createZoomMeeting(selectedSlot);
        if (!zoomMeetingLink) return;

        updateData.accepted_time_slot = selectedSlot;
        updateData.zoom_meeting_link = zoomMeetingLink;
      }

      await updateNotificationStatus(updateData);

      if (status === 'accepted') {
        await handleAcceptedStatus(zoomMeetingLink);
      } else {
        router.push('/notifications');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update notification status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createZoomMeeting = async (timeSlot) => {
    try {
      const response = await fetch('/api/createZoomMeeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlot }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Failed to create Zoom meeting');

      return data.meetingLink;
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      toast.error('Failed to create Zoom meeting');
      setIsSubmitting(false);
      return null;
    }
  };

  const updateNotificationStatus = async (updateData) => {
    const { error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error('Failed to update notification status');
  };

  const handleAcceptedStatus = async (zoomMeetingLink) => {
    if (
      user?.user_type === 'startup' &&
      notification.available_time_slots?.length > 0
    ) {
      try {
        const startupDetails = await fetchStartupDetails(
          notification.receiver_id
        );
        const investorDetails = await fetchInvestorDetails(
          notification.sender_id
        );

        await createInvestorNotification(zoomMeetingLink, startupDetails.name);

        await createEvent(zoomMeetingLink, startupDetails, investorDetails);

        toast.success('Event created and investor notified.');
        router.push('/schedule');
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
  };

  const fetchStartupDetails = async (receiverId) => {
    try {
      const { data: startupData, error: startupError } = await supabase
        .from('company_profile')
        .select(
          'profile_id, company_name, linkedin_profile, country, industry_sector'
        )
        .eq('id', receiverId)
        .single();

      if (startupError) throw startupError;

      const { data: startupProfileData, error: startupProfileError } =
        await supabase
          .from('profiles')
          .select('company_logo')
          .eq('id', startupData?.profile_id)
          .single();

      if (startupProfileError) throw startupProfileError;

      const { data: startupFounderData, error: startupFounderError } =
        await supabase
          .from('founder_information')
          .select('founder_name')
          .eq('company_id', receiverId)
          .single();

      if (startupFounderError) throw startupFounderError;

      return {
        name: startupData.company_name,
        linkedinProfile: startupData.linkedin_profile,
        logo: startupProfileData.company_logo,
        founder: startupFounderData.founder_name,
        country: startupData.country,
        industry: startupData.industry_sector,
      };
    } catch (error) {
      console.error('Error fetching startup details:', error);
      toast.error('Failed to fetch startup details');
    }
  };

  const fetchInvestorDetails = async (senderId) => {
    try {
      const { data: investorData, error: investorError } = await supabase
        .from('profiles')
        .select('name, linkedin_profile, company_logo')
        .eq('id', senderId)
        .single();

      if (investorError) throw investorError;

      const { data: investorSignData, error: investorSignError } =
        await supabase
          .from('investor_signup')
          .select('sectors, company_name, investment_stage, typeof')
          .eq('profile_id', senderId)
          .single();

      if (investorSignError) throw investorSignError;

      return {
        name: investorData.name,
        linkedinProfile: investorData.linkedin_profile,
        logo: investorData.company_logo,
        sectors: investorSignData.sectors,
        company: investorSignData.company_name,
        stage: investorSignData.investment_stage,
        type: investorSignData.typeof,
      };
    } catch (error) {
      console.error('Error fetching investor details:', error);
      toast.error('Failed to fetch investor details');
    }
  };

  const createInvestorNotification = async (zoomMeetingLink, startupName) => {
    const { error } = await supabase.from('notifications').insert({
      sender_id: notification.receiver_id,
      receiver_id: notification.sender_id,
      notification_status: 'accepted',
      notification_type: 'startup_accepted',
      notification_read_status: 'unread',
      notification_message: `${startupName} has accepted the interest. Join with the link: <a href="${zoomMeetingLink}" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">Click Here</a>`,
    });

    if (error) throw new Error('Failed to notify investor');
  };

  const createEvent = async (
    zoomMeetingLink,
    startupDetails,
    investorDetails
  ) => {
    const newEventData = {
      name: `Meeting has been arranged between ${startupDetails.name} and ${investorDetails.name}`,
      date: selectedSlot,
      details: notification.notification_message,
      user_id: notification.sender_id,
      zoom_link: zoomMeetingLink,
      sender_id: notification.receiver_id,
      receiver_id: notification.sender_id,
      startup_name: startupDetails.name,
      startup_linkedin_profile: startupDetails.linkedinProfile,
      startup_logo: startupDetails.logo,
      startup_founder: startupDetails.founder,
      startup_country: startupDetails.country,
      startup_industry: startupDetails.industry,
      investor_name: investorDetails.name,
      investor_stage: investorDetails.stage,
      investor_company: investorDetails.company,
      investor_sectors: investorDetails.sectors,
      investor_logo: investorDetails.logo,
      investor_linkedin_profile: investorDetails.linkedinProfile,
      investor_type: investorDetails.type,
    };

    const { error } = await supabase.from('events').insert([newEventData]);

    if (error) throw new Error('Failed to add event');
  };

  if (loading) return <Loading />;
  if (!notification) return <p>Notification not found</p>;

  return (
    <div className='container mx-auto p-6 bg-white rounded-xl shadow-md'>
      <h1 className='text-4xl font-bold mb-6 text-gray-800'>
        Notification Details
      </h1>

      <div className='mb-4 p-4 bg-gray-100 rounded-lg shadow-inner'>
        {notification.notification_type === 'express_interest' &&
          senderDetails && (
            <p className='text-lg text-gray-700'>
              <strong>{senderDetails.name}</strong> (
              {senderDetails.company_name}) wants to schedule a meeting with
              you.
            </p>
          )}
        <p className='text-lg text-gray-700 mt-4'>
          <strong>Message:</strong>{' '}
          <span
            dangerouslySetInnerHTML={{
              __html: notification.notification_message,
            }}
          />
        </p>
      </div>

      {notification.available_time_slots?.length > 0 && (
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-2 text-gray-800 flex items-center'>
            <CalendarDaysIcon className='h-6 w-6 text-blue-500 mr-2' />
            Available Time Slots
          </h2>
          <RadioGroup
            value={selectedSlot}
            onChange={setSelectedSlot}
            className='mt-2'
          >
            <RadioGroup.Label className='sr-only'>
              Choose a time slot
            </RadioGroup.Label>
            <div className='space-y-2'>
              {notification.available_time_slots.map((slot) => (
                <RadioGroup.Option
                  key={slot}
                  value={slot}
                  className={({ active, checked }) =>
                    `${
                      checked
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900'
                    }
                      relative rounded-lg shadow-md px-5 py-4 cursor-pointer flex focus:outline-none
                      ${
                        active
                          ? 'ring-2 ring-offset-2 ring-offset-blue-300 ring-white ring-opacity-60'
                          : ''
                      }`
                  }
                >
                  {({ checked }) => (
                    <>
                      <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center'>
                          <div className='text-sm'>
                            <RadioGroup.Label
                              as='p'
                              className={`font-medium  ${
                                checked ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {new Date(slot).toLocaleString()}
                            </RadioGroup.Label>
                          </div>
                        </div>
                        {checked && (
                          <div className='flex-shrink-0 text-white'>
                            <CheckIcon className='w-6 h-6' />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {notification.notification_status === 'pending' && (
        <div className='mt-6 flex gap-4'>
          <button
            onClick={() => setIsModalOpen(true)}
            className='bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md flex items-center justify-center gap-2 transition ease-in-out duration-150'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Processing...'
            ) : (
              <>
                <CheckIcon className='h-5 w-5' />
                Accept
              </>
            )}
          </button>
          <button
            onClick={() => handleUpdateStatus('rejected')}
            className='bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md flex items-center justify-center gap-2 transition ease-in-out duration-150'
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Processing...'
            ) : (
              <>
                <XMarkIcon className='h-5 w-5' />
                Reject
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal for Confirmation */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='max-w-md w-full bg-white p-6 rounded-2xl shadow-xl'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Confirm Acceptance
                  </Dialog.Title>
                  <div className='mt-2'>
                    <p className='text-sm text-gray-500'>
                      Are you sure you want to accept this meeting request? A
                      Zoom link will be generated, and the notification will be
                      updated.
                    </p>
                  </div>
                  <div className='mt-4 flex justify-end space-x-2'>
                    <button
                      type='button'
                      className='inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                      onClick={() => {
                        handleUpdateStatus('accepted');
                        setIsModalOpen(false);
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      type='button'
                      className='inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default NotificationDetail;
