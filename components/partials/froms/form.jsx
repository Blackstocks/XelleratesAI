'use client';

import React, { useState, useEffect } from 'react';
import Textinput from '@/components/ui/Textinput';
import InputGroup from '@/components/ui/InputGroup';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Loading from '@/components/Loading';
import { supabase } from '@/lib/supabaseclient';

const steps = [
  {
    id: 1,
    title: 'Contact Information',
  },
  {
    id: 2,
    title: 'Company Profile',
  },
  {
    id: 3,
    title: 'Founder and Education Information',
  },
  {
    id: 4,
    title: 'Business Details',
  },
  {
    id: 5,
    title: 'Funding Information',
  },
];

const contactSchema = yup.object().shape({
  mobile: yup.string().required('Mobile number is required'),
  businessDescription: yup
    .string()
    .required('Please provide a brief description of your business'),
});

const profileSchema = yup.object().shape({
  companyName: yup.string().required('Company name is required'),
  shortDescription: yup.string().required('Short description is required'),
  incorporationDate: yup.date().required('Date of Incorporation is required'),
  country: yup.string().required('Country is required'),
  stateCity: yup.string().required('State, City is required'),
  officeAddress: yup.string().required('Office address is required'),
  pinCode: yup.string().required('Pin code is required'),
  companyWebsite: yup
    .string()
    .url('Invalid URL')
    .required('Company website is required'),
  linkedinProfile: yup
    .string()
    .url('Invalid URL')
    .required('LinkedIn profile is required'),
  companyLogo: yup.mixed().required('Company logo is required'), // Added validation for company logo
  teamSize: yup.number().required('Team Size is required'),
  currentStage: yup
    .string()
    .required('Current stage of the company is required'),
});

const founderAndEducationSchema = yup.object().shape({
  founderName: yup.string().required('Full name is required'),
  founderEmail: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  founderMobile: yup.string().required('Mobile number is required'),
  founderLinkedin: yup
    .string()
    .url('Invalid URL')
    .required('LinkedIn profile is required'),
  cofounderName: yup.string(), // Not required initially
  degreeName: yup.string().required('Degree name is required'),
  collegeName: yup.string().required('College name is required'),
  graduationYear: yup.date().required('Year of graduation is required'),
});

const cofounderSchema = yup.object().shape({
  cofounderName: yup.string().required('Co-Founder name is required'),
  cofounderEmail: yup
    .string()
    .email('Invalid email')
    .required('Co-Founder email is required'),
  cofounderMobile: yup
    .string()
    .required('Co-Founder mobile number is required'),
  cofounderLinkedin: yup
    .string()
    .url('Invalid URL')
    .required('Co-Founder LinkedIn profile is required'),
});

const businessSchema = yup.object().shape({
  certificateOfIncorporation: yup
    .mixed()
    .required('Certificate of Incorporation is required'),
  gstCertificate: yup.mixed().required('GST Certificate is required'),
  startupIndiaCertificate: yup
    .mixed()
    .required('Startup India Certificate is required'),
  dueDiligenceReport: yup.mixed().required('Due Diligence Report is required'),
  businessValuationReport: yup
    .mixed()
    .required('Business Valuation Report is required'),
  industrySector: yup.string().required('Industry or sector is required'),

  currentTraction: yup.string().required('Current traction is required'),
  mis: yup.mixed().required('MIS is required'),
  pitchDeck: yup.mixed().required('Pitch Deck is required'),
  videoPitch: yup.mixed().required('Video Pitch is required'),
  targetAudience: yup.string().required('Target Audience is required'),

  uspMoat: yup.string().required('USP/MOAT is required'),
});

const fundingSchema = yup.object().shape({
  previousFunding: yup.boolean(),
  totalFundingAsk: yup.number().required('Total funding ask is required'),
  amountCommitted: yup.number().required('Amount committed so far is required'),
  currentCapTable: yup.mixed().required('Current cap table is required'),
  governmentGrants: yup.string().required('Government grants are required'),
  equitySplit: yup
    .string()
    .required('Equity split among the founders is required'),
  fundUtilization: yup
    .string()
    .required('Fund utilization summary is required'),
  arr: yup.number().required('ARR is required'),
  mrr: yup.number().required('MRR is required'),
});

const FormWizard = () => {
  const [stepNumber, setStepNumber] = useState(0);
  const [stepsWithCofounder, setStepsWithCofounder] = useState(steps);
  const [hasCofounder, setHasCofounder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: yupResolver(
      stepNumber === (hasCofounder ? 4 : 3)
        ? businessSchema
        : stepNumber === (hasCofounder ? 5 : 4)
        ? fundingSchema
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

  const handleFileUpload = async (file, bucket, companyName, folder) => {
    if (!file) {
      console.log(`${folder} is not provided.`);
      return null;
    }

    console.log(`Uploading ${folder}:`, file);

    const filePath = `${companyName}/${folder}/${Date.now()}-${file.name}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      console.log(`${folder} uploaded successfully:`, data.path);
      return data.path; // Return the file path
    } catch (error) {
      console.error(`Error uploading ${folder}:`, error);
      throw error;
    }
  };

  const onSubmit = async (data) => {
    console.log('Form Data:', data);
    console.log('Current Step:', stepNumber);

    const isCofounderStep = hasCofounder && stepNumber === 3;
    const isLastStep = stepNumber === stepsWithCofounder.length - 1;

    console.log('Is Co-Founder Step:', isCofounderStep);
    console.log('Is Last Step:', isLastStep);

    if (isLastStep) {
      setIsLoading(true);
      try {
        console.log('Form data:', data);

        // Upload files and store their URLs
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
        };

        for (const field in fileFields) {
          if (data[field] && data[field][0]) {
            try {
              uploadedFiles[field] = await handleFileUpload(
                data[field][0],
                'documents',
                data.companyName,
                fileFields[field]
              );
            } catch (uploadError) {
              console.error(`Error uploading ${field}:`, uploadError);
            }
          } else {
            console.log(`${field} is not provided.`);
          }
        }

        console.log('Uploaded Files:', uploadedFiles);

        // Insert company profile data
        const { data: companyProfileData, error: companyProfileError } =
          await supabase.from('company_profile').insert([
            {
              company_name: data.companyName,
              short_description: data.shortDescription,
              incorporation_date: data.incorporationDate,
              country: data.country,
              state_city: data.stateCity,
              office_address: data.officeAddress,
              pin_code: data.pinCode,
              company_website: data.companyWebsite,
              linkedin_profile: data.linkedinProfile,
              company_logo: uploadedFiles.companyLogo || '',
              current_stage: data.currentStage,
              team_size: data.teamSize,
            },
          ]);

        if (companyProfileError) {
          throw companyProfileError;
        }

        const companyId = companyProfileData[0].id;

        // Insert business details along with file URLs
        const { error: businessDetailsError } = await supabase
          .from('business_details')
          .insert([
            {
              company_id: companyId,
              industry_sector: data.industrySector,
              current_traction: data.currentTraction,
              target_audience: data.targetAudience,
              usp_moat: data.uspMoat,
              certificate_of_incorporation:
                uploadedFiles.certificateOfIncorporation || '',
              gst_certificate: uploadedFiles.gstCertificate || '',
              startup_india_certificate:
                uploadedFiles.startupIndiaCertificate || '',
              due_diligence_report: uploadedFiles.dueDiligenceReport || '',
              business_valuation_report:
                uploadedFiles.businessValuationReport || '',
              mis: uploadedFiles.mis || '',
              pitch_deck: uploadedFiles.pitchDeck || '',
              video_pitch: uploadedFiles.videoPitch || '',
            },
          ]);

        if (businessDetailsError) {
          throw businessDetailsError;
        }

        // Insert funding information
        const { error: fundingInformationError } = await supabase
          .from('funding_information')
          .insert([
            {
              company_id: companyId,
              total_funding_ask: data.totalFundingAsk,
              amount_committed: data.amountCommitted,
              // current_cap_table: uploadedFiles.currentCapTable || '',
              government_grants: data.governmentGrants,
              equity_split: data.equitySplit,
              fund_utilization: data.fundUtilization,
              arr: data.arr,
              mrr: data.mrr,
              capTable: data.capTable || [],
            },
          ]);

        if (fundingInformationError) {
          throw fundingInformationError;
        }

        // Insert contact information
        const { error: contactInformationError } = await supabase
          .from('contact_information')
          .insert([
            {
              company_id: companyId,
              mobile: data.mobile,
              business_description: data.businessDescription,
            },
          ]);

        if (contactInformationError) {
          throw contactInformationError;
        }

        // Insert founder information
        const { error: founderInformationError } = await supabase
          .from('founder_information')
          .insert([
            {
              company_id: companyId,
              founder_name: data.founderName,
              founder_email: data.founderEmail,
              founder_mobile: data.founderMobile,
              founder_linkedin: data.founderLinkedin,
              degree_name: data.degreeName,
              college_name: data.collegeName,
              graduation_year: data.graduationYear,
            },
          ]);

        if (founderInformationError) {
          throw founderInformationError;
        }

        // Insert co-founder information (if exists)
        if (hasCofounder) {
          const { error: cofounderInformationError } = await supabase
            .from('cofounder_information')
            .insert([
              {
                company_id: companyId,
                cofounder_name: data.cofounderName,
                cofounder_email: data.cofounderEmail,
                cofounder_mobile: data.cofounderMobile,
                cofounder_linkedin: data.cofounderLinkedin,
              },
            ]);

          if (cofounderInformationError) {
            throw cofounderInformationError;
          }
        }

        console.log('Data saved successfully');
      } catch (error) {
        console.error('Error saving data:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Going to next step');
      setStepNumber(stepNumber + 1);
    }
  };

  useEffect(() => {
    if (cofounderName && cofounderName.length > 0 && !hasCofounder) {
      console.log('Adding co-founder step');
      setStepsWithCofounder([
        ...steps.slice(0, 3),
        { id: 4, title: 'Co-Founder Information' },
        ...steps.slice(3),
      ]);
      setHasCofounder(true);
    } else if (!cofounderName && hasCofounder) {
      console.log('Removing co-founder step');
      setStepsWithCofounder(steps);
      setHasCofounder(false);
    }
  }, [cofounderName, hasCofounder]);

  const handlePrev = () => {
    console.log('Going to previous step');
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
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Your Company Details
                      </h4>
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
                      error={errors.incorporationDate}
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
                      placeholder='Company Website'
                      name='companyWebsite'
                      error={errors.companyWebsite}
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
                    <Textinput
                      label='LinkedIn Profile'
                      type='url'
                      placeholder='LinkedIn Profile'
                      name='linkedinProfile'
                      error={errors.linkedinProfile}
                      register={register}
                    />
                    <InputGroup
                      label='Upload Company Logo'
                      type='file'
                      name='companyLogo'
                      error={errors.companyLogo}
                      register={register}
                    />{' '}
                    {/* Added file input for company logo */}
                  </div>
                </div>
              )}

              {stepNumber === 2 && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Founder and Educational Information
                      </h4>
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
                      placeholder='Email'
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
                      placeholder='LinkedIn Profile'
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
                      placeholder='Co-Founder LinkedIn Profile'
                      name='cofounderLinkedin'
                      error={errors.cofounderLinkedin}
                      register={register}
                    />
                  </div>
                </div>
              )}

              {stepNumber === (hasCofounder ? 4 : 3) && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Business Details
                      </h4>
                    </div>
                    <Textinput
                      label='Industry or Sector'
                      type='text'
                      placeholder='Industry or Sector'
                      name='industrySector'
                      error={errors.industrySector}
                      register={register}
                    />

                    <Textarea
                      label='Current Traction'
                      placeholder='Current Traction'
                      name='currentTraction'
                      error={errors.currentTraction}
                      register={register}
                    />
                    <Textinput
                      label='Target Audience'
                      type='text'
                      placeholder='Target Audience'
                      name='targetAudience'
                      error={errors.targetAudience}
                      register={register}
                    />
                    <Textarea
                      label='USP/MOAT'
                      placeholder='USP/MOAT'
                      name='uspMoat'
                      error={errors.uspMoat}
                      register={register}
                    />
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
                    />
                    <InputGroup
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
                    />
                  </div>
                </div>
              )}

              {stepNumber === (hasCofounder ? 5 : 4) && (
                <div>
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 pt-10'>
                    <div className='lg:col-span-3 md:col-span-2 col-span-1'>
                      <h4 className='text-base text-slate-800 dark:text-slate-300 my-6'>
                        Enter Funding Information
                      </h4>
                    </div>
                    <Textinput
                      label='Total Funding Ask'
                      type='number'
                      placeholder='Total Funding Ask'
                      name='totalFundingAsk'
                      error={errors.totalFundingAsk}
                      register={register}
                    />
                    <Textinput
                      label='Amount Committed So Far'
                      type='number'
                      placeholder='Amount Committed So Far'
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
                      label='Any Government Grants'
                      type='text'
                      placeholder='Any Government Grants'
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
