'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import useUserDetails from '@/hooks/useUserDetails';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import CustomSelect from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import VerticalNavTabs from '@/components/profileSideBar';
import ReactSelect from 'react-select';
import makeAnimated from 'react-select/animated';
import InputGroup from '@/components/ui/InputGroup';
import {
  insertInvestorSignupData,
  updateInvestorSignupData,
  handleFileUpload,
} from '@/lib/actions/investorActions';
import FormCompletionBanner from '@/components/FormCompletionBanner';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/components/Loading';

const Profile = () => {
  const { user, updateDetailsLocally, loading } = useUserDetails();
  const { companyProfile, investorSignup } = useCompleteUserDetails();
  const [editingSection, setEditingSection] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm();
  const animatedComponents = makeAnimated();
  const sectorOptions = [
    {
      value: 'Agriculture and Allied Sectors',
      label: 'Agriculture and Allied Sectors',
    },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Services', label: 'Services' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Retail and E-commerce', label: 'Retail and E-commerce' },
    { value: 'Banking and Insurance', label: 'Banking and Insurance' },
    { value: 'Mining and Minerals', label: 'Mining and Minerals' },
    { value: 'Food Processing', label: 'Food Processing' },
    { value: 'Textiles and Apparel', label: 'Textiles and Apparel' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Chemical and Fertilizers', label: 'Chemical and Fertilizers' },
    {
      value: 'Pharmaceuticals and Biotechnology',
      label: 'Pharmaceuticals and Biotechnology',
    },
    { value: 'Media and Entertainment', label: 'Media and Entertainment' },
    { value: 'Tourism and Hospitality', label: 'Tourism and Hospitality' },
    { value: 'Education and Training', label: 'Education and Training' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Telecommunications', label: 'Telecommunications' },
    {
      value: 'Logistics and Supply Chain',
      label: 'Logistics and Supply Chain',
    },
    { value: 'Aerospace and Defense', label: 'Aerospace and Defense' },
    { value: 'Environmental Services', label: 'Environmental Services' },
    { value: 'Fashion and Lifestyle', label: 'Fashion and Lifestyle' },
    {
      value: 'Financial Technology (Fintech)',
      label: 'Financial Technology (Fintech)',
    },
    { value: 'Sports and Recreation', label: 'Sports and Recreation' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Others', label: 'Others' },
  ];
  const [investorProfileLoc, setInvestorProfileLoc] = useState(null);

  const handleSave = async (data, section) => {
    try {
      let profilePhotoUrl = null;
      if (data.profilePhoto && data.profilePhoto[0]) {
        profilePhotoUrl = await handleFileUpload(data.profilePhoto[0]);
      }

      const formData = {
        ...data,
        profilePhoto: profilePhotoUrl,
      };

      let result;
      switch (section) {
        case 'investor_details':
          result = investorSignup
            ? await updateInvestorSignupData(user?.id, formData)
            : await insertInvestorSignupData({
                ...formData,
                profile_id: user?.id,
              });

          if (result) {
            setInvestorProfileLoc(result[0]);
          }
          break;
        default:
          console.error('Unknown section:', section);
          return;
      }

      setEditingSection(null);
      console.log('investorProfileLoc', investorProfileLoc);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  if (!user || loading) {
    return <Loading />;
  }

  const defaultSectors = JSON.parse(investorSignup?.sectors || '[]');
  const defaultInvestmentStages = investorSignup?.investment_stage.split(',');
  const parsedSectors = JSON.parse(
    investorProfileLoc?.sectors || investorSignup?.sectors || '[]'
  );

  // Map parsed values to corresponding labels
  const renderedSectors = parsedSectors
    .map((value) => {
      const option = sectorOptions.find((option) => option.value === value);
      return option ? option.label : value;
    })
    .join(', ');

  return (
    <div className='space-y-5 profile-page'>
      <FormCompletionBanner profileId={companyProfile?.profile_id} />
      <>
        <div className='profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-lg bg-white dark:bg-slate-800 lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1]'>
          <div className='bg-slate-900 dark:bg-slate-700 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg'></div>
          <div className='profile-box flex-none md:text-start text-center'>
            <div className='md:flex items-end md:space-x-6 rtl:space-x-reverse'>
              <div className='flex-none'>
                <div className='md:h-[186px] md:w-[186px] h-[140px] w-[140px] md:ml-0 md:mr-0 ml-auto mr-auto md:mb-0 mb-4 rounded-full ring-4 ring-slate-100 relative overflow-hidden'>
                  {user?.user_type === 'startup' ? (
                    <div className='absolute inset-0'>
                      {companyProfile?.company_logo ? (
                        <img
                          src={companyProfile.company_logo}
                          alt='Company Logo'
                          className='w-full h-full object-contain rounded-full'
                        />
                      ) : (
                        <img
                          src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                          alt=''
                          className='w-full h-full object-contain rounded-full'
                        />
                      )}
                    </div>
                  ) : (
                    <div className='absolute inset-0'>
                      {investorSignup?.profile_photo ? (
                        <img
                          src={investorSignup?.profile_photo}
                          alt='Profile Photo'
                          className='w-full h-full object-contain rounded-full'
                        />
                      ) : (
                        <img
                          src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                          alt=''
                          className='w-full h-full object-contain rounded-full'
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className='flex-1'>
                {user?.user_type === 'investor' ? (
                  <div className='text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[3px]'>
                    {user?.name || 'Not provided'}
                  </div>
                ) : (
                  <div className='text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[3px]'>
                    {investorProfileLoc?.name || user?.name || 'Not provided'}
                  </div>
                )}
                {user?.user_type === 'investor' && (
                  <div className='text-sm font-light text-slate-600 dark:text-slate-400'>
                    {investorProfileLoc?.typeof ||
                      investorSignup?.typeof ||
                      'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {user?.user_type === 'investor' &&
          editingSection !== 'investor_details' && (
            <div className='relative lg:col-span-6 col-span-12'>
              <Card title='Investor Details'>
                <ul className='list space-y-8'>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:building-library' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        COMPANY NAME
                      </div>
                      <div className='text-base text-slate-600 dark:text-slate-50'>
                        {investorProfileLoc?.company_name ||
                          investorSignup?.company_name ||
                          user?.company_name ||
                          'Not provided'}
                      </div>
                    </div>
                  </li>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:envelope' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        EMAIL
                      </div>
                      <a
                        href={`mailto:${
                          investorProfileLoc?.email || user?.email
                        }`}
                        className='text-base text-slate-600 dark:text-slate-50'
                      >
                        {investorProfileLoc?.email ||
                          user?.email ||
                          'Not provided'}
                      </a>
                    </div>
                  </li>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:phone-arrow-up-right' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        PHONE
                      </div>
                      <a
                        href={`tel:${
                          investorProfileLoc?.mobile || user?.mobile
                        }`}
                        className='text-base text-slate-600 dark:text-slate-50'
                      >
                        {investorProfileLoc?.mobile ||
                          user?.mobile ||
                          'Not provided'}
                      </a>
                    </div>
                  </li>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:briefcase' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        INVESTOR TYPE
                      </div>
                      <div className='text-base text-slate-600 dark:text-slate-50'>
                        {investorProfileLoc?.typeof ||
                          investorSignup?.typeof ||
                          'Not provided'}
                      </div>
                    </div>
                  </li>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:credit-card' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        CHEQUE SIZE
                      </div>
                      <div className='text-base text-slate-600 dark:text-slate-50'>
                        {investorProfileLoc?.cheque_size ||
                          investorSignup?.cheque_size ||
                          'Not provided'}
                      </div>
                    </div>
                  </li>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:chart-bar' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        SECTORS
                      </div>
                      <div className='text-base text-slate-600 dark:text-slate-50'>
                        {renderedSectors || 'Not provided'}
                      </div>
                    </div>
                  </li>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:calendar' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        INVESTMENT STAGE
                      </div>
                      <div className='text-base text-slate-600 dark:text-slate-50'>
                        {investorProfileLoc?.investment_stage ||
                          investorSignup?.investment_stage ||
                          'Not provided'}
                      </div>
                    </div>
                  </li>
                  <li className='flex space-x-3 rtl:space-x-reverse'>
                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                      <Icon icon='heroicons:document-text' />
                    </div>
                    <div className='flex-1'>
                      <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        INVESTMENT THESIS
                      </div>
                      <div className='text-base text-slate-600 dark:text-slate-50'>
                        {investorProfileLoc?.investment_thesis ||
                          investorSignup?.investment_thesis ||
                          'Not provided'}
                      </div>
                    </div>
                  </li>
                </ul>
                <Button
                  onClick={() => setEditingSection('investor_details')}
                  className='absolute right-4 top-16 h-8 w-auto text-white bg-[rgb(30,41,59)] rounded-md shadow-md flex items-center justify-center px-3'
                >
                  <Icon icon='heroicons:pencil-square' className='mr-1' /> Edit
                </Button>
              </Card>
            </div>
          )}
        {editingSection === 'investor_details' && (
          <div className='relative lg:col-span-6 col-span-12'>
            <Card title='Edit Investor Details'>
              <form
                onSubmit={handleSubmit((data) =>
                  handleSave(data, 'investor_details')
                )}
              >
                <div className='space-y-4'>
                  <div className='mb-4'>
                    <div className='mb-4'>
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:user'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Name
                      </label>
                      <Textinput
                        name='name'
                        defaultValue={investorProfileLoc?.name || user?.name}
                        register={register}
                      />
                    </div>
                    <div className='mb-4'>
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:user'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Company Name
                      </label>
                      <Textinput
                        name='companyname'
                        defaultValue={
                          investorProfileLoc?.company_name || user?.company_name
                        }
                        register={register}
                      />
                    </div>
                    <div className='mb-4'>
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:envelope'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Email
                      </label>
                      <Textinput
                        name='email'
                        defaultValue={investorProfileLoc?.email || user?.email}
                        register={register}
                      />
                    </div>
                    <div className='mb-4'>
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:phone-arrow-up-right'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Phone
                      </label>
                      <Textinput
                        name='mobile'
                        defaultValue={
                          investorProfileLoc?.mobile || user?.mobile
                        }
                        register={register}
                      />
                    </div>
                    <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                      <Icon
                        icon='heroicons:briefcase'
                        className='inline-block mr-1 text-xl mb-2'
                      />
                      Investor Type
                    </label>
                    <CustomSelect
                      name='usertype'
                      options={[
                        { value: 'VC', label: 'VC' },
                        { value: 'Angel Fund', label: 'Angel Fund' },
                        { value: 'Angel Investor', label: 'Angel Investor' },
                        { value: 'Syndicate', label: 'Syndicate' },
                      ]}
                      defaultValue={investorSignup?.typeof}
                      register={register}
                    />
                  </div>
                  <div className='mb-4'>
                    <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                      <Icon
                        icon='heroicons:credit-card'
                        className='inline-block mr-1 text-xl mb-2'
                      />
                      Cheque Size
                    </label>
                    <Textinput
                      name='chequeSize'
                      defaultValue={investorSignup?.cheque_size}
                      register={register}
                    />
                  </div>
                  <div className='mb-4'>
                    <div>
                      <label
                        className='form-label block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'
                        htmlFor='sectors'
                      >
                        <Icon
                          icon='heroicons:chart-bar'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Sectors
                      </label>
                      <Controller
                        name='sectors'
                        control={control}
                        defaultValue={defaultSectors} // Ensure default value is an empty array for a multi-select
                        render={({ field }) => {
                          return (
                            <ReactSelect
                              {...field}
                              isMulti
                              isClearable={false}
                              closeMenuOnSelect={false}
                              components={animatedComponents}
                              options={sectorOptions}
                              className='react-select'
                              value={
                                field.value?.map((value) =>
                                  sectorOptions.find(
                                    (option) => option.value === value
                                  )
                                ) || []
                              }
                              onChange={(selected) =>
                                field.onChange(
                                  selected.map((option) => option.value)
                                )
                              }
                            />
                          );
                        }}
                      />
                      {errors.sectors && (
                        <p className='text-red-500 text-xs italic'>
                          {errors.sectors.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className='form-label' htmlFor='investmentStage'>
                      Stage you invest in
                    </label>
                    <Controller
                      name='investmentStage'
                      control={control}
                      defaultValue={defaultInvestmentStages} // Ensure default value is an empty array for a multi-select
                      render={({ field }) => {
                        const investmentStageOptions = [
                          { value: 'Pre Seed', label: 'Pre Seed' },
                          { value: 'Seed', label: 'Seed' },
                          { value: 'Pre-Series', label: 'Pre-Series' },
                          { value: 'Series A', label: 'Series A' },
                          { value: 'Series B', label: 'Series B' },
                          {
                            value: 'Series C & Beyond',
                            label: 'Series C & Beyond',
                          },
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
                              field.onChange(
                                selected.map((option) => option.value)
                              )
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
                  <div className='mb-4'>
                    <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                      <Icon
                        icon='heroicons:document-text'
                        className='inline-block mr-1 text-xl mb-2'
                      />
                      Investment Thesis
                    </label>
                    <Textarea
                      name='investmentThesis'
                      defaultValue={investorSignup?.investment_thesis}
                      register={register}
                    />
                  </div>
                  <div className='mb-4'>
                    <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                      <Icon
                        icon='heroicons:document-text'
                        className='inline-block mr-1 text-xl mb-2'
                      />
                      Profile Photo
                    </label>
                    <InputGroup
                      type='file'
                      name='profilePhoto'
                      error={errors.profilePhoto}
                      register={register}
                      className='upload-animation'
                    />
                  </div>
                </div>
                <div className='flex mt-4'>
                  <Button text='Save' type='submit' className='btn-dark mr-4' />
                  <Button
                    text='Cancel'
                    onClick={() => setEditingSection(null)}
                    className='btn-light'
                  />
                </div>
              </form>
            </Card>
          </div>
        )}

        {user?.user_type === 'startup' && (
          <VerticalNavTabs
            editingSection={editingSection}
            setEditingSection={setEditingSection}
            handleSave={handleSave}
            register={register}
            handleSubmit={handleSubmit}
          />
        )}
      </>
    </div>
  );
};

export default Profile;
