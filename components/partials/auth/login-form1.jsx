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
import PasswordInput from '@/components/partials/passwordInput';

const schema = yup
  .object({
    email: yup.string().email('Invalid email').required('Email is Required'),
    password: yup.string().required('Password is Required'),
  })
  .required();

const LoginForm1 = () => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, login } = useAuth(); // Get user context immediately

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loginError = await login(data.email, data.password);

      if (loginError) {
        throw new Error(loginError.message || 'Invalid credentials');
      }

      // No need to check profile status here, handled in login function
      router.push('/dashboard'); // Redirect to dashboard directly
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
