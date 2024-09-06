'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify';
import Textinput from '@/components/ui/Textinput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup
  .object({
    email: yup.string().email('Invalid email').required('Email is required'),
  })
  .required();

const ForgotPass = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.portal-xellerates.com/update-password',
      });
      if (error) {
        throw error;
      }
      toast.success('Password reset email sent successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    } catch (error) {
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Textinput
        name='email'
        label='Email'
        type='email'
        placeholder='Enter your email'
        register={register}
        error={errors.email}
      />
      <button
        type='submit'
        className='btn btn-dark block w-full text-center'
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
};

export default ForgotPass;
