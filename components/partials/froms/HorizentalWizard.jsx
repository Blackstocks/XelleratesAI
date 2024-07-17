'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Textinput from '@/components/ui/Textinput';
import InputGroup from '@/components/ui/InputGroup';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  handleFileUpload,
  insertCompanyProfile,
  insertBusinessDetails,
  insertFundingInformation,
  insertContactInformation,
  insertFounderInformation,
  insertCofounderInformation,
  insertCTODetails,
  insertCompanyDocuments,
} from '@/lib/actions/insertformdetails';
import {
  contactSchema,
  ctoschema,
  profileSchema,
  founderAndEducationSchema,
  cofounderSchema,
  businessSchema,
  fundingSchema,
  companyDocumentsSchema,
} from '@/lib/schema/startup-form';
import CustomSelect from '@/components/ui/Select';

const steps = [
  { id: 1, title: 'Contact Information' },
  { id: 2, title: 'Company Profile' },
  { id: 3, title: 'Founder and Education Information' },
  { id: 4, title: 'Technical Details' },
  { id: 5, title: 'Business Details' },
  { id: 6, title: 'Company Documents' },
  { id: 7, title: 'Funding Information' },
];

const FormWizard = () => {
  const [stepNumber, setStepNumber] = useState(0);
  const [stepsWithCofounder, setStepsWithCofounder] = useState(steps);
  const [hasCofounder, setHasCofounder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profile_id'); // Get profile_id from URL query
  const router = useRouter();

  useEffect(() => {
    if (!profileId) {
      router.push('/'); // Redirect if profileId is not available
    }
  }, [profileId, router]);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: yupResolver(
      stepNumber === (hasCofounder ? 5 : 4)
        ? businessSchema
        : stepNumber === (hasCofounder ? 6 : 5)
        ? companyDocumentsSchema
        : stepNumber === (hasCofounder ? 7 : 6)
        ? fundingSchema
        : stepNumber === (hasCofounder ? 4 : 3)
        ? ctoschema
        : stepNumber === 3 && hasCofounder
        ? cofounderSchema
        : stepNumber === 2
        ? founderAndEducationSchema
        : stepNumber === 1
        ? profileSchema
        : contactSchema
    ),
    mode: 'all',
  });

  const cofounderName = watch('cofounderName');

  const onSubmit = async (data) => {
    if (!profileId) {
      console.error('Profile ID is missing');
      return;
    }
    const formData = { ...data, profile_id: profileId };

    const isCofounderStep = hasCofounder && stepNumber === 3;
    const isLastStep = stepNumber === stepsWithCofounder.length - 1;

    if (isLastStep) {
      setIsLoading(true);
      try {
        const uploadedFiles = {};
        const fileFields = {
          companyLogo: 'logo',
          certificateOfIncorporation: 'certificate_of_incorporation',
          gstCertificate: 'gst_certificate',
          startupIndiaCertificate: 'startup_india_certificate',
          dueDiligenceReport: 'due_diligence_report',
          businessValuationReport: 'business_valuation_report',
          mis: 'mis',
          pitchDeck: 'pitch_deck',
          videoPitch: 'video_pitch',
          currentCapTable: 'current_cap_table',
          technologyRoadmap: 'technology_roadmap',
          listofAdvisers: 'list_of_advisers',
          trademark: 'trademark',
          copyright: 'copyright',
          patent: 'patent',
          financialProjections: 'financial_projections',
          balanceSheet: 'balance_sheet',
          plStatement: 'pl_statement',
          cashflowStatement: 'cashflow_statement',
          sha: 'sha',
          termsheet: 'termsheet',
          employmentAgreement: 'employment_agreement',
          mou: 'mou',
          nda: 'nda',
        };

        for (const field in fileFields) {
          if (data[field] && data[field][0]) {
            uploadedFiles[field] = await handleFileUpload(
              data[field][0],
              'documents',
              data.companyName,
              fileFields[field]
            );
            console.log(
              `${field} uploaded successfully: ${uploadedFiles[field]}`
            );
          }
        }

        const companyId = await insertCompanyProfile(formData, uploadedFiles);
        await insertBusinessDetails(companyId, formData, uploadedFiles);
        await insertFundingInformation(companyId, formData, uploadedFiles);
        await insertContactInformation(companyId, formData);
        await insertFounderInformation(companyId, formData, uploadedFiles);
        await insertCompanyDocuments(companyId, formData, uploadedFiles);
        await insertCTODetails(companyId, formData, uploadedFiles);

        if (hasCofounder) {
          await insertCofounderInformation(companyId, formData);
        }

        console.log('Data saved successfully');
        router.push('/profile');
      } catch (error) {
        console.error('Error saving data:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setStepNumber(stepNumber + 1);
    }
  };

  useEffect(() => {
    if (cofounderName && cofounderName.length > 0 && !hasCofounder) {
      setStepsWithCofounder([
        ...steps.slice(0, 3),
        { id: 4, title: 'Co-Founder Information' },
        ...steps.slice(3),
      ]);
      setHasCofounder(true);
    } else if (!cofounderName && hasCofounder) {
      setStepsWithCofounder(steps);
      setHasCofounder(false);
    }
  }, [cofounderName, hasCofounder]);

  const handlePrev = () => {
    setStepNumber(stepNumber - 1);
  };

  return (
    <div>
      <Card title='Startup Registration'>
        <div>
          <div className='flex z-[5] items-center relative justify-center md:mx-8'>
            {stepsWithCofounder.map((item, i) => (
              <div
                className='relative z-[1] items-center item flex flex-start flex-1 last:flex-none group'
                key={i}
              >
                <div
                  className={`${
                    stepNumber >= i
                      ? 'bg-slate-900 text-white ring-slate-900 ring-offset-2 dark:ring-offset-slate-500 dark:bg-slate-900 dark:ring-slate-900'
                      : 'bg-white ring-slate-900 ring-opacity-70 text-slate-900 dark:text-slate-300 dark:bg-slate-600 dark:ring-slate-600 text-opacity-70'
                  } transition duration-150 icon-box md:h-12 md:w-12 h-7 w-7 rounded-full flex flex-col items-center justify-center relative z-[66] ring-1 md:text-lg text-base font-medium`}
                >
                  {stepNumber <= i ? (
                    <span> {i + 1}</span>
                  ) : (
                    <span className='text-3xl'>
                      <Icon icon='bx:check-double' />
                    </span>
                  )}
                </div>

                <div
                  className={`${
                    stepNumber >= i
                      ? 'bg-slate-900 dark:bg-slate-900'
                      : 'bg-[#E0EAFF] dark:bg-slate-700'
                  } absolute top-1/2 h-[2px] w-full`}
                ></div>
                <div
                  className={`${
                    stepNumber >= i
                      ? 'text-slate-900 dark:text-slate-300'
                      : 'text-slate-500 dark:text-slate-300 dark:text-opacity-40'
                  } absolute top-full text-base md:leading-6 mt-3 transition duration-150 md:opacity-100 opacity-0 group-hover:opacity-100`}
                >
                  <span className='w-max'>{item.title}</span>
                </div>
              </div>
            ))}
          </div>

          <div className='content-box'>
            <form onSubmit={handleSubmit(onSubmit)}>
              {stepNumber === 0 && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Your Contact Information
                      </h4>
                    </div>
                    <InputGroup
                      label='Mobile Number'
                      type='text'
                      prepend='+'
                      placeholder='Mobile Number'
                      name='mobile'
                      error={errors.mobile}
                      register={register}
                    />
                    <Textarea
                      label='Business Description'
                      placeholder='Describe your business'
                      name='businessDescription'
                      error={errors.businessDescription}
                      register={register}
                    />
                  </div>
                </div>
              )}

              {stepNumber === 1 && (
                <div className='pt-10'>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h1 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Your Company Profile
                      </h1>
                    </div>
                    <Textinput
                      label='Company Name'
                      type='text'
                      placeholder='Company Name'
                      name='companyName'
                      error={errors.companyName}
                      register={register}
                    />
                    <Textarea
                      label='Short Description'
                      placeholder='Elevator Pitch'
                      name='shortDescription'
                      error={errors.shortDescription}
                      register={register}
                    />
                    <Textinput
                      label='Date of Incorporation'
                      type='date'
                      placeholder='Date of Incorporation'
                      name='incorporationDate'
                      error={errors.incDate}
                      register={register}
                    />
                    <Textinput
                      label='Country'
                      type='text'
                      placeholder='Country'
                      name='country'
                      error={errors.country}
                      register={register}
                    />
                    <Textinput
                      label='State, City'
                      type='text'
                      placeholder='State, City'
                      name='stateCity'
                      error={errors.stateCity}
                      register={register}
                    />
                    <Textinput
                      label='Office Address'
                      type='text'
                      placeholder='Office Address'
                      name='officeAddress'
                      error={errors.officeAddress}
                      register={register}
                    />
                    <Textinput
                      label='Pin Code'
                      type='text'
                      placeholder='Pin Code'
                      name='pinCode'
                      error={errors.pinCode}
                      register={register}
                    />
                    <Textinput
                      label='Company Website'
                      type='url'
                      placeholder='https://www.example.com'
                      name='companyWebsite'
                      error={errors.companyWebsite}
                      register={register}
                    />
                    <CustomSelect
                      label='Target Audience'
                      type='text'
                      placeholder='Target Audience'
                      name='targetAudience'
                      error={errors.targetAudience}
                      options={[
                        {
                          value: 'B2C',
                          label: 'B2C',
                        },
                        {
                          value: 'B2B',
                          label: 'B2B',
                        },
                        {
                          value: 'B2B2B',
                          label: 'B2B2B',
                        },
                        {
                          value: 'D2C',
                          label: 'D2C',
                        },
                        {
                          value: 'B2G',
                          label: 'B2G',
                        },
                        {
                          value: 'B2B2C',
                          label: 'B2B2C',
                        },
                      ]}
                      register={register}
                    />
                    <CustomSelect
                      label='Industry or Sector'
                      type='text'
                      placeholder='Industry or Sector'
                      name='industrySector'
                      error={errors.industrySector}
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
                        {
                          value: 'Mining and Minerals',
                          label: 'Mining and Minerals',
                        },
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
                        {
                          value: 'Telecommunications',
                          label: 'Telecommunications',
                        },
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
                      register={register}
                    />
                    <Textinput
                      label='Team Size'
                      type='number'
                      placeholder='Team Size'
                      name='teamSize'
                      error={errors.teamSize}
                      register={register}
                    />
                    <Textinput
                      label='Current Stage'
                      type='text'
                      placeholder='Current Stage'
                      name='currentStage'
                      error={errors.currentStage}
                      register={register}
                    />
                    <Textarea
                      label='USP/MOAT'
                      placeholder='USP/MOAT'
                      name='uspMoat'
                      error={errors.uspMoat}
                      register={register}
                    />
                    <Textinput
                      label='LinkedIn Profile'
                      type='url'
                      placeholder='https://www.linkedin.com/in/example'
                      name='linkedinProfile'
                      error={errors.linkedinProfile}
                      register={register}
                    />
                    <CustomSelect
                      label='Is your startup in media? '
                      type='text'
                      placeholder='Yes/No'
                      name='media'
                      error={errors.media}
                      options={[
                        {
                          value: 'Yes',
                          label: 'Yes',
                        },
                        {
                          value: 'No',
                          label: 'No',
                        },
                      ]}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Company Logo'
                      type='file'
                      name='companyLogo'
                      error={errors.companyLogo}
                      register={register}
                    />
                  </div>
                </div>
              )}

              {stepNumber === 2 && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h1 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Founder and Educational Information
                      </h1>
                    </div>
                    <Textinput
                      label='Full Name'
                      type='text'
                      placeholder='Full Name'
                      name='founderName'
                      error={errors.founderName}
                      register={register}
                    />
                    <Textinput
                      label='Email'
                      type='email'
                      placeholder='Founders Email'
                      name='founderEmail'
                      error={errors.founderEmail}
                      register={register}
                    />
                    <Textinput
                      label='Mobile Number'
                      type='text'
                      placeholder='Mobile Number'
                      name='founderMobile'
                      error={errors.founderMobile}
                      register={register}
                    />
                    <Textinput
                      label='LinkedIn Profile'
                      type='url'
                      placeholder='https://www.linkedin.com/in/example'
                      name='founderLinkedin'
                      error={errors.founderLinkedin}
                      register={register}
                    />
                    <Textinput
                      label='Co-Founder Full Name'
                      type='text'
                      placeholder='Co-Founder Full Name'
                      name='cofounderName'
                      error={errors.cofounderName}
                      register={register}
                    />
                    <Textinput
                      label='Degree Name'
                      type='text'
                      placeholder='Degree Name'
                      name='degreeName'
                      error={errors.degreeName}
                      register={register}
                    />
                    <Textinput
                      label='College Name'
                      type='text'
                      placeholder='College Name'
                      name='collegeName'
                      error={errors.collegeName}
                      register={register}
                    />
                    <Textinput
                      label='Year of Graduation'
                      type='date'
                      placeholder='Year of Graduation'
                      name='graduationYear'
                      error={errors.graduationYear}
                      register={register}
                    />
                    <InputGroup
                      label='List of Advisers'
                      type='file'
                      name='listofAdvisers'
                      error={errors.listofAdvisers}
                      register={register}
                      className='upload-animation'
                    />
                  </div>
                </div>
              )}

              {stepNumber === 3 && hasCofounder && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Co-Founder Information
                      </h4>
                    </div>
                    <Textinput
                      label='Co-Founder Full Name'
                      type='text'
                      placeholder='Co-Founder Full Name'
                      name='cofounderName'
                      error={errors.cofounderName}
                      register={register}
                    />
                    <Textinput
                      label='Co-Founder Email'
                      type='email'
                      placeholder='Co-Founder Email'
                      name='cofounderEmail'
                      error={errors.cofounderEmail}
                      register={register}
                    />
                    <Textinput
                      label='Co-Founder Mobile Number'
                      type='text'
                      placeholder='Co-Founder Mobile Number'
                      name='cofounderMobile'
                      error={errors.cofounderMobile}
                      register={register}
                    />
                    <Textinput
                      label='Co-Founder LinkedIn Profile'
                      type='url'
                      placeholder='https://www.linkedin.com/in/example'
                      name='cofounderLinkedin'
                      error={errors.cofounderLinkedin}
                      register={register}
                    />
                  </div>
                </div>
              )}

              {stepNumber === (hasCofounder ? 4 : 3) && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10 px-6'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h1 className='text-lg text-slate-800 dark:text-slate-300 my-6 font-semibold'>
                        Enter Technical Details
                      </h1>
                    </div>
                    <Textinput
                      label='CTO Full Name'
                      type='text'
                      placeholder='CTO Full Name'
                      name='ctoName'
                      error={errors.ctoName}
                      register={register}
                    />
                    <Textinput
                      label='CTO Email'
                      type='email'
                      placeholder='CTO Email'
                      name='ctoEmail'
                      error={errors.ctoEmail}
                      register={register}
                    />
                    <Textinput
                      label='CTO Mobile Number'
                      type='text'
                      placeholder='CTO Mobile Number'
                      name='ctoMobile'
                      error={errors.ctoMobile}
                      register={register}
                    />
                    <Textinput
                      label='CTO LinkedIn Profile'
                      type='url'
                      placeholder='https://www.linkedin.com/in/example'
                      name='ctoLinkedin'
                      error={errors.ctoLinkedin}
                      register={register}
                    />
                    <Textinput
                      label='Size of the Tech Team'
                      type='number'
                      placeholder='Size of the Tech Team'
                      name='techTeamSize'
                      error={errors.techTeamSize}
                      register={register}
                    />
                    <Textinput
                      label='Link of your mobile app'
                      type='url'
                      placeholder='https://www.example.com (Leave empty if not applicable)'
                      name='mobileAppLink'
                      error={errors.mobileAppLink}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Technology Roadmap'
                      type='file'
                      name='technologyRoadmap'
                      error={errors.technologyRoadmap}
                      register={register}
                    />
                  </div>
                </div>
              )}
              {stepNumber === (hasCofounder ? 5 : 4) && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Business Details
                      </h4>
                    </div>

                    <Textarea
                      label='Current Traction'
                      placeholder='Current Traction'
                      name='currentTraction'
                      error={errors.currentTraction}
                      register={register}
                    />
                    <Textinput
                      label='New customers you obtained in the 6 months'
                      type='number'
                      placeholder='New customers you obtained in the 6 months'
                      name='newCustomers'
                      error={errors.newCustomers}
                      register={register}
                    />
                    <Textinput
                      label='Customer acquisition cost'
                      type='number'
                      placeholder='Customer acquisition cost'
                      name='customerAcquisitionCost'
                      error={errors.customerAcquisitionCost}
                      register={register}
                    />
                    <Textarea
                      label='What is the lifetime value of your customer?'
                      placeholder='What is the lifetime value of your customer?'
                      name='customerLifetimeValue'
                      error={errors.customerLifetimeValue}
                      register={register}
                    />

                    {/* <InputGroup
                      label='Upload Certificate of Incorporation'
                      type='file'
                      name='certificateOfIncorporation'
                      error={errors.certificateOfIncorporation}
                      register={register}
                    />
                    <InputGroup
                      label='Upload GST Certificate'
                      type='file'
                      name='gstCertificate'
                      error={errors.gstCertificate}
                      register={register}
                    /> */}
                    {/* <InputGroup
                      label='Upload Startup India Certificate'
                      type='file'
                      name='startupIndiaCertificate'
                      error={errors.startupIndiaCertificate}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Due Diligence Report'
                      type='file'
                      name='dueDiligenceReport'
                      error={errors.dueDiligenceReport}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Business Valuation Report'
                      type='file'
                      name='businessValuationReport'
                      error={errors.businessValuationReport}
                      register={register}
                    /> */}
                    {/* <InputGroup
                      label='Upload MIS'
                      type='file'
                      name='mis'
                      error={errors.mis}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Pitch Deck'
                      type='file'
                      name='pitchDeck'
                      error={errors.pitchDeck}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Video Pitch'
                      type='file'
                      name='videoPitch'
                      error={errors.videoPitch}
                      register={register}
                    /> */}
                  </div>
                </div>
              )}

              {stepNumber === (hasCofounder ? 6 : 5) && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h1 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Company Documents
                      </h1>
                    </div>
                    <InputGroup
                      label='Upload Certificate of Incorporation'
                      type='file'
                      name='certificateOfIncorporation'
                      error={errors.certificateOfIncorporation}
                      register={register}
                    />

                    <InputGroup
                      label='Upload GST Certificate'
                      type='file'
                      name='gstCertificate'
                      error={errors.gstCertificate}
                      register={register}
                    />

                    <InputGroup
                      label='Upload Trademark'
                      type='file'
                      name='trademark'
                      error={errors.trademark}
                      register={register}
                    />

                    <InputGroup
                      label='Upload Copyright'
                      type='file'
                      name='copyright'
                      error={errors.copyright}
                      register={register}
                    />

                    <InputGroup
                      label='Upload Patent'
                      type='file'
                      name='patent'
                      error={errors.patent}
                      register={register}
                    />

                    <InputGroup
                      label='Upload Startup India Certificate'
                      type='file'
                      name='startupIndiaCertificate'
                      error={errors.startupIndiaCertificate}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your Due-Diligence Report'
                      type='file'
                      name='dueDiligenceReport'
                      error={errors.dueDiligenceReport}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your Business Valuation report'
                      type='file'
                      name='businessValuationReport'
                      error={errors.businessValuationReport}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your MIS'
                      type='file'
                      name='mis'
                      error={errors.mis}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your financial projections'
                      type='file'
                      name='financialProjections'
                      error={errors.financialProjections}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your balance sheet'
                      type='file'
                      name='balanceSheet'
                      error={errors.balanceSheet}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your P&L Statement'
                      type='file'
                      name='plStatement'
                      error={errors.plStatement}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your cashflow statement'
                      type='file'
                      name='cashflowStatement'
                      error={errors.cashflowStatement}
                      register={register}
                    />

                    <InputGroup
                      label='Upload Pitch Deck'
                      type='file'
                      name='pitchDeck'
                      error={errors.pitchDeck}
                      register={register}
                    />

                    <InputGroup
                      label='Upload Video Pitch'
                      type='file'
                      name='videoPitch'
                      error={errors.videoPitch}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your SHA (Previous round/ existing round)'
                      type='file'
                      name='sha'
                      error={errors.sha}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your Termsheet (previous round/ existing round)'
                      type='file'
                      name='termsheet'
                      error={errors.termsheet}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your employment agreement'
                      type='file'
                      name='employmentAgreement'
                      error={errors.employmentAgreement}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your MoU'
                      type='file'
                      name='mou'
                      error={errors.mou}
                      register={register}
                    />

                    <InputGroup
                      label='Upload your NDA'
                      type='file'
                      name='nda'
                      error={errors.nda}
                      register={register}
                    />
                  </div>
                </div>
              )}

              {stepNumber === (hasCofounder ? 7 : 6) && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h1 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Funding Information
                      </h1>
                    </div>
                    <Textinput
                      label='Total Funding Ask(in USD)'
                      type='number'
                      placeholder='Total Funding Ask(in USD)'
                      name='totalFundingAsk'
                      error={errors.totalFundingAsk}
                      register={register}
                    />
                    <Textinput
                      label='Amount Committed So Far(in USD)'
                      type='number'
                      placeholder='Amount Committed So Far(in USD)'
                      name='amountCommitted'
                      error={errors.amountCommitted}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Current Cap Table'
                      type='file'
                      name='currentCapTable'
                      error={errors.currentCapTable}
                      register={register}
                    />
                    <Textinput
                      label='Any Government Grants(in USD)'
                      type='text'
                      placeholder='Any Government Grants(in USD)'
                      name='governmentGrants'
                      error={errors.governmentGrants}
                      register={register}
                    />
                    <Textarea
                      label='Equity Split Among the Founders'
                      placeholder='Equity Split Among the Founders'
                      name='equitySplit'
                      error={errors.equitySplit}
                      register={register}
                    />
                    <Textarea
                      label='Fund Utilization Summary'
                      placeholder='Fund Utilization Summary'
                      name='fundUtilization'
                      error={errors.fundUtilization}
                      register={register}
                    />
                    <Textinput
                      label='ARR'
                      type='number'
                      placeholder='Annual Recurring Revenue (ARR)'
                      name='arr'
                      error={errors.arr}
                      register={register}
                    />
                    <Textinput
                      label='MRR'
                      type='number'
                      placeholder='Monthly Recurring Revenue (MRR)'
                      name='mrr'
                      error={errors.mrr}
                      register={register}
                    />
                  </div>
                </div>
              )}

              <div
                className={`${
                  stepNumber > 0 ? 'flex justify-between' : ' text-right'
                } mt-10`}
              >
                {stepNumber !== 0 && (
                  <Button
                    text='Previous'
                    className='btn-dark'
                    onClick={handlePrev}
                  />
                )}
                <Button
                  text={
                    isLoading
                      ? 'Submitting...'
                      : stepNumber !== stepsWithCofounder.length - 1
                      ? 'Next'
                      : 'Submit'
                  }
                  className={`btn-dark ${isLoading ? 'loading' : ''}`}
                  type='submit'
                  disabled={isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FormWizard;

<style jsx>{`
  .upload-animation input[type='file'] {
    position: relative;
    overflow: hidden;
    display: inline-block;
  }

  .upload-animation input[type='file']::before {
    content: 'Upload File';
    display: inline-block;
    background: #4a90e2;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 0.25rem;
    text-align: center;
    transition: all 0.3s ease;
  }

  .upload-animation input[type='file']:hover::before {
    background: #357ab8;
  }

  .upload-animation input[type='file']:active::before {
    background: #2c6695;
  }

  .upload-animation input[type='file']::-webkit-file-upload-button {
    visibility: hidden;
  }

  .upload-animation input[type='file']::-moz-file-upload-button {
    visibility: hidden;
  }

  .upload-animation input[type='file']::after {
    content: 'File Uploaded';
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    background: #4caf50;
    color: white;
    border-radius: 0.25rem;
    padding: 0.5rem;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }

  .upload-animation input[type='file']:valid::after {
    display: inline-block;
  }
`}</style>;
