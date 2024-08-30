'use client';

import React, { useState, useEffect } from 'react';
import Textinput from '@/components/ui/Textinput';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import Checkbox from '@/components/ui/Checkbox';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseclient';
import PasswordInput from '@/components/partials/passwordInput';

// Validation schema
const schema = yup
  .object({
    email: yup.string().email('Invalid email').required('Email is Required'),
    password: yup.string().required('Password is Required'),
  })
  .required();

const LoginForm1 = () => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const checkUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push('/profile');
    };

    checkUserSession();
  }, [router]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { user, error: loginError } = await login(
        data.email,
        data.password
      );
      if (loginError || !user || !user.id)
        throw new Error(loginError?.message || 'Invalid credentials');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.status !== 'approved') {
        toast.error('Your account is not approved yet.', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 500,
      });

      const isFormFilled =
        profile.user_type === 'investor'
          ? !!profile.investor_details
          : !!profile.startup_details;
      router.push(isFormFilled ? '/dashboard' : '/profile');
    } catch (error) {
      console.error('Login submission error:', error);
      toast.error(error.message, { position: 'top-right', autoClose: 1500 });
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
        placeholder='Type your email'
        register={register}
        error={errors?.email}
      />
      <PasswordInput
        label='Password'
        name='password'
        register={register}
        placeholder='Type your password'
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
      <button
        className='btn btn-dark block w-full text-center'
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};

export default LoginForm1;
