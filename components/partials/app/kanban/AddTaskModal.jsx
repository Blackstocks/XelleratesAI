import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useSelector, useDispatch } from 'react-redux';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Flatpickr from 'react-flatpickr';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormGroup from '@/components/ui/FormGroup';
import { supabase } from '@/lib/supabaseclient';
import { setColumnId, updateTaskTag } from './store';
import Select from 'react-select';

const AddTaskModal = ({
  setToggleTaskModal,
  toggleTaskModal,
  column_id,
  profile_id,
  fetchTaskSummary,
}) => {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const { taskTag } = useSelector((state) => state.kanban);

  const validationSchema = yup
    .object({
      title: yup.string().required('Title is required'),
      assignEmail: yup
        .string()
        .email('Must be a valid email')
        .required('Assignee email is required'),
      tags: yup
        .array()
        .min(1, 'At least one tag is required')
        .required('Tag is required'),
      startDate: yup
        .date()
        .required('Start date is required')
        .min(new Date(), 'Start date must be greater than today'),
      endDate: yup
        .date()
        .required('End date is required')
        .min(new Date(), 'End date must be greater than today'),
    })
    .required();

  const {
    register,
    control,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'all',
  });

  const onSubmit = async (data) => {
    await addTaskData(data);
    setToggleTaskModal(false);
    reset();
    fetchTaskSummary();
  };

  const addTaskData = async (data) => {
    const { title, assignEmail, tags } = data;
    const body = {
      name: title,
      description,
      start_date: data.startDate.toISOString().split('T')[0],
      end_date: data.endDate.toISOString().split('T')[0],
      progress: Math.floor(Math.random() * (100 - 10 + 1) + 10),
      column_id,
      profile_id,
      assigned_email: assignEmail,
      tags,
    };

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch(`/api/task_kanban`, {
        headers: {
          'Content-Type': 'application/json',
          'supabase-token': session.access_token,
        },
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to add task to database');
      }

      dispatch(setColumnId(''));
      dispatch(updateTaskTag(!taskTag));

      // Send email to the assignee
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: assignEmail,
          subject: 'New Task Assigned',
          text: `You have been assigned a new task: ${title}. Please log in to view the details.`,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    window.location.reload();
  };

  return (
    <div>
      <Modal
        title='Create Task'
        labelclassName='btn-outline-dark'
        activeModal={toggleTaskModal}
        onClose={() => setToggleTaskModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <Textinput
            name='title'
            label='Task Title'
            placeholder='Task Title'
            register={register}
            error={errors.title}
          />
          <Textinput
            name='assignEmail'
            label='Assignee Email'
            placeholder='Assignee Email'
            register={register}
            error={errors.assignEmail}
          />
          <div className='grid lg:grid-cols-2 gap-4 grid-cols-1'>
            <FormGroup
              label='Start Date'
              id='start-date-picker'
              error={errors.startDate}
            >
              <Controller
                name='startDate'
                control={control}
                render={({ field }) => (
                  <Flatpickr
                    className='form-control py-2'
                    id='start-date-picker'
                    placeholder='yyyy, dd M'
                    value={startDate}
                    onChange={(date) => field.onChange(date)}
                    options={{
                      altInput: true,
                      altFormat: 'F j, Y',
                      dateFormat: 'Y-m-d',
                    }}
                  />
                )}
              />
            </FormGroup>
            <FormGroup
              label='End Date'
              id='end-date-picker'
              error={errors.endDate}
            >
              <Controller
                name='endDate'
                control={control}
                render={({ field }) => (
                  <Flatpickr
                    className='form-control py-2'
                    id='end-date-picker'
                    placeholder='yyyy, dd M'
                    value={endDate}
                    onChange={(date) => field.onChange(date)}
                    options={{
                      altInput: true,
                      altFormat: 'F j, Y',
                      dateFormat: 'Y-m-d',
                    }}
                  />
                )}
              />
            </FormGroup>
          </div>
          <Textarea
            label='Description'
            placeholder='Task Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className={errors.tags ? 'has-error' : ''}>
            <label className='form-label' htmlFor='tags'>
              Tag
            </label>
            <Controller
              name='tags'
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  className='react-select'
                  classNamePrefix='select'
                  isMulti
                />
              )}
            />
            {errors.tags && (
              <div className='mt-2 text-danger-500 block text-sm'>
                {errors.tags?.message}
              </div>
            )}
          </div>
          <div className='ltr:text-right rtl:text-left'>
            <button className='btn btn-dark text-center' type='submit'>
              Add Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddTaskModal;
