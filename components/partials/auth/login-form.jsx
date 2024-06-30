'use client';
import React, { useState } from 'react';
import Textinput from '@/components/ui/Textinput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Checkbox from '@/components/ui/Checkbox';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseclient'; // Import Supabase client

const schema = yup
  .object({
    email: yup.string().email('Invalid email').required('Email is Required'),
    password: yup.string().required('Password is Required'),
  })
  .required();

const LoginForm = () => {
  const [checked, setChecked] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const router = useRouter();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      const { user, error: loginError } = await login(
        data.email,
        data.password
      );
      if (loginError) {
        throw loginError;
      }

      console.log('User object after login:', user); // Log the user object

      if (!user || !user.id) {
        throw new Error('Invalid user object returned from login function');
      }

      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });

      const userId = user.id;

      // Fetch profile details
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      let formFilled = false;

      // Check if the form has already been filled
      if (profile.user_type === 'investor') {
        const { data: investorDetails } = await supabase
          .from('investor_signup')
          .select('*')
          .eq('profile_id', userId)
          .single();

        if (investorDetails) {
          formFilled = true;
        }
      } else if (profile.user_type === 'startup') {
        const { data: startupDetails } = await supabase
          .from('company_profile')
          .select('*')
          .eq('profile_id', userId)
          .single();

        if (startupDetails) {
          formFilled = true;
        }
      }

      // Redirect based on whether the form has been filled or not
      if (formFilled) {
        router.push('/profile');
      } else {
        if (profile.user_type === 'investor') {
          router.push(`investor-form?profile_id=${profile.id}`);
        } else if (profile.user_type === 'startup') {
          router.push(`startup-form?profile_id=${profile.id}`);
        } else {
          router.push('/profile'); // Redirect to a general dashboard or another appropriate page
        }
      }
    } catch (error) {
      console.error('Login submission error:', error); // Logging error
      toast.error('Invalid credentials', {
        position: 'top-right',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Textinput
        name='email'
        label='Email'
        type='email'
        placeholder='Type your email'
        register={register}
        error={errors?.email}
      />
      <Textinput
        name='password'
        label='Password'
        type='password'
        placeholder='Type your password'
        register={register}
        error={errors.password}
      />
      <div className='flex justify-between'>
        <Checkbox
          value={checked}
          onChange={() => setChecked(!checked)}
          label='Keep me signed in'
        />
        <Link
          href='/forgot-password'
          className='text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium'
        >
          Forgot Password?
        </Link>
      </div>
      <button className='btn btn-dark block w-full text-center'>Sign in</button>
    </form>
  );
};

export default LoginForm;
