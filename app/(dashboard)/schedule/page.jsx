'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSelector } from 'react-redux';
import Card from '@/components/ui/Card';
import EventModal from '@/components/partials/app/calender/EventModal';
import EditEventModal from '@/components/partials/app/calender/EditEventModal';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading'; // Assuming you have a Loading component

const CalenderPage = () => {
  const { calendarEvents, categories } = useSelector((state) => state.calendar);
  const [activeModal, setActiveModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true); // Start loading
      const { data, error } = await supabase.from('events').select('*');

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        // Format events for FullCalendar
        const formattedEvents = data.map((event) => ({
          id: event.id,
          title: event.name,
          start: event.date,
          description: event.details,
        }));
        setEvents(formattedEvents);
      }
      setLoading(false); // Stop loading
    };

    fetchEvents();
  }, []);

  const handleDateClick = (arg) => {
    setActiveModal(true);
    setSelectedEvent(arg);
  };

  const handleEventClick = (arg) => {
    setEditModal(true);
    setEditItem(arg);
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
      </div>

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
