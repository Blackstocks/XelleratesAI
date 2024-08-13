import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useSelector } from 'react-redux';
import Icon from '@/components/ui/Icon';
const EventModal = ({ activeModal, onClose, selectedEvent }) => {
  const { categories } = useSelector((state) => state.calendar);

  return (
    <div>
      <Modal
        title='Event Details'
        labelclassName='btn-outline-dark'
        activeModal={activeModal}
        onClose={onClose}
      >
        {selectedEvent ? (
          <ul className='space-y-4'>
            <li className='flex space-x-3 rtl:space-x-reverse'>
              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                <Icon icon='heroicons:user' />
              </div>
              <div className='flex-1'>
                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                  Event Name
                </div>
                <div className='text-base text-slate-600 dark:text-slate-50'>
                  {selectedEvent?.event?.title || 'Not provided'}
                </div>
              </div>
            </li>
            <li className='flex space-x-3 rtl:space-x-reverse'>
              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                <Icon icon='heroicons:calendar' />
              </div>
              <div className='flex-1'>
                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                  Start Date
                </div>
                <div className='text-base text-slate-600 dark:text-slate-50'>
                  {new Date(selectedEvent?.event?.start).toLocaleDateString() ||
                    'Not provided'}
                </div>
              </div>
            </li>

            <li className='flex space-x-3 rtl:space-x-reverse'>
              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                <Icon icon='heroicons:clock' />
              </div>
              <div className='flex-1'>
                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                  Start Time
                </div>
                <div className='text-base text-slate-600 dark:text-slate-50'>
                  {new Date(selectedEvent?.event?.start).toLocaleTimeString() ||
                    'Not provided'}
                </div>
              </div>
            </li>

            {/* <li className='flex space-x-3 rtl:space-x-reverse'>
              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                <Icon icon='heroicons:clock' />
              </div>
              <div className='flex-1'>
                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                  End Date
                </div>
                <div className='text-base text-slate-600 dark:text-slate-50'>
                  {selectedEvent?.event?.end
                    ? new Date(selectedEvent?.event?.end).toLocaleString()
                    : 'Not provided'}
                </div>
              </div>
            </li> */}
            {/* <li className='flex space-x-3 rtl:space-x-reverse'>
              <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                <Icon icon='heroicons:document' />
              </div>
              <div className='flex-1'>
                <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                  Description
                </div>
                <div className='text-base text-slate-600 dark:text-slate-50'>
                  {selectedEvent?.event?.extendedProps?.description ||
                    'Not provided'}
                </div>
              </div>
            </li> */}
            {selectedEvent?.event?.extendedProps?.zoomLink && (
              <li className='flex space-x-3 rtl:space-x-reverse'>
                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                  <Icon icon='heroicons:link' />
                </div>
                <div className='flex-1'>
                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                    Zoom Link
                  </div>
                  <a
                    href={selectedEvent.event.extendedProps.zoomLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-base text-blue-600 hover:underline dark:text-blue-400'
                  >
                    {selectedEvent?.event?.extendedProps?.zoomLink}
                  </a>
                </div>
              </li>
            )}
          </ul>
        ) : (
          <p>No event selected</p>
        )}
      </Modal>
    </div>
  );
};

export default EventModal;
