'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { investorSignupSchema } from '@/lib/schema/investorSchema';
import { insertInvestorSignupData } from '@/lib/actions/investorActions';
import { supabase } from '@/lib/supabaseclient';

const InvestorSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profile_id'); // Get profile_id from URL query

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(investorSignupSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      usertype: '',
      investmentThesis: '',
      chequeSize: '',
      sectors: '',
      investmentStage: '',
    },
  });

  useEffect(() => {
    if (profileId) {
      const fetchProfileData = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('investor_signup')
            .select(
              'name, email, mobile, typeof, investment_thesis, cheque_size, sectors, investment_stage'
            )
            .eq('profile_id', profileId)
            .single();
          if (error) {
            console.error('Error fetching profile data:', error);
          } else {
            setInitialValues({
              name: profile.name,
              email: profile.email,
              mobile: profile.mobile,
              usertype: profile.typeof,
              investmentThesis: profile.investment_thesis,
              chequeSize: profile.cheque_size,
              sectors: profile.sectors,
              investmentStage: profile.investment_stage,
            });
            reset({
              name: profile.name,
              email: profile.email,
              mobile: profile.mobile,
              usertype: profile.typeof,
              investmentThesis: profile.investment_thesis,
              chequeSize: profile.cheque_size,
              sectors: profile.sectors,
              investmentStage: profile.investment_stage,
            }); // Reset form with fetched data
          }
        } catch (error) {
          console.error('Unexpected error:', error);
        }
      };

      fetchProfileData();
    }
  }, [profileId, reset]);

  const onSubmit = async (data) => {
    if (!profileId) {
      console.error('Profile ID is missing');
      return;
    }
    // Include initial values for disabled fields in form data
    const formData = { ...data, profile_id: profileId, ...initialValues };
    console.log('Form Data:', formData);
    setIsLoading(true);
    try {
      await insertInvestorSignupData(formData);
      console.log('Investor signup data saved successfully');
      router.push('/profile'); // Redirect after successful signup
    } catch (error) {
      console.error('Error saving investor signup data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = (field) => !!initialValues && !!initialValues[field];

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
              disabled={isDisabled('name')}
            />
            <Textinput
              label='Email'
              type='email'
              placeholder='Email'
              name='email'
              error={errors.email}
              register={register}
              disabled={isDisabled('email')}
            />
            <Textinput
              label='Mobile'
              type='text'
              placeholder='Mobile'
              name='mobile'
              error={errors.mobile}
              register={register}
              disabled={isDisabled('mobile')}
            />
            <Select
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
              disabled={isDisabled('usertype')}
            />
            <Textarea
              label='Investment Thesis'
              placeholder='Investment Thesis'
              name='investmentThesis'
              error={errors.investmentThesis}
              register={register}
              disabled={isDisabled('investmentThesis')}
            />
            <Textinput
              label='Cheque Size'
              type='text'
              placeholder='Cheque Size'
              name='chequeSize'
              error={errors.chequeSize}
              register={register}
              disabled={isDisabled('chequeSize')}
            />
            <Select
              label='Sectors you are interested in'
              name='sectors'
              options={[
                { value: 'Technology', label: 'Technology' },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Consumer Goods', label: 'Consumer Goods' },
                // Add more sectors as needed
              ]}
              error={errors.sectors}
              register={register}
              disabled={isDisabled('sectors')}
            />
            <Select
              label='Stage you invest in'
              name='investmentStage'
              options={[
                { value: 'Pre Seed', label: 'Pre Seed' },
                { value: 'Seed', label: 'Seed' },
                { value: 'Pre-Series', label: 'Pre-Series' },
                { value: 'Series A', label: 'Series A' },
                { value: 'Series B', label: 'Series B' },
                { value: 'Series C & Beyond', label: 'Series C & Beyond' },
              ]}
              error={errors.investmentStage}
              register={register}
              disabled={isDisabled('investmentStage')}
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
