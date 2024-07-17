'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import useUserDetails from '@/hooks/useUserDetails';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import CustomSelect from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Loading from '@/components/Loading';

import VerticalNavTabs from '@/components/profileSideBar';
import {
  updateStartupDetails,
  updateFounderInfo,
  updateBusinessDetails,
  updateFundingInfo,
  updateInvestorDetails,
  updateProfile,
} from '@/lib/actions/insertformdetails';
import FormCompletionBanner from '@/components/FormCompletionBanner'; // Import the new banner component

const Profile = () => {
  const { user, details, loading, updateUserLocally, updateDetailsLocally } =
    useUserDetails();
  const [editingSection, setEditingSection] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const handleSave = async (data, section) => {
    try {
      let result;
      switch (section) {
        case 'general_info':
          result = await updateProfile(user.id, data);
          updateUserLocally(data);
          break;
        case 'startup_details':
          result = await updateStartupDetails(details.profile_id, data);
          break;
        case 'founder_info':
          result = await updateFounderInfo(details.id, data);
          break;
        case 'business_details':
          result = await updateBusinessDetails(details.id, data);
          break;
        case 'funding_info':
          result = await updateFundingInfo(details.id, data);
          break;
        case 'investor_details':
          result = await updateInvestorDetails(user.id, data);
          updateDetailsLocally(data);
          break;
        default:
          console.error('Unknown section:', section);
          return;
      }

      reset();
      setEditingSection(null);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
    <div className='space-y-5 profile-page'>
      <FormCompletionBanner profileId={details?.profile_id} />{' '}
      {/* Add the banner component */}
      <>
        <div className='profiel-wrap px-[35px] pb-10 md:pt-[84px] pt-10 rounded-lg bg-white dark:bg-slate-800 lg:flex lg:space-y-0 space-y-6 justify-between items-end relative z-[1]'>
          <div className='bg-slate-900 dark:bg-slate-700 absolute left-0 top-0 md:h-1/2 h-[150px] w-full z-[-1] rounded-t-lg'></div>
          <div className='profile-box flex-none md:text-start text-center'>
            <div className='md:flex items-end md:space-x-6 rtl:space-x-reverse'>
              <div className='flex-none'>
                <div className='md:h-[186px] md:w-[186px] h-[140px] w-[140px] md:ml-0 md:mr-0 ml-auto mr-auto md:mb-0 mb-4 rounded-full ring-4 ring-slate-100 relative'>
                  {details?.type === 'startup' ? (
                    <div>
                      {details?.company_logo ? (
                        <img
                          src={details.company_logo}
                          alt='Company Logo'
                          className='w-full h-full object-cover rounded-full'
                        />
                      ) : (
                        <img
                          src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                          alt=''
                          className='w-full h-full object-cover rounded-full'
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      {details?.profile_photo ? (
                        <img
                          src={details.profile_photo}
                          alt='Company Logo'
                          className='w-full h-full object-cover rounded-full'
                        />
                      ) : (
                        <img
                          src='assets/images/all-img/istockphoto-907865186-612x612.jpg'
                          alt=''
                          className='w-full h-full object-cover rounded-full'
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className='flex-1'>
                {details?.type === 'investor' ? (
                  <div className='text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[3px]'>
                    {user?.name || 'User Name'}
                  </div>
                ) : (
                  <div className='text-2xl font-medium text-slate-900 dark:text-slate-200 mb-[3px]'>
                    {user?.company_name || 'User Name'}
                  </div>
                )}
                {details?.type === 'investor' && (
                  <div className='text-sm font-light text-slate-600 dark:text-slate-400'>
                    {details?.typeof || 'IX'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='grid grid-cols-12 gap-6'>
          {user?.user_type === 'investor' && (
            <>
              {editingSection !== 'general_info' && (
                <div className='relative lg:col-span-6 col-span-12'>
                  <Card title='User Info'>
                    <ul className='list space-y-8'>
                      <li className='flex space-x-3 rtl:space-x-reverse'>
                        <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                          <Icon icon='heroicons:envelope' />
                        </div>
                        <div className='flex-1'>
                          <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                            EMAIL
                          </div>
                          <a
                            href={`mailto:${user?.email}`}
                            className='text-base text-slate-600 dark:text-slate-50'
                          >
                            {user?.email}
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
                            href={`tel:${user?.mobile}`}
                            className='text-base text-slate-600 dark:text-slate-50'
                          >
                            {user?.mobile}
                          </a>
                        </div>
                      </li>
                    </ul>
                    <Button
                      onClick={() => setEditingSection('general_info')}
                      className='absolute right-4 top-16 h-8 w-auto text-white bg-[rgb(30,41,59)] rounded-md shadow-md flex items-center justify-center px-3'
                    >
                      <Icon icon='heroicons:pencil-square' className='mr-1' />{' '}
                      Edit
                    </Button>
                  </Card>
                </div>
              )}
              {editingSection === 'general_info' && (
                <div className='relative lg:col-span-6 col-span-12'>
                  <Card title='Edit User Info'>
                    <form
                      onSubmit={handleSubmit((data) =>
                        handleSave(data, 'general_info')
                      )}
                    >
                      <div className='space-y-4'>
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
                            defaultValue={user?.email}
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
                            defaultValue={user?.mobile}
                            register={register}
                          />
                        </div>
                      </div>
                      <div className='flex mt-4'>
                        <Button
                          text='Save'
                          type='submit'
                          className='btn-dark mr-4'
                        />
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
            </>
          )}
          {user?.user_type === 'investor' &&
            editingSection !== 'investor_details' && (
              <div className='relative lg:col-span-6 col-span-12'>
                <Card title='Investor Details'>
                  <ul className='list space-y-8'>
                    <li className='flex space-x-3 rtl:space-x-reverse'>
                      <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                        <Icon icon='heroicons:briefcase' />
                      </div>
                      <div className='flex-1'>
                        <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                          INVESTOR TYPE
                        </div>
                        <div className='text-base text-slate-600 dark:text-slate-50'>
                          {details.typeof}
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
                          {details.cheque_size}
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
                          {Array.isArray(details.sectors)
                            ? details.sectors.join(', ')
                            : details.sectors}
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
                          {details.investment_stage}
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
                          {details.investment_thesis}
                        </div>
                      </div>
                    </li>
                  </ul>
                  <Button
                    onClick={() => setEditingSection('investor_details')}
                    className='absolute right-4 top-16 h-8 w-auto text-white bg-[rgb(30,41,59)] rounded-md shadow-md flex items-center justify-center px-3'
                  >
                    <Icon icon='heroicons:pencil-square' className='mr-1' />{' '}
                    Edit
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
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:briefcase'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Investor Type
                      </label>
                      <Select
                        name='typeof'
                        options={[
                          { value: 'VC', label: 'VC' },
                          { value: 'Angel Fund', label: 'Angel Fund' },
                          {
                            value: 'Angel Investor',
                            label: 'Angel Investor',
                          },
                          { value: 'Syndicate', label: 'Syndicate' },
                        ]}
                        defaultValue={details.typeof}
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
                        name='cheque_size'
                        defaultValue={details.cheque_size}
                        register={register}
                      />
                    </div>
                    <div className='mb-4'>
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:chart-bar'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Sectors
                      </label>
                      <Textarea
                        name='sectors'
                        defaultValue={
                          Array.isArray(details.sectors)
                            ? details.sectors.join(', ')
                            : details.sectors
                        }
                        register={register}
                      />
                    </div>
                    <div className='mb-4'>
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:calendar'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        Investment Stage
                      </label>
                      <CustomSelect
                        name='investment_stage'
                        options={[
                          { value: 'Pre Seed', label: 'Pre Seed' },
                          { value: 'Seed', label: 'Seed' },
                          { value: 'Pre-Series', label: 'Pre-Series' },
                          { value: 'Series A', label: 'Series A' },
                          { value: 'Series B', label: 'Series B' },
                          {
                            value: 'Series C & Beyond',
                            label: 'Series C & Beyond',
                          },
                        ]}
                        defaultValue={details.investment_stage}
                        register={register}
                      />
                    </div>
                    <div className='mb-4'>
                      <label className='block uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                        <Icon
                          icon='heroicons:document-text'
                          className='inline-block mr-1 text-xl mb-2'
                        />
                        INVESTMENT THESIS
                      </label>
                      <Textarea
                        name='investment_thesis'
                        defaultValue={details.investment_thesis}
                        register={register}
                      />
                    </div>
                  </div>
                  <div className='flex mt-4'>
                    <Button
                      text='Save'
                      type='submit'
                      className='btn-dark mr-4'
                    />
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
        </div>
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
      {/* <div>
          <Modal
            activeModal={isModalActive}
            onClose={handleClose}
            centered
            title='Your Profile is Incomplete'
          >
            <div className='flex flex-col justify-center'>
              <h4 className='font-medium text-lg text-center mb-3 text-slate-900'>
                Update your Profile
              </h4>

              <Button
                className='max-w-20 ml-auto mr-auto h-8 w-auto text-white bg-[rgb(30,41,59)] rounded-md shadow-md flex items-center justify-center px-3'
                onClick={handleClick}
              >
                Update
              </Button>
            </div>
          </Modal>
        </div> */}
    </div>
  );
};

export default Profile;
