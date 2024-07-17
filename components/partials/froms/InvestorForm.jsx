'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import CustomSelect from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { investorSignupSchema } from '@/lib/schema/investorSchema';
import { insertInvestorSignupData } from '@/lib/actions/investorActions';
import { supabase } from '@/lib/supabaseclient';
import ReactSelect, { components } from 'react-select';
import makeAnimated from 'react-select/animated';
import InputGroup from '@/components/ui/InputGroup';

const animatedComponents = makeAnimated();

const InvestorSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [isMounted, setIsMounted] = useState(false); // New state for client-side rendering
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profile_id'); // Get profile_id from URL query

  useEffect(() => {
    setIsMounted(true); // Set the mounted state to true after component mounts
  }, []);

  useEffect(() => {
    const initializeForm = async () => {
      if (!profileId) {
        router.push('/'); // Redirect if profileId is not available
        return;
      }

      // Check if the form has already been filled
      const { data: investorDetails, error: investorError } = await supabase
        .from('investor_signup')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (investorDetails) {
        router.push('/profile');
        return;
      } else if (investorError) {
        console.error('Error fetching investor details:', investorError);
      }

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, mobile,linkedin_profile')
        .eq('id', profileId)
        .single();

      if (profileError) {
        console.error('Error fetching profile data:', profileError);
      } else {
        setInitialValues({
          name: profile.name,
          email: profile.email,
          mobile: profile.mobile,
          linkedinProfile: profile.linkedin_profile,
        });
      }
    };

    initializeForm();
  }, [profileId, router]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(investorSignupSchema),
    mode: 'all',
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const handleFileUpload = async (file) => {
    if (!file) {
      console.log('Profile photo is not provided.');
      return null;
    }

    const filePath = `profile_photos/${Date.now()}-${file.name}`;

    try {
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { publicUrl } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath).data;

      return publicUrl; // Return the public URL
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    if (!profileId) {
      console.error('Profile ID is missing');
      return;
    }

    let profilePhotoUrl = null;
    if (data.profilePhoto && data.profilePhoto[0]) {
      profilePhotoUrl = await handleFileUpload(data.profilePhoto[0]);
    }

    const formData = {
      ...data,
      profile_id: profileId,
      ...initialValues,
      profilePhoto: profilePhotoUrl,
    };

    setIsLoading(true);
    try {
      await insertInvestorSignupData(formData);
      router.push('/profile');
    } catch (error) {
      console.error('Error saving investor signup data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null; // Ensure client-side rendering

  return (
    <div>
      <Card title='Investor Signup'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
            <div className='lg:col-span-3 md:col-span-2 col-span-1'>
              <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                Enter Your Information
              </h4>
            </div>
            <Textinput
              label='Name'
              type='text'
              placeholder='Name'
              name='name'
              error={errors.name}
              register={register}
            />
            <Textinput
              label='Email'
              type='email'
              placeholder='Email'
              name='email'
              error={errors.email}
              register={register}
            />
            <Textinput
              label='Mobile'
              type='text'
              placeholder='Mobile'
              name='mobile'
              error={errors.mobile}
              register={register}
            />
            <CustomSelect
              label='Are you a'
              name='usertype'
              options={[
                { value: 'VC', label: 'VC' },
                { value: 'Angel Fund', label: 'Angel Fund' },
                { value: 'Angel Investor', label: 'Angel Investor' },
                { value: 'Syndicate', label: 'Syndicate' },
              ]}
              error={errors.usertype}
              register={register}
            />
            <Textarea
              label='Investment Thesis'
              placeholder='Investment Thesis'
              name='investmentThesis'
              error={errors.investmentThesis}
              register={register}
            />
            <Textinput
              label='Cheque Size'
              type='text'
              placeholder='Cheque Size'
              name='chequeSize'
              error={errors.chequeSize}
              register={register}
            />
            <CustomSelect
              label='Sectors you are interested in'
              name='sectors'
              options={[
                {
                  value: 'Agriculture and Allied Sectors',
                  label: 'Agriculture and Allied Sectors',
                },
                { value: 'Manufacturing', label: 'Manufacturing' },
                { value: 'Services', label: 'Services' },
                { value: 'Energy', label: 'Energy' },
                { value: 'Infrastructure', label: 'Infrastructure' },
                {
                  value: 'Retail and E-commerce',
                  label: 'Retail and E-commerce',
                },
                {
                  value: 'Banking and Insurance',
                  label: 'Banking and Insurance',
                },
                { value: 'Mining and Minerals', label: 'Mining and Minerals' },
                { value: 'Food Processing', label: 'Food Processing' },
                {
                  value: 'Textiles and Apparel',
                  label: 'Textiles and Apparel',
                },
                { value: 'Automotive', label: 'Automotive' },
                {
                  value: 'Chemical and Fertilizers',
                  label: 'Chemical and Fertilizers',
                },
                {
                  value: 'Pharmaceuticals and Biotechnology',
                  label: 'Pharmaceuticals and Biotechnology',
                },
                {
                  value: 'Media and Entertainment',
                  label: 'Media and Entertainment',
                },
                {
                  value: 'Tourism and Hospitality',
                  label: 'Tourism and Hospitality',
                },
                {
                  value: 'Education and Training',
                  label: 'Education and Training',
                },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Telecommunications', label: 'Telecommunications' },
                {
                  value: 'Logistics and Supply Chain',
                  label: 'Logistics and Supply Chain',
                },
                {
                  value: 'Aerospace and Defense',
                  label: 'Aerospace and Defense',
                },
                {
                  value: 'Environmental Services',
                  label: 'Environmental Services',
                },
                {
                  value: 'Fashion and Lifestyle',
                  label: 'Fashion and Lifestyle',
                },
                {
                  value: 'Financial Technology (Fintech)',
                  label: 'Financial Technology (Fintech)',
                },
                {
                  value: 'Sports and Recreation',
                  label: 'Sports and Recreation',
                },
                { value: 'Human Resources', label: 'Human Resources' },
                { value: 'Others', label: 'Others' },
              ]}
              error={errors.sectors}
              register={register}
            />
            <div>
              <label className='form-label' htmlFor='investmentStage'>
                Stage you invest in
              </label>
              <Controller
                name='investmentStage'
                control={control}
                defaultValue={[]} // Ensure default value is an empty array for a multi-select
                render={({ field }) => {
                  const investmentStageOptions = [
                    { value: 'Pre Seed', label: 'Pre Seed' },
                    { value: 'Seed', label: 'Seed' },
                    { value: 'Pre-Series', label: 'Pre-Series' },
                    { value: 'Series A', label: 'Series A' },
                    { value: 'Series B', label: 'Series B' },
                    { value: 'Series C & Beyond', label: 'Series C & Beyond' },
                  ];

                  return (
                    <ReactSelect
                      {...field}
                      isMulti
                      isClearable={false}
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      options={investmentStageOptions}
                      className='react-select'
                      value={
                        field.value?.map((value) =>
                          investmentStageOptions.find(
                            (option) => option.value === value
                          )
                        ) || []
                      }
                      onChange={(selected) =>
                        field.onChange(selected.map((option) => option.value))
                      }
                    />
                  );
                }}
              />
              {errors.investmentStage && (
                <p className='text-red-500 text-xs italic'>
                  {errors.investmentStage.message}
                </p>
              )}
            </div>
            <InputGroup
              label='Profile Photo'
              type='file'
              name='profilePhoto'
              error={errors.profilePhoto}
              register={register}
              className='upload-animation'
            />
          </div>

          <div className='text-right mt-10'>
            <Button
              text={isLoading ? 'Submitting...' : 'Submit'}
              className={`btn-dark ${isLoading ? 'loading' : ''}`}
              type='submit'
              disabled={isLoading}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InvestorSignupForm;
