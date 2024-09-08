import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import Textinput from '@/components/ui/Textinput';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseclient';
import Dropdowntype from '@/components/ui/Dropdown1';
import InputGroup from '@/components/ui/InputGroup';
import { handleFileUpload } from '@/lib/actions/insertformdetails';
import PasswordInput from '@/components/partials/passwordInput'; // Adjust the path accordingly

// Validation schema
const schema = yup
  .object({
    name: yup.string().required('Name is Required'),
    companyName: yup.string().required('Company Name is required'),
    email: yup.string().email('Invalid email').required('Email is Required'),
    mobile: yup
      .string()
      .required('Mobile number is Required')
      .matches(/^[0-9]+$/, 'Mobile number must be numeric'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(20, "Password shouldn't be more than 20 characters")
      .required('Please enter password'),
    confirmpassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match'),
    user_type: yup.string().required('User type is required'),
    linkedinProfile: yup
      .string()
      .url('Invalid URL')
      .required('LinkedIn profile is required'),
  })
  .required();

const RegForm1 = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange', // Validate on change for faster feedback
  });

  const userType = useWatch({ control, name: 'user_type' });

  // Memoized form submission handler
  const onSubmit = useCallback(
    async (data) => {
      setIsSubmitting(true);
      const logoFile =
        data?.company_logo && data.company_logo.length > 0
          ? data.company_logo[0]
          : null;
      if (!logoFile) {
        toast.error('Please upload a company logo.');
        setIsSubmitting(false);
        return;
      }

      const companyName = data?.companyName || 'not_mentioned';
      const bucket = 'company-logos';

      try {
        const logoUrl = await handleFileUpload(
          logoFile,
          bucket,
          companyName,
          'logo'
        );
        if (!logoUrl) {
          toast.error('Failed to upload company logo.');
          setIsSubmitting(false);
          return;
        }

        const { data: existingUsers, error: existingUserError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email);
        if (existingUserError) {
          toast.error(existingUserError.message);
          setIsSubmitting(false);
          return;
        }

        if (existingUsers.length > 0) {
          toast.error('User already registered with this email');
          setIsSubmitting(false);
          return;
        }

        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: data.email,
            password: data.password,
          });
        if (signUpError) {
          toast.error(signUpError.message);
          setIsSubmitting(false);
          return;
        }

        if (signUpData?.user) {
          const userId = signUpData.user.id;
          const { error: updateError } = await supabase.auth.updateUser({
            data: { display_name: data.name },
          });
          if (updateError) {
            toast.error(updateError.message);
            setIsSubmitting(false);
            return;
          }

          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                name: data.name,
                company_name: data.companyName,
                email: data.email,
                mobile: data.mobile,
                user_type: data.user_type,
                linkedin_profile: data.linkedinProfile,
                company_logo: logoUrl,
                role: 'user',
                status: 'pending',
              },
            ]);

          if (insertError) {
            toast.error(insertError.message);
            setIsSubmitting(false);
          } else {
            const response = await fetch('/api/send-registration-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ to: data.email, name: data.name }),
            });

            if (response.ok) {
              toast.success(
                'Account created successfully! Please wait for approval.'
              );
              setIsSubmitting(false);
              router.push('/');
            } else {
              const errorData = await response.json();
              toast.error(
                errorData.error || 'Failed to send registration email.'
              );
              setIsSubmitting(false);
            }
          }
        }
      } catch (error) {
        toast.error('An error occurred during file upload.');
        setIsSubmitting(false);
      } finally {
        setIsSubmitting(false);
      }
    },
    [router]
  );

  // Memoized user type handler
  const handleSelectUserType = useCallback(
    (value) => {
      setValue('user_type', value);
    },
    [setValue]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <Textinput
        name='name'
        label='Name'
        type='text'
        placeholder='Enter your name'
        register={register}
        error={errors.name}
      />
      <Textinput
        name='companyName'
        label='Company Name'
        type='text'
        placeholder='Enter your company name'
        register={register}
        error={errors.companyName}
      />
      <Textinput
        name='email'
        label='Email'
        type='email'
        placeholder='Enter your email'
        register={register}
        error={errors.email}
      />
      <Textinput
        name='mobile'
        label='Mobile'
        type='text'
        placeholder='Enter your mobile number'
        register={register}
        error={errors.mobile}
      />
      <PasswordInput
        label='Password'
        name='password'
        placeholder='Type your password'
        register={register}
        error={errors.password}
      />
      <PasswordInput
        label='Confirm Password'
        name='confirmpassword'
        placeholder='Type your password'
        register={register}
        error={errors.confirmpassword}
      />
      <Dropdowntype
        label={userType || 'Select User Type'}
        items={[
          { label: 'Startup', value: 'startup' },
          { label: 'Investor', value: 'investor' },
        ]}
        onSelect={handleSelectUserType}
        error={errors.user_type}
      />
      <Textinput
        label='LinkedIn Profile'
        type='url'
        placeholder='https://www.linkedin.com/in/example'
        name='linkedinProfile'
        error={errors.linkedinProfile}
        register={register}
      />
      <InputGroup
        label='Upload Company Logo'
        type='file'
        name='company_logo'
        error={errors.company_logo || null}
        register={register}
        className='border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm p-2 w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
      />
      <button
        className='btn btn-dark block w-full text-center'
        type='submit'
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Create an account'}
      </button>
    </form>
  );
};

export default RegForm1;
