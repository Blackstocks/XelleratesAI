import React, { useState } from 'react';

import Modal from '@/components/ui/Modal';
import { useSelector, useDispatch } from 'react-redux';
import Textinput from '@/components/ui/Textinput';
import { supabase } from '@/lib/supabaseclient';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toggleColumnModal, addColumnBoard } from './store';

const FormValidationSchema = yup
  .object({
    title: yup.string().required('Title is required'),
  })
  .required();

const AddColumn = ({ profile_id }) => {
  const { columModal } = useSelector((state) => state.kanban);
  const dispatch = useDispatch();
  const [color, setColor] = useState('#4669fa');
  const [name, setName] = useState('');

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
    dispatch(addColumnBoard({ ...data, color }));
    dispatch(toggleColumnModal(false));
    addColumnData();
    reset();
  };

  const addColumnData = async () => {
    // console.log(profile_id)
    const body = {
      profile_id: profile_id,
      name: name,
      color: color,
    };
    console.log(body);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch(`/api/column_kanban`, {
        headers: {
          'Content-Type': 'application/json',
          'supabase-token': session.access_token,
        },
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('error in adding column from database:', error);
    }
    window.location.reload();
  };

  return (
    <div>
      <Modal
        title='Create New Column'
        labelclassName='btn-outline-dark'
        activeModal={columModal}
        onClose={() => dispatch(toggleColumnModal(false))}
      >
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 '>
          <Textinput
            name='title'
            label='Column Name'
            placeholder='Column Name'
            register={register}
            error={errors.title}
            onChange={(e) => setName(e.target.value)}
          />
          <div className='formGroup'>
            <label className='form-label'>Select Color</label>
            <input
              type='color'
              className='form-control'
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className='ltr:text-right rtl:text-left'>
            <button className='btn btn-dark  text-center'>Add</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddColumn;
