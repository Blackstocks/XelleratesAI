import React, { Fragment, useState } from 'react';
import { Tab } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/components/Loading';
import { updateFile } from '@/lib/actions/insertformdetails';

import Fileinput from '@/components/ui/Fileinput';
import {
  updateGeneralInfo,
  updateStartupDetails,
  updateFounderInfo,
  updateBusinessDetails,
  updateFundingInfo,
} from '@/lib/actions/insertformdetails';

const sections = [
  {
    title: 'General Info',
    icon: 'heroicons-outline:home',
    key: 'general_info',
  },
  {
    title: 'Startup Profile',
    icon: 'heroicons-outline:office-building',
    key: 'startup_details',
  },
  {
    title: 'Founder Information',
    icon: 'heroicons-outline:user',
    key: 'founder_info',
  },
  {
    title: 'Business Details',
    icon: 'heroicons-outline:briefcase',
    key: 'business_details',
  },
  {
    title: 'Funding Information',
    icon: 'heroicons-outline:cash',
    key: 'funding_info',
  },
];

const fileFields = [
  {
    name: 'certificate_of_incorporation',
    label: 'Certificate of Incorporation',
  },
  { name: 'gst_certificate', label: 'GST Certificate' },
  { name: 'startup_india_certificate', label: 'Startup India Certificate' },
  { name: 'due_diligence_report', label: 'Due Diligence Report' },
  { name: 'business_valuation_report', label: 'Business Valuation Report' },
  { name: 'mis', label: 'MIS' },
  { name: 'pitch_deck', label: 'Pitch Deck' },
  { name: 'video_pitch', label: 'Video Pitch' },
];

const VerticalNavTabs = () => {
  const { control, register, handleSubmit } = useForm();
  const { user, details, loading, updateDetailsLocally, updateUserLocally } =
    useUserDetails();
  const [editingSection, setEditingSection] = useState(null);

  const handleSave = async (data, section) => {
    try {
      console.log('Saving data for section:', section, 'with data:', data);
      let updatedData;
      let changedData = {};
      const uploadedFiles = {};

      switch (section) {
        case 'general_info':
          changedData = { email: data.email, mobile: data.mobile };
          const generalInfoResponse = await updateGeneralInfo(
            user.id,
            changedData
          );
          if (generalInfoResponse.error) throw generalInfoResponse.error;
          updatedData = generalInfoResponse.data;
          updateUserLocally(updatedData);
          break;

        case 'startup_details':
          changedData = {
            company_name: data.company_name,
            incorporation_date: data.incorporation_date,
            country: data.country,
            state_city: data.state_city,
            office_address: data.office_address,
            company_website: data.company_website,
            linkedin_profile: data.linkedin_profile,
            short_description: data.short_description,
          };
          const startupDetailsResponse = await updateStartupDetails(
            details.profile_id,
            changedData
          );
          if (startupDetailsResponse.error) throw startupDetailsResponse.error;
          updatedData = startupDetailsResponse.data;
          updateDetailsLocally({ ...details, ...updatedData });
          break;

        case 'founder_info':
          changedData = {
            founder_name: data.founder_name,
            founder_email: data.founder_email,
            founder_mobile: data.founder_mobile,
            founder_linkedin: data.founder_linkedin,
            degree_name: data.degree_name,
            college_name: data.college_name,
            graduation_year: data.graduation_year,
          };
          const founderInfoResponse = await updateFounderInfo(
            details.id,
            changedData
          );
          if (founderInfoResponse.error) throw founderInfoResponse.error;
          updatedData = founderInfoResponse.data;
          updateDetailsLocally({ ...details, founderInformation: updatedData });
          break;

        case 'business_details':
          for (const { name } of fileFields) {
            if (data[name] && data[name][0]) {
              console.log(`Uploading file for ${name}`);
              uploadedFiles[name] = await updateFile(
                data[name][0],
                'documents',
                details.company_name,
                name
              );
              console.log(
                `Uploaded file URL for ${name}: ${uploadedFiles[name]}`
              );
              changedData[name] = uploadedFiles[name];
            } else {
              console.log(`${name} not found in data.`);
            }
          }
          changedData = {
            ...changedData,
            industry_sector: data.industry_sector,
            current_stage: data.current_stage,
            current_traction: data.current_traction,
            target_audience: data.target_audience,
            team_size: data.team_size,
            usp_moat: data.usp_moat,
          };
          const businessDetailsResponse = await updateBusinessDetails(
            details.id,
            changedData
          );
          if (businessDetailsResponse.error)
            throw businessDetailsResponse.error;
          updatedData = businessDetailsResponse.data;
          updateDetailsLocally({ ...details, businessDetails: updatedData });
          break;

        case 'funding_info':
          changedData = {
            total_funding_ask: data.total_funding_ask,
            amount_committed: data.amount_committed,
            government_grants: data.government_grants,
            equity_split: data.equity_split,
            fund_utilization: data.fund_utilization,
            arr: data.arr,
            mrr: data.mrr,
          };
          const fundingInfoResponse = await updateFundingInfo(
            details.id,
            changedData
          );
          if (fundingInfoResponse.error) throw fundingInfoResponse.error;
          updatedData = fundingInfoResponse.data;
          updateDetailsLocally({ ...details, fundingInformation: updatedData });
          break;

        default:
          return;
      }

      console.log('Final updated data:', updatedData);
      setEditingSection(null);
    } catch (error) {
      console.error('Error updating data:', error.message || error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Card>
      <Tab.Group>
        <div className='grid grid-cols-12 lg:gap-5 md:gap-5'>
          <div className='2xl:col-span-2 lg:col-span-3 lg:gap-5 md:col-span-5 col-span-12'>
            <Tab.List className='max-w-max'>
              {sections.map((item, i) => (
                <Tab key={i} as={Fragment}>
                  {({ selected }) => (
                    <div
                      className={`flex gap-2 ring-0 focus:ring-0 focus:outline-none px-4 rounded-md py-2 transition duration-150 ${
                        selected
                          ? 'text-white bg-[rgb(30,41,59)]'
                          : 'text-slate-700 bg-white dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon icon={item.icon} />
                      <button className='text-sm font-semibold md:block inline-block mb-4 last:mb-0 capitalize'>
                        {item.title}
                      </button>
                    </div>
                  )}
                </Tab>
              ))}
            </Tab.List>
          </div>
          <div className='lg:col-span-9 md:col-span-7 col-span-12'>
            <Tab.Panels>
              {sections.map((section, i) => (
                <Tab.Panel key={i}>
                  {editingSection === section.key ? (
                    <Card title={`Edit ${section.title}`}>
                      <form
                        onSubmit={handleSubmit((data) =>
                          handleSave(data, section.key)
                        )}
                      >
                        {/* Input fields specific to section */}
                        {section.key === 'general_info' && (
                          <>
                            <Textinput
                              label='Email'
                              name='email'
                              defaultValue={user?.email}
                              register={register}
                            />
                            <Textinput
                              label='Phone'
                              name='mobile'
                              defaultValue={user?.mobile}
                              register={register}
                            />
                          </>
                        )}
                        {section.key === 'startup_details' && (
                          <>
                            <Textinput
                              label='Company Name'
                              name='company_name'
                              defaultValue={details?.company_name}
                              register={register}
                            />
                            <Textinput
                              label='Incorporation Date'
                              type='date'
                              name='incorporation_date'
                              defaultValue={details?.incorporation_date}
                              register={register}
                            />
                            <Textinput
                              label='Country'
                              name='country'
                              defaultValue={details?.country}
                              register={register}
                            />
                            <Textinput
                              label='State/City'
                              name='state_city'
                              defaultValue={details?.state_city}
                              register={register}
                            />
                            <Textinput
                              label='Office Address'
                              name='office_address'
                              defaultValue={details?.office_address}
                              register={register}
                            />
                            <Textinput
                              label='Company Website'
                              name='company_website'
                              defaultValue={details?.company_website}
                              register={register}
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='linkedin_profile'
                              defaultValue={details?.linkedin_profile}
                              register={register}
                            />
                            <Textarea
                              label='Business Description'
                              name='short_description'
                              defaultValue={details?.short_description}
                              register={register}
                            />
                          </>
                        )}
                        {section.key === 'founder_info' && (
                          <>
                            <Textinput
                              label='Founder Name'
                              name='founder_name'
                              defaultValue={
                                details?.founderInformation?.founder_name
                              }
                              register={register}
                            />
                            <Textinput
                              label='Email'
                              name='founder_email'
                              defaultValue={
                                details?.founderInformation?.founder_email
                              }
                              register={register}
                            />
                            <Textinput
                              label='Mobile Number'
                              name='founder_mobile'
                              defaultValue={
                                details?.founderInformation?.founder_mobile
                              }
                              register={register}
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='founder_linkedin'
                              defaultValue={
                                details?.founderInformation?.founder_linkedin
                              }
                              register={register}
                            />
                            <Textinput
                              label='Degree Name'
                              name='degree_name'
                              defaultValue={
                                details?.founderInformation?.degree_name
                              }
                              register={register}
                            />
                            <Textinput
                              label='College Name'
                              name='college_name'
                              defaultValue={
                                details?.founderInformation?.college_name
                              }
                              register={register}
                            />
                            <Textinput
                              label='Year of Graduation'
                              type='date'
                              name='graduation_year'
                              defaultValue={
                                details?.founderInformation?.graduation_year
                              }
                              register={register}
                            />
                          </>
                        )}
                        {section.key === 'business_details' && (
                          <>
                            <Textinput
                              label='Industry or Sector'
                              name='industry_sector'
                              defaultValue={
                                details?.businessDetails?.industry_sector
                              }
                              register={register}
                            />
                            <Textinput
                              label='Current Stage'
                              name='current_stage'
                              defaultValue={
                                details?.businessDetails?.current_stage
                              }
                              register={register}
                            />
                            <Textinput
                              label='Current Traction'
                              name='current_traction'
                              defaultValue={
                                details?.businessDetails?.current_traction
                              }
                              register={register}
                            />
                            <Textinput
                              label='Target Audience'
                              name='target_audience'
                              defaultValue={
                                details?.businessDetails?.target_audience
                              }
                              register={register}
                            />
                            <Textinput
                              label='Team Size'
                              type='number'
                              name='team_size'
                              defaultValue={details?.businessDetails?.team_size}
                              register={register}
                            />
                            <Textarea
                              label='USP/MOAT'
                              name='usp_moat'
                              defaultValue={details?.businessDetails?.usp_moat}
                              register={register}
                            />

                            {fileFields.map(({ name, label }) => (
                              <Controller
                                key={name}
                                name={name}
                                control={control}
                                defaultValue={details?.businessDetails?.[name]}
                                render={({ field: { onChange, value } }) => (
                                  <Fileinput
                                    name={name}
                                    selectedFile={value}
                                    onChange={(e) =>
                                      onChange(e.target.files[0])
                                    }
                                    label={label}
                                  />
                                )}
                              />
                            ))}
                          </>
                        )}
                        {section.key === 'funding_info' && (
                          <>
                            <Textinput
                              label='Total Funding Ask'
                              name='total_funding_ask'
                              defaultValue={
                                details?.fundingInformation?.total_funding_ask
                              }
                              register={register}
                            />
                            <Textinput
                              label='Amount Committed'
                              name='amount_committed'
                              defaultValue={
                                details?.fundingInformation?.amount_committed
                              }
                              register={register}
                            />
                            <Textinput
                              label='Government Grants'
                              name='government_grants'
                              defaultValue={
                                details?.fundingInformation?.government_grants
                              }
                              register={register}
                            />
                            <Textinput
                              label='Equity Split'
                              name='equity_split'
                              defaultValue={
                                details?.fundingInformation?.equity_split
                              }
                              register={register}
                            />
                            <Textarea
                              label='Fund Utilization'
                              name='fund_utilization'
                              defaultValue={
                                details?.fundingInformation?.fund_utilization
                              }
                              register={register}
                            />
                            <Textinput
                              label='ARR'
                              name='arr'
                              defaultValue={details?.fundingInformation?.arr}
                              register={register}
                            />
                            <Textinput
                              label='MRR'
                              name='mrr'
                              defaultValue={details?.fundingInformation?.mrr}
                              register={register}
                            />
                          </>
                        )}
                        <div className='flex lg:mt-4 mt-2'>
                          <Button
                            text='Save'
                            type='submit'
                            className='btn-dark lg:mr-4 mr-2'
                          />
                          <Button
                            text='Cancel'
                            onClick={() => setEditingSection(null)}
                            className='btn-light'
                          />
                        </div>
                      </form>
                    </Card>
                  ) : (
                    <Card title={section.title}>
                      <div className='relative'>
                        <ul className='list space-y-8'>
                          {section.key === 'general_info' && (
                            <>
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
                            </>
                          )}
                          {section.key === 'startup_details' && (
                            <>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:building-storefront' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    COMPANY NAME
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.company_name}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:calendar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    INCORPORATION DATE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.incorporation_date}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:map' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    LOCATION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.country}, {details?.state_city}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:building-office' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    OFFICE ADDRESS
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.office_address}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:globe-alt' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    COMPANY WEBSITE
                                  </div>
                                  <a
                                    href={details?.company_website}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {details?.company_website}
                                  </a>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:globe-alt' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    LinkedIn Profile
                                  </div>
                                  <a
                                    href={details?.linkedin_profile}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {details?.linkedin_profile}
                                  </a>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:briefcase' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    BUSINESS DESCRIPTION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.short_description}
                                  </div>
                                </div>
                              </li>
                            </>
                          )}
                          {section.key === 'founder_info' && (
                            <>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:user' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    FOUNDER NAME
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.founderInformation?.founder_name}
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
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.founderInformation?.founder_email}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:phone' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    MOBILE NUMBER
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.founderInformation
                                        ?.founder_mobile
                                    }
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:globe-alt' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    LINKEDIN PROFILE
                                  </div>
                                  <a
                                    href={
                                      details?.founderInformation
                                        ?.founder_linkedin
                                    }
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {
                                      details?.founderInformation
                                        ?.founder_linkedin
                                    }
                                  </a>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:academic-cap' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    DEGREE NAME
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.founderInformation?.degree_name}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:building-library' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    COLLEGE NAME
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.founderInformation?.college_name}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:calendar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    YEAR OF GRADUATION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.founderInformation
                                        ?.graduation_year
                                    }
                                  </div>
                                </div>
                              </li>
                            </>
                          )}
                          {section.key === 'business_details' && (
                            <>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:briefcase' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    INDUSTRY OR SECTOR
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.businessDetails?.industry_sector}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:chart-bar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CURRENT STAGE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.businessDetails?.current_stage}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:users' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TEAM SIZE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.businessDetails?.team_size}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:flag' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TARGET AUDIENCE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.businessDetails?.target_audience}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:light-bulb' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    USP/MOAT
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.businessDetails?.usp_moat}
                                  </div>
                                </div>
                              </li>
                              {details?.businessDetails
                                ?.certificate_of_incorporation && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      Certificate of Incorporation
                                    </div>
                                    <a
                                      href={
                                        details.businessDetails
                                          .certificate_of_incorporation
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Certificate
                                    </a>
                                  </div>
                                </li>
                              )}

                              {details?.businessDetails?.gst_certificate && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      GST Certificate
                                    </div>
                                    <a
                                      href={
                                        details.businessDetails.gst_certificate
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View GST Certificate
                                    </a>
                                  </div>
                                </li>
                              )}

                              {details?.businessDetails
                                ?.startup_india_certificate && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      Startup India Certificate
                                    </div>
                                    <a
                                      href={
                                        details.businessDetails
                                          .startup_india_certificate
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Startup India Certificate
                                    </a>
                                  </div>
                                </li>
                              )}

                              {details?.businessDetails
                                ?.due_diligence_report && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      Due Diligence Report
                                    </div>
                                    <a
                                      href={
                                        details.businessDetails
                                          .due_diligence_report
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Due Diligence Report
                                    </a>
                                  </div>
                                </li>
                              )}

                              {details?.businessDetails
                                ?.business_valuation_report && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      Business Valuation Report
                                    </div>
                                    <a
                                      href={
                                        details.businessDetails
                                          .business_valuation_report
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Business Valuation Report
                                    </a>
                                  </div>
                                </li>
                              )}

                              {details?.businessDetails?.mis && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      MIS
                                    </div>
                                    <a
                                      href={details.businessDetails.mis}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View MIS
                                    </a>
                                  </div>
                                </li>
                              )}

                              {details?.businessDetails?.pitch_deck && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      Pitch Deck
                                    </div>
                                    <a
                                      href={details.businessDetails.pitch_deck}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Pitch Deck
                                    </a>
                                  </div>
                                </li>
                              )}

                              {details?.businessDetails?.video_pitch && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      Video Pitch
                                    </div>
                                    <a
                                      href={details.businessDetails.video_pitch}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Video Pitch
                                    </a>
                                  </div>
                                </li>
                              )}
                            </>
                          )}
                          {section.key === 'funding_info' && (
                            <>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:currency-dollar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TOTAL FUNDING ASK
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.fundingInformation
                                        ?.total_funding_ask
                                    }
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:banknotes' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    AMOUNT COMMITTED
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.fundingInformation
                                        ?.amount_committed
                                    }
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:clipboard-document-check' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    GOVERNMENT GRANTS
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.fundingInformation
                                        ?.government_grants
                                    }
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:chart-pie' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    EQUITY SPLIT
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.fundingInformation?.equity_split}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document-text' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    FUND UTILIZATION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.fundingInformation
                                        ?.fund_utilization
                                    }
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:chart-bar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    ARR
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.fundingInformation?.arr}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:chart-bar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    MRR
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.fundingInformation?.mrr}
                                  </div>
                                </div>
                              </li>
                              {details?.fundingInformation
                                ?.current_cap_table && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      Cap Table
                                    </div>
                                    <a
                                      href={
                                        details?.fundingInformation
                                          ?.current_cap_table
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Certificate
                                    </a>
                                  </div>
                                </li>
                              )}
                            </>
                          )}
                        </ul>
                        <Button
                          onClick={() => setEditingSection(section.key)}
                          className='absolute right-4 top-4 h-8 w-auto text-white bg-[rgb(30,41,59)] rounded-md shadow-md flex items-center justify-center px-3'
                        >
                          <Icon
                            icon='heroicons:pencil-square'
                            className='mr-1'
                          />{' '}
                          Edit
                        </Button>
                      </div>
                    </Card>
                  )}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </div>
      </Tab.Group>
    </Card>
  );
};

export default VerticalNavTabs;
