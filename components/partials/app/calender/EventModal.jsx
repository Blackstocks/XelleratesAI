import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Textinput from '@/components/ui/Textinput';
import { useForm, Controller } from 'react-hook-form';
import CustomSelect from '@/components/ui/Select';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { dateClick } from './store';
import Flatpickr from 'react-flatpickr';
import FormGroup from '@/components/ui/FormGroup';

const EventModal = ({ activeModal, onClose, selectedEvent }) => {
  const { categories } = useSelector((state) => state.calendar);
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (selectedEvent) {
      setStartDate(selectedEvent.start);
      setEndDate(selectedEvent.end || selectedEvent.start);
    }
  }, [selectedEvent]);

  const FormValidationSchema = yup
    .object({
      title: yup.string().required('Event Name is required'),
      cata: yup.string().required('Category is required'),
    })
    .required();

  const {
    register,
    control,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(FormValidationSchema),
    mode: 'all',
  });

  const onSubmit = (data) => {
    dispatch(dateClick({ data, selectedEvent, startDate, endDate }));
    onClose();
    reset();
  };

  return (
    <div>
      <Modal
        title='Event'
        labelclassName='btn-outline-dark'
        activeModal={activeModal}
        onClose={onClose}
      >
        {selectedEvent ? (
          <div className='space-y-4'>
            {/* Display event details */}
            <div>
              {/* <h5>Event Details</h5>
              <p>
                <strong>Event Name:</strong> {selectedEvent?.event?.title}
              </p> */}
              {/* <p>
                <strong>Start Date:</strong>{' '}
                {new Date(selectedEvent?.event?.start).toLocaleString()}
              </p> */}
              {/* <p>
                <strong>End Date:</strong>{' '}
                {selectedEvent.end
                  ? new Date(selectedEvent?.event?.end).toLocaleString()
                  : 'N/A'}
              </p> */}
              {/* <p>
                <strong>Description:</strong>{' '}
                {selectedEvent?.event?.extendedProps?.description ||
                  'No description provided'}
              </p> */}
              {/* {selectedEvent?.event?.extendedProps?.zoomLink && (
                <p>
                  <strong>Zoom Link:</strong>{' '}
                  <a
                    href={selectedEvent.extendedProps.zoomLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Join Meeting
                  </a>
                </p>
              )} */}
            </div>

            {/* Event editing form */}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <Textinput
                name='title'
                label='Event Name'
                type='text'
                placeholder='Enter Event Name'
                defaultValue={selectedEvent?.event?.title}
                register={register}
                error={errors.title}
              />
              <FormGroup
                label='Start Date'
                id='default-picker'
                error={errors.startDate}
              >
                <Controller
                  name='startDate'
                  control={control}
                  render={({ field }) => (
                    <Flatpickr
                      className='form-control py-2'
                      id='default-picker'
                      placeholder='yyyy, dd M'
                      value={startDate}
                      defaultValue={new Date(
                        selectedEvent?.event?.start
                      ).toLocaleString()}
                      onChange={(date) => setStartDate(date[0])}
                      options={{
                        altInput: true,
                        altFormat: 'F j, Y',
                        dateFormat: 'Y-m-d',
                      }}
                    />
                  )}
                />
              </FormGroup>
              {/* <FormGroup
                label='End Date'
                id='default-picker2'
                error={errors.endDate}
              >
                <Controller
                  name='endDate'
                  control={control}
                  render={({ field }) => (
                    <Flatpickr
                      className='form-control py-2'
                      id='default-picker2'
                      placeholder='yyyy, dd M'
                      value={endDate}
                      onChange={(date) => setEndDate(date[0])}
                      options={{
                        altInput: true,
                        altFormat: 'F j, Y',
                        dateFormat: 'Y-m-d',
                      }}
                    />
                  )}
                />
              </FormGroup> */}

              <Textinput
                name='description'
                label='Description'
                type='text'
                placeholder='Enter Event Name'
                defaultValue={selectedEvent?.event?.extendedProps?.description}
                register={register}
                error={errors.title}
              />
              <Textinput
                name='zoomLink'
                label='Zoom Link'
                type='text'
                placeholder='Enter Event Name'
                defaultValue={selectedEvent?.event?.extendedProps?.zoomLink}
                register={register}
                error={errors.title}
              />

              {/* <CustomSelect
                label='Basic Select'
                options={categories}
                register={register}
                error={errors.cata}
                name='cata'
              /> */}
              <div className='ltr:text-right rtl:text-left'>
                <button className='btn btn-dark text-center'>Submit</button>
              </div>
            </form>
          </div>
        ) : (
          <p>No event selected</p>
        )}
      </Modal>
    </div>
  );
};

export default EventModal;
