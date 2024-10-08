'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSelector } from 'react-redux';
import Card from '@/components/ui/Card';
import EventModal from '@/components/partials/app/calender/EventModalschedule';
import EditEventModal from '@/components/partials/app/calender/EditEventModal';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/app/loading';
import Chatbot from '@/components/chatbot';
import useUserDetails from '@/hooks/useUserDetails';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const CalenderPage = () => {
  const { calendarEvents, categories } = useSelector((state) => state.calendar);
  const [activeModal, setActiveModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the user details including the ID and company profile
  const { user } = useUserDetails();
  const { companyProfile } = useCompleteUserDetails();

  // console.log(companyProfile);

  useEffect(() => {
    if (!user) return; // Wait until user is loaded

    const fetchEvents = async () => {
      setLoading(true); // Start loading

      // Determine the ID to use based on user type
      const userId =
        user.user_type === 'startup' ? companyProfile?.id : user?.id;

      // Fetch events where userId matches the receiver_id or sender_id
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        // Format events for FullCalendar
        const formattedEvents = data.map((event) => ({
          id: event.id,
          title: event.name,
          start: event.date,
          description: `${event.details} \nZoom Link: ${
            event.zoom_link || 'No Zoom link available'
          }`,
          extendedProps: {
            zoomLink: event.zoom_link, // Store Zoom link in extended properties if needed
          },
        }));
        setEvents(formattedEvents);
      }
      setLoading(false); // Stop loading
    };

    fetchEvents();
  }, [user, companyProfile]); // Re-run when user or companyProfile changes

  // console.log(event.extendedProps.zoomLink)
  const handleDateClick = (arg) => {
    setActiveModal(true);
    setSelectedEvent(arg);
  };

  const handleEventClick = (arg) => {
    setActiveModal(true);
    setSelectedEvent(arg);
  };

  const handleClassName = (arg) => {
    // Define your logic for class names based on event properties
    if (arg.event.extendedProps.calendar === 'holiday') {
      return 'danger';
    } else if (arg.event.extendedProps.calendar === 'business') {
      return 'primary';
    } else if (arg.event.extendedProps.calendar === 'personal') {
      return 'success';
    } else if (arg.event.extendedProps.calendar === 'family') {
      return 'info';
    } else if (arg.event.extendedProps.calendar === 'etc') {
      return 'info';
    } else if (arg.event.extendedProps.calendar === 'meeting') {
      return 'warning';
    }
  };

  return (
    <div className='dashcode-calender'>
      <h4 className='font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4 mb-6'>
        Calendar
      </h4>
      <div className='grid grid-cols-12 gap-4'>
        <Card className='lg:col-span-12 col-span-12 bg-white'>
          {loading ? (
            <Loading /> // Display loading indicator
          ) : events.length === 0 ? (
            <div className='text-center py-4'>
              <p>No scheduled meetings.</p>
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
              }}
              events={events} // Use the fetched events here
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={2}
              weekends={true}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventClassNames={handleClassName}
              initialView='dayGridMonth'
            />
          )}
        </Card>
        <Chatbot />
      </div>

      {/* Modals for viewing and editing events */}
      <EventModal
        activeModal={activeModal}
        onClose={() => setActiveModal(false)}
        selectedEvent={selectedEvent}
      />
      <EditEventModal
        editModal={editModal}
        onCloseEditModal={() => setEditModal(false)}
        editItem={editItem}
      />
    </div>
  );
};

export default CalenderPage;
