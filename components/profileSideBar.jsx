import React, { Fragment, useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import Icon from '@/components/ui/Icon';
import Card from '@/components/ui/Card';
import Textinput from '@/components/ui/Textinput';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/components/Loading';
import CustomSelect from './ui/Select';
import Select from 'react-select';
import InputGroup from './ui/InputGroup';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import { countries } from '@/constant/data';
import { useFieldArray } from 'react-hook-form';
import {
  updateGeneralInfo,
  updateCTODetails,
  updateStartupDetails,
  updateFounderInformation,
  updateCompanyDocuments,
  updateBusinessDetails,
  updateFundingInfo,
  handleFileUpload,
  insertStartupDetails,
  insertBusinessDetails,
  insertFundingInformation,
  insertFounderInformation,
  insertCTODetails,
  insertCompanyDocuments,
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
    title: 'CTO Information',
    icon: 'heroicons-outline:user',
    key: 'CTO_info',
  },
  {
    title: 'Business Details',
    icon: 'heroicons-outline:briefcase',
    key: 'business_details',
  },
  {
    title: 'Company Documents',
    icon: 'heroicons-outline:document',
    key: 'company_documents',
  },
  {
    title: 'Funding Information',
    icon: 'heroicons-outline:cash',
    key: 'funding_info',
  },
];

const companyDocumentsFiles = {
  certificate_of_incorporation: 'certificateOfIncorporation',
  gst_certificate: 'gstCertificate',
  trademark: 'trademark',
  copyright: 'copyright',
  patent: 'patent',
  startup_india_certificate: 'startupIndiaCertificate',
  due_diligence_report: 'dueDiligenceReport',
  business_valuation_report: 'businessValuationReport',
  mis: 'mis',
  financial_projections: 'financialProjections',
  balance_sheet: 'balanceSheet',
  pl_statement: 'plStatement',
  cashflow_statement: 'cashflowStatement',
  pitch_deck: 'pitchDeck',
  video_pitch: 'videoPitch',
  sha: 'sha',
  termsheet: 'termsheet',
  employment_agreement: 'employmentAgreement',
  mou: 'mou',
  nda: 'nda',
};

const VerticalNavTabs = () => {
  const {
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
  } = useCompleteUserDetails();
  // console.log('companyDocuments', companyDocuments);
  const {
    control,
    watch,
    setValue,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const {
    fields: fundingFields,
    append: appendFunding,
    remove: removeFunding,
  } = useFieldArray({
    control,
    name: 'funding',
  });

  const {
    fields: socialMediaFields,
    append: appendSocialMedia,
    remove: removeSocialMedia,
  } = useFieldArray({
    control,
    name: 'socialMedia',
  });

  const {
    fields: coFounderFields,
    append: appendCoFounder,
    remove: removeCoFounder,
  } = useFieldArray({
    control,
    name: 'co_founders',
  });

  const {
    fields: advisorFields,
    append: appendAdvisor,
    remove: removeAdvisor,
  } = useFieldArray({
    control,
    name: 'advisors',
  });

  const {
    fields: capTableFields,
    append: appendCapTable,
    remove: removeCapTable,
  } = useFieldArray({
    control,
    name: 'capTable',
  });

  const {
    fields: presenceFields,
    append: appendPresence,
    remove: removePresence,
  } = useFieldArray({
    control,
    name: 'socialMediaPresence',
  });

  const { user, loading } = useUserDetails();
  const [editingSection, setEditingSection] = useState(null);
  const [founderInformationLoc, setFounderInformationLoc] = useState(null);
  const [companyProfileLoc, setCompanyProfileLoc] = useState(null);
  const [fundingInformationLoc, setFundingInformationLoc] = useState(null);
  const [ctoInfoLoc, setCtoInfoLoc] = useState(null);
  const [businessDetailsLoc, setBusinessDetailsLoc] = useState(null);
  const [companyDocumentsLoc, setCompanyDocumentsLoc] = useState(null);
  const [generalInformationLoc, setGeneralInformationLoc] = useState(null);

  useEffect(() => {
    setFounderInformationLoc(founderInformation);
    setCompanyProfileLoc(companyProfile);
    setFundingInformationLoc(fundingInformation);
    setCtoInfoLoc(ctoInfo);
    setBusinessDetailsLoc(businessDetails);
    setCompanyDocumentsLoc(companyDocuments);
    setGeneralInformationLoc(user);
  }, [
    user,
    companyProfile,
    founderInformation,
    fundingInformation,
    ctoInfo,
    businessDetails,
    companyDocuments,
  ]);

  // console.log('companyProfile', companyProfile);
  // console.log('founderInformation', founderInformation);

  const [hasMediaPresence, setHasMediaPresence] = useState(false);

  useEffect(() => {
    if (companyProfile?.media === 'Yes') {
      setValue('media', 'Yes');
      setHasMediaPresence(true);
    }
  }, [companyProfile?.media]);

  const selectedMedia = watch('media', '');
  // console.log('Social Media Fields:', socialMediaFields);

  useEffect(() => {
    setHasMediaPresence(selectedMedia === 'Yes');
  }, [selectedMedia]);

  useEffect(() => {
    if (companyProfile) {
      reset({
        socialMedia: companyProfile.social_media_handles || [],
        mediaPresence: companyProfile?.media_presence || [],
      });
    }
    if (founderInformation) {
      // console.log('Founder Information:', founderInformation);

      reset({
        advisors: founderInformation?.advisors || [],
        co_founders: founderInformation?.co_founders || [],
      });
    }
    if (fundingInformation) {
      reset({
        capTable: fundingInformation?.cap_table || [],
        funding: fundingInformation?.funding || [],
      });
    }
  }, [companyProfile, founderInformation, fundingInformation, reset]);

  // console.log('Presence Fields:', presenceFields);
  // console.log('Social Media Fields:', socialMediaFields);
  // console.log('Advisor Fields:', advisorFields);
  // console.log('Co-Founder Fields:', coFounderFields);
  // console.log('Cap Table Fields:', capTableFields);

  const handleSave = async (data, section) => {
    try {
      let updatedData;
      const uploadedFiles = {};

      const handleUploads = async (data) => {
        switch (section) {
          case 'startup_details':
            if (data.company_logo && data.company_logo[0]) {
              uploadedFiles.company_logo = await handleFileUpload(
                data.company_logo[0],
                'documents',
                companyProfile?.company_name || data.company_name,
                'company_logo'
              );
            }
            break;

          case 'founder_info':
            if (data.co_founder_agreement && data.co_founder_agreement[0]) {
              uploadedFiles.co_founder_agreement = await handleFileUpload(
                data.co_founder_agreement[0],
                'documents',
                companyProfile?.company_name || data.company_name,
                'list_of_advisers'
              );
            }
            break;

          case 'CTO_info':
            if (data.technology_roadmap && data.technology_roadmap[0]) {
              uploadedFiles.technology_roadmap = await handleFileUpload(
                data.technology_roadmap[0],
                'documents',
                companyProfile?.company_name || data.company_name,
                'technology_roadmap'
              );
            }
            break;
        }
      };
      // console.log('uploadedFiles', uploadedFiles);
      await handleUploads(data);

      switch (section) {
        case 'general_info':
          const generalData = {
            email: data.email,
            mobile: data.mobile,
            linkedin_profile: data.linkedin_profile,
          };

          try {
            const generalInfoResponse = await updateGeneralInfo(
              user.id,
              generalData
            );

            if (generalInfoResponse?.error) {
              throw generalInfoResponse.error;
            }

            updatedData = generalInfoResponse.data;

            if (updatedData) {
              console.log('updatedData', updatedData);
              setGeneralInformationLoc(updatedData); // Assuming you have a state setter for the updated data

              console.log('generalInformationLoc', generalInformationLoc);
            } else {
              console.error('Unexpected response format:', generalInfoResponse);
            }
          } catch (error) {
            console.error('Error updating general information:', error);
          }
          break;

        case 'startup_details':
          const startupData = {
            company_name: data.company_name || null,
            incorporation_date: data.incorporation_date || null,
            country: data.country || null,
            state_city: data.state_city || null,
            office_address: data.office_address || null,
            company_website: data.company_website || null,
            linkedin_profile: data.linkedin_profile || null,
            short_description: data.short_description || null,
            target_audience: data.target_audience || null,
            industry_sector: data.industry_sector || null,
            team_size: data.team_size || null,
            current_stage: data.current_stage || null,
            usp_moat: data.usp_moat || null,
            media: data.media || null,
            company_logo: uploadedFiles.company_logo || null,
            socialMedia: data.socialMedia || [],
            socialMediaPresence: data.socialMediaPresence || [],
          };
          try {
            let startupDetailsResponse;
            if (!companyProfile?.id) {
              startupDetailsResponse = await insertStartupDetails(
                startupData,
                user.id,
                uploadedFiles
              );
            } else {
              startupDetailsResponse = await updateStartupDetails(
                startupData,
                user.id,
                uploadedFiles
              );
            }

            if (startupDetailsResponse?.error) {
              throw startupDetailsResponse.error;
            }
            if (startupDetailsResponse) {
              updatedData = startupDetailsResponse;

              setCompanyProfileLoc(updatedData);
            } else {
              console.error(
                'Unexpected response format:',
                startupDetailsResponse
              );
            }
          } catch (error) {
            console.error('Error handling startup details:', error);
          }
          break;

        case 'founder_info':
          const founderData = {
            company_id: companyProfile?.id,
            founder_name: data.founder_name || null,
            founder_email: data.founder_email || null,
            founder_mobile: data.founder_mobile || null,
            founder_linkedin: data.founder_linkedin || null,
            degree_name: data.degree_name || null,
            college_name: data.college_name || null,
            graduation_year: data.graduation_year || null,
            advisors: data.advisors || [],
            co_founders: data.co_founders || [],
            co_founder_agreement: uploadedFiles.co_founder_agreement || null,
          };

          let founderInfoResponse;
          if (!founderInformation?.id) {
            founderInfoResponse = await insertFounderInformation(
              companyProfile.id,
              founderData,
              uploadedFiles
            );
          } else {
            founderInfoResponse = await updateFounderInformation(
              companyProfile.id,
              founderData,
              uploadedFiles
            );
          }

          if (founderInfoResponse?.error) {
            throw founderInfoResponse.error;
          }

          updatedData = founderInfoResponse.data;
          if (founderInfoResponse) {
            updatedData = founderInfoResponse;

            setFounderInformationLoc(updatedData);
          } else {
            console.error('Unexpected response format:', founderInfoResponse);
          }
          break;

        case 'CTO_info':
          const ctoData = {
            company_id: companyProfile?.id,
            cto_name: data.cto_name || null,
            cto_email: data.cto_email || null,
            cto_mobile: data.cto_mobile || null,
            cto_linkedin: data.cto_linkedin || null,
            tech_team_size: data.tech_team_size || null,
            mobile_app_link_ios: data.mobile_app_link_ios || null,
            mobile_app_link_android: data.mobile_app_link_android || null,
            technology_roadmap: uploadedFiles.technology_roadmap || null,
          };

          let ctoInfoResponse;
          if (!ctoInfo?.id) {
            ctoInfoResponse = await insertCTODetails(
              companyProfile.id,
              ctoData,
              uploadedFiles
            );
          } else {
            ctoInfoResponse = await updateCTODetails(
              companyProfile.id,
              ctoData,
              uploadedFiles
            );
          }

          if (ctoInfoResponse?.error) {
            throw ctoInfoResponse.error;
          }

          updatedData = ctoInfoResponse.data;
          break;
        case 'company_documents':
          const companyUploadedFiles = {};
          for (const [dbField, formField] of Object.entries(
            companyDocumentsFiles
          )) {
            if (data[formField] && data[formField][0]) {
              companyUploadedFiles[formField] = await handleFileUpload(
                data[formField][0],
                'documents',
                companyProfile?.company_name || data.company_name,
                formField
              );
            }
          }

          const companyDocumentsResponse = companyDocuments?.id
            ? await updateCompanyDocuments(
                companyProfile.id,
                companyUploadedFiles
              )
            : await insertCompanyDocuments(
                companyProfile.id,
                companyUploadedFiles
              );

          if (companyDocumentsResponse?.error) {
            console.error(
              'Error saving company documents:',
              companyDocumentsResponse.error
            );
            throw companyDocumentsResponse.error;
          }

          console.log(
            'Company Documents saved successfully:',
            companyDocumentsResponse
          );

          updatedData = companyDocumentsResponse;

          break;
        case 'business_details':
          const emptyBusinessDetails = !businessDetails?.id;
          updatedData = {
            company_id: companyProfile.id,
            current_traction: data.current_traction || null,
            new_Customers: data.new_Customers || null,
            customer_AcquisitionCost: data.customer_AcquisitionCost || null,
            customer_Lifetime_Value: data.customer_Lifetime_Value || null,
          };

          try {
            if (emptyBusinessDetails) {
              const businessDetailsResponse = await insertBusinessDetails(
                companyProfile.id,
                updatedData
              );
              if (businessDetailsResponse.error) {
                throw businessDetailsResponse.error;
              }
              updatedData = businessDetailsResponse.data;
              console.log('Inserted business details:', updatedData);
              setBusinessDetailsLoc(updatedData);
            } else {
              const businessDetailsResponse = await updateBusinessDetails(
                companyProfile.id,
                updatedData
              );
              if (businessDetailsResponse.error) {
                throw businessDetailsResponse.error;
              }
              updatedData = businessDetailsResponse.data;
              // console.log('Updated business details:', updatedData);
              // setBusinessDetailsLoc(updatedData);
              // console.log('Business Details:', businessDetailsLoc);
            }
            console.log('Data saved successfully:', updatedData);
          } catch (error) {
            console.error('Error saving business details:', error);
          }
          break;

        case 'funding_info':
          const fundingData = {
            company_id: companyProfile?.id,
            total_funding_ask: data.total_funding_ask || null,
            amount_committed: data.amount_committed || null,
            government_grants: data.government_grants || null,
            equity_split: data.equity_split || null,
            fund_utilization: data.fund_utilization || null,
            arr: data.arr || null,
            mrr: data.mrr || null,
            previous_funding: data.funding || [],
            capTable: data.capTable || [],
          };

          let fundingInfoResponse;
          if (!fundingInformation?.id) {
            fundingInfoResponse = await insertFundingInformation(
              companyProfile.id,
              fundingData,
              uploadedFiles
            );
          } else {
            fundingInfoResponse = await updateFundingInfo(
              companyProfile.id,
              fundingData
            );
          }

          if (fundingInfoResponse?.error) {
            throw fundingInfoResponse.error;
          }

          updatedData = fundingInfoResponse.data;
          if (fundingInfoResponse) {
            updatedData = fundingInfoResponse;

            setFundingInformationLoc(updatedData);
          } else {
            console.error('Unexpected response format:', fundingInfoResponse);
          }
          break;

        default:
          console.warn(`Unknown section: ${section}`);
          return;
      }

      console.log('Data saved successfully:', updatedData);
      setEditingSection(null);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const parsedCountry = JSON.parse(companyProfile?.country || '{}');

  // Map parsed value to corresponding label in options
  const defaultCountryValue = countries.find(
    (c) => c.value === parsedCountry.value
  );

  // Extract the label for rendering
  const renderedCountry = parsedCountry.label || '';

  if (loading) {
    return <Loading />;
  }

  return (
    <Card>
      <Tab.Group>
        <div className='grid grid-cols-12 lg:gap-5 md:gap-5'>
          <div className='2xl:col-span-3 xl:col-span-3 lg:col-span-3 lg:gap-5 md:col-span-5 col-span-12'>
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
                              defaultValue={
                                generalInformationLoc?.email || user?.email
                              }
                              register={register}
                            />
                            <Textinput
                              label='Phone'
                              name='mobile'
                              defaultValue={
                                generalInformationLoc?.mobile || user?.mobile
                              }
                              register={register}
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='linkedin_profile'
                              defaultValue={
                                generalInformationLoc?.linkedin_profile ||
                                user?.linkedin_profile
                              }
                              register={register}
                            />
                          </>
                        )}
                        {section.key === 'startup_details' && (
                          <>
                            <Textinput
                              label='Company Name'
                              name='company_name'
                              defaultValue={
                                companyProfileLoc?.company_name ||
                                companyProfile?.company_name
                              }
                              placeholder='Enter your company name'
                              register={register}
                              // readOnly={!!companyProfile?.company_name} // Read-only if there's a default value
                            />

                            <Textinput
                              label='Incorporation Date'
                              type='date'
                              name='incorporation_date'
                              defaultValue={
                                companyProfileLoc?.incorporation_date ||
                                companyProfile?.incorporation_date
                              }
                              placeholder='Select the incorporation date'
                              register={register}
                            />
                            <Controller
                              name='country'
                              control={control}
                              defaultValue={defaultCountryValue || ''}
                              render={({ field }) => (
                                <div>
                                  <label
                                    htmlFor='country'
                                    className='form-label'
                                  >
                                    Country
                                  </label>
                                  <Select
                                    isClearable={false}
                                    {...field}
                                    options={countries}
                                    styles={{
                                      option: (provided) => ({
                                        ...provided,
                                        fontSize: '14px',
                                      }),
                                    }}
                                    className='react-select'
                                    classNamePrefix='select'
                                    defaultValue={countries.find(
                                      (c) => c.value === companyProfile?.country
                                    )}
                                  />
                                </div>
                              )}
                            />

                            <Textinput
                              label='State/City'
                              name='state_city'
                              defaultValue={
                                companyProfile?.state_city ||
                                companyProfileLoc?.state_city
                              }
                              placeholder='Enter the state or city'
                              register={register}
                            />
                            <Textinput
                              label='Office Address'
                              name='office_address'
                              defaultValue={
                                companyProfile?.office_address ||
                                companyProfileLoc?.office_address
                              }
                              placeholder='Enter the office address'
                              register={register}
                            />
                            <Textinput
                              label='Company Website'
                              name='company_website'
                              defaultValue={
                                companyProfile?.company_website ||
                                companyProfileLoc?.company_website
                              }
                              placeholder='Enter the company website URL'
                              register={register}
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='linkedin_profile'
                              defaultValue={
                                companyProfile?.linkedin_profile ||
                                companyProfileLoc?.linkedin_profile
                              }
                              placeholder='Enter the LinkedIn profile URL'
                              register={register}
                            />
                            <Textarea
                              label='Business Description'
                              name='short_description'
                              defaultValue={
                                companyProfile?.short_description ||
                                companyProfileLoc?.short_description
                              }
                              placeholder='Provide a brief business description'
                              register={register}
                            />
                            <CustomSelect
                              label='Target Audience'
                              name='target_audience'
                              defaultValue={
                                companyProfile?.target_audience ||
                                companyProfileLoc?.target_audience
                              }
                              options={[
                                { value: 'B2C', label: 'B2C' },
                                { value: 'B2B', label: 'B2B' },
                                { value: 'B2B2B', label: 'B2B2B' },
                                { value: 'D2C', label: 'D2C' },
                                { value: 'B2G', label: 'B2G' },
                                { value: 'B2B2C', label: 'B2B2C' },
                              ]}
                              placeholder='Select the target audience'
                              register={register}
                            />
                            <CustomSelect
                              label='Industry or Sector'
                              name='industry_sector'
                              defaultValue={
                                companyProfile?.industry_sector ||
                                companyProfileLoc?.industry_sector
                              }
                              options={[
                                {
                                  value: 'Agriculture and Allied Sectors',
                                  label: 'Agriculture and Allied Sectors',
                                },
                                {
                                  value: 'Manufacturing',
                                  label: 'Manufacturing',
                                },
                                { value: 'Services', label: 'Services' },
                                { value: 'Energy', label: 'Energy' },
                                {
                                  value: 'Infrastructure',
                                  label: 'Infrastructure',
                                },
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
                                {
                                  value: 'Food Processing',
                                  label: 'Food Processing',
                                },
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
                                {
                                  value: 'Human Resources',
                                  label: 'Human Resources',
                                },
                                { value: 'Others', label: 'Others' },
                              ]}
                              placeholder='Select the industry or sector'
                              register={register}
                            />
                            <Textinput
                              label='Team Size'
                              type='number'
                              name='team_size'
                              defaultValue={
                                companyProfile?.team_size ||
                                companyProfileLoc?.team_size
                              }
                              placeholder='Enter the team size'
                              register={register}
                            />
                            <Textinput
                              label='Current Stage'
                              name='current_stage'
                              defaultValue={
                                companyProfile?.current_stage ||
                                companyProfileLoc?.current_stage
                              }
                              placeholder='Enter the current stage'
                              register={register}
                            />
                            <Textarea
                              label='USP/MOAT'
                              name='usp_moat'
                              defaultValue={
                                companyProfile?.usp_moat ||
                                companyProfileLoc?.usp_moat
                              }
                              placeholder='Describe the USP/MOAT'
                              register={register}
                            />
                            <CustomSelect
                              label='Social Media Presence'
                              name='media'
                              defaultValue={companyProfile?.media || ''}
                              options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                              ]}
                              register={register}
                            />

                            {hasMediaPresence && (
                              <div className='mt-4'>
                                <div className='text-slate-600 dark:text-slate-300 text-xs font-medium uppercase mb-4'>
                                  Media Presence
                                </div>
                                {presenceFields.map((item, index) => (
                                  <div
                                    className='grid gap-5 mb-5 last:mb-0 grid-cols-1 md:grid-cols-4 lg:grid-cols-5'
                                    key={item.id}
                                  >
                                    <Textinput
                                      label='Platform'
                                      type='text'
                                      placeholder='Platform'
                                      register={register}
                                      name={`socialMediaPresence[${index}].platform`}
                                      defaultValue={item.platform || ''}
                                    />
                                    <Textinput
                                      label='URL'
                                      type='url'
                                      placeholder='URL'
                                      register={register}
                                      name={`socialMediaPresence[${index}].url`}
                                      defaultValue={item.url || ''}
                                    />
                                    <div className='ml-auto mt-auto'>
                                      <button
                                        type='button'
                                        className='inline-flex items-center justify-center h-10 w-10 bg-red-500 text-white rounded'
                                        onClick={() => removePresence(index)}
                                      >
                                        <Icon icon='heroicons-outline:trash' />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                <Button
                                  text='Add new'
                                  icon='heroicons-outline:plus'
                                  className='mt-0 p-0'
                                  onClick={() =>
                                    appendPresence({ platform: '', url: '' })
                                  }
                                />
                              </div>
                            )}

                            <div className='mt-4'>
                              <InputGroup
                                label='Upload Company Logo'
                                type='file'
                                name='company_logo'
                                error={errors.company_logo || null}
                                register={register}
                              />
                            </div>
                            <div className='mt-4'>
                              <div className='text-slate-600 dark:text-slate-300 text-xs font-medium uppercase mb-4'>
                                Other Social Media Handles
                              </div>
                              {socialMediaFields.map((item, index) => (
                                <div
                                  className='lg:grid-cols-5 md:grid-cols-4 grid-cols-1 grid gap-5 mb-5 last:mb-0'
                                  key={item.id}
                                >
                                  <Textinput
                                    label='Platform'
                                    type='text'
                                    id={`platform${index}`}
                                    placeholder='Platform'
                                    register={register}
                                    name={`socialMedia[${index}].platform`}
                                    defaultValue={item.platform || ''}
                                  />
                                  <Textinput
                                    label='URL'
                                    type='url'
                                    id={`url${index}`}
                                    placeholder='URL'
                                    register={register}
                                    name={`socialMedia[${index}].url`}
                                    defaultValue={item.url || ''}
                                  />
                                  <div className='ml-auto mt-auto relative'>
                                    <button
                                      onClick={() => removeSocialMedia(index)}
                                      type='button'
                                      className='inline-flex items-center justify-center h-10 w-10 bg-danger-500 text-lg border rounded border-danger-500 text-white'
                                    >
                                      <Icon icon='heroicons-outline:trash' />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className='mt-4'>
                                <Button
                                  text='Add new'
                                  icon='heroicons-outline:plus'
                                  className='text-slate-600 p-0 dark:text-slate-300'
                                  onClick={() =>
                                    appendSocialMedia({ platform: '', url: '' })
                                  }
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {section.key === 'CTO_info' && (
                          <>
                            <Textinput
                              label='CTO Name'
                              name='cto_name'
                              defaultValue={
                                ctoInfo?.cto_name || ctoInfoLoc?.cto_name
                              }
                              register={register}
                              placeholder='Enter CTO name'
                            />
                            <Textinput
                              label='Email'
                              name='cto_email'
                              defaultValue={
                                ctoInfo?.cto_email || ctoInfoLoc?.cto_email
                              }
                              register={register}
                              placeholder='Enter CTO email'
                            />
                            <Textinput
                              label='Mobile Number'
                              name='cto_mobile'
                              defaultValue={
                                ctoInfo?.cto_mobile || ctoInfoLoc?.cto_mobile
                              }
                              register={register}
                              placeholder='Enter CTO mobile number'
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='cto_linkedin'
                              defaultValue={
                                ctoInfo?.cto_linkedin ||
                                ctoInfoLoc?.cto_linkedin
                              }
                              register={register}
                              placeholder='Enter CTO LinkedIn profile URL'
                            />
                            <Textinput
                              label='Tech Team Size'
                              type='number'
                              name='tech_team_size'
                              defaultValue={
                                ctoInfo?.tech_team_size ||
                                ctoInfoLoc?.tech_team_size
                              }
                              register={register}
                              placeholder='Enter tech team size'
                            />
                            <Textinput
                              label='MOBILE APP LINK (IOS)'
                              name='mobile_app_link_ios'
                              defaultValue={
                                ctoInfo?.mobile_app_link_ios ||
                                ctoInfoLoc?.mobile_app_link_ios
                              }
                              register={register}
                              placeholder='Enter mobile app link (iOS)'
                            />
                            <Textinput
                              label='MOBILE APP LINK (Android)'
                              name='mobile_app_link_android'
                              defaultValue={
                                ctoInfo?.mobile_app_link_android ||
                                ctoInfoLoc?.mobile_app_link_android
                              }
                              register={register}
                              placeholder='Enter mobile app link (Android)'
                            />
                            <InputGroup
                              label='Upload Technology Roadmap'
                              name='technology_roadmap'
                              type='file'
                              register={register}
                              error={errors.technology_roadmap || null}
                            />
                          </>
                        )}
                        {section.key === 'founder_info' && (
                          <>
                            <Textinput
                              label='Founder Name'
                              name='founder_name'
                              defaultValue={
                                founderInformation?.founder_name ||
                                founderInformationLoc?.founder_name ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder name'
                            />
                            <Textinput
                              label='Email'
                              name='founder_email'
                              defaultValue={
                                founderInformation?.founder_email ||
                                founderInformationLoc?.founder_email ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder email'
                            />
                            <Textinput
                              label='Mobile Number'
                              name='founder_mobile'
                              defaultValue={
                                founderInformation?.founder_mobile ||
                                founderInformationLoc?.founder_mobile ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder mobile number'
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='founder_linkedin'
                              defaultValue={
                                founderInformation?.founder_linkedin ||
                                founderInformationLoc?.founder_linkedin ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder LinkedIn profile URL'
                            />
                            <Textinput
                              label='Degree Name'
                              name='degree_name'
                              defaultValue={
                                founderInformation?.degree_name ||
                                founderInformationLoc?.degree_name ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter degree name'
                            />
                            <Textinput
                              label='College Name'
                              name='college_name'
                              defaultValue={
                                founderInformation?.college_name ||
                                founderInformationLoc?.college_name ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter college name'
                            />
                            <Textinput
                              label='Year of Graduation'
                              type='date'
                              name='graduation_year'
                              defaultValue={
                                founderInformation?.graduation_year ||
                                founderInformationLoc?.graduation_year ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter year of graduation'
                            />

                            {/* Co-Founders Section */}
                            <div className='mt-4'>
                              <div className='text-slate-600 dark:text-slate-300 text-xs font-medium uppercase mb-4'>
                                Co-Founders
                              </div>
                              {coFounderFields.map((field, index) => (
                                <div
                                  className='lg:grid-cols-5 md:grid-cols-4 grid-cols-1 grid gap-5 mb-5 last:mb-0'
                                  key={field.id}
                                >
                                  <Textinput
                                    label='Co-founder Name'
                                    name={`co_founders.${index}.co_founder_name`}
                                    defaultValue={
                                      field.co_founder_name || 'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter co-founder name'
                                  />
                                  <Textinput
                                    label='Co-founder Email'
                                    name={`co_founders.${index}.co_founder_email`}
                                    defaultValue={
                                      field.co_founder_email || 'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter co-founder email'
                                  />
                                  <Textinput
                                    label='Co-founder Mobile'
                                    name={`co_founders.${index}.co_founder_mobile`}
                                    defaultValue={
                                      field.co_founder_mobile || 'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter co-founder mobile number'
                                  />
                                  <Textinput
                                    label='Co-founder LinkedIn'
                                    name={`co_founders.${index}.co_founder_linkedin`}
                                    defaultValue={
                                      field.co_founder_linkedin ||
                                      'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter co-founder LinkedIn profile URL'
                                  />
                                  <div className='ml-auto mt-auto relative'>
                                    <button
                                      onClick={() => removeCoFounder(index)}
                                      type='button'
                                      className='inline-flex items-center justify-center h-10 w-10 bg-danger-500 text-lg border rounded border-danger-500 text-white'
                                    >
                                      <Icon icon='heroicons-outline:trash' />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className='mt-4'>
                                <Button
                                  text='Add new'
                                  icon='heroicons-outline:plus'
                                  className='text-slate-600 p-0 dark:text-slate-300'
                                  onClick={() =>
                                    appendCoFounder({
                                      co_founder_name: '',
                                      co_founder_email: '',
                                      co_founder_mobile: '',
                                      co_founder_linkedin: '',
                                    })
                                  }
                                />
                              </div>
                            </div>

                            {/* Advisors Section */}
                            <div className='mt-4'>
                              <div className='text-slate-600 dark:text-slate-300 text-xs font-medium uppercase mb-4'>
                                Advisors
                              </div>
                              {advisorFields.map((field, index) => (
                                <div
                                  className='lg:grid-cols-5 md:grid-cols-4 grid-cols-1 grid gap-5 mb-5 last:mb-0'
                                  key={field.id}
                                >
                                  <Textinput
                                    label='Advisor Name'
                                    name={`advisors.${index}.advisor_name`}
                                    defaultValue={
                                      field.advisor_name || 'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter advisor name'
                                  />
                                  <Textinput
                                    label='Advisor Email'
                                    name={`advisors.${index}.advisor_email`}
                                    defaultValue={
                                      field.advisor_email || 'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter advisor email'
                                  />
                                  <Textinput
                                    label='Advisor Mobile'
                                    name={`advisors.${index}.advisor_mobile`}
                                    defaultValue={
                                      field.advisor_mobile || 'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter advisor mobile number'
                                  />
                                  <Textinput
                                    label='Advisor LinkedIn'
                                    name={`advisors.${index}.advisor_linkedin`}
                                    defaultValue={
                                      field.advisor_linkedin || 'Not provided'
                                    }
                                    register={register}
                                    placeholder='Enter advisor LinkedIn profile URL'
                                  />
                                  <div className='ml-auto mt-auto relative'>
                                    <button
                                      onClick={() => removeAdvisor(index)}
                                      type='button'
                                      className='inline-flex items-center justify-center h-10 w-10 bg-danger-500 text-lg border rounded border-danger-500 text-white'
                                    >
                                      <Icon icon='heroicons-outline:trash' />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className='mt-4'>
                                <Button
                                  text='Add new'
                                  icon='heroicons-outline:plus'
                                  className='text-slate-600 p-0 dark:text-slate-300'
                                  onClick={() =>
                                    appendAdvisor({
                                      advisor_name: '',
                                      advisor_email: '',
                                      advisor_mobile: '',
                                      advisor_linkedin: '',
                                    })
                                  }
                                />
                              </div>
                            </div>

                            {/* Co-Founder Agreement Upload */}
                            <InputGroup
                              label='Upload Co-Founder Agreement'
                              name='co_founder_agreement'
                              type='file'
                              register={register}
                              error={errors.co_founder_agreement}
                            />
                          </>
                        )}

                        {section.key === 'funding_info' && (
                          <>
                            <Textinput
                              label='Total Funding Ask'
                              name='total_funding_ask'
                              defaultValue={
                                fundingInformation?.total_funding_ask ||
                                fundingInformationLoc?.total_funding_ask
                              }
                              register={register}
                              placeholder='Enter total funding ask'
                            />
                            <Textinput
                              label='Amount Committed'
                              name='amount_committed'
                              defaultValue={
                                fundingInformation?.amount_committed ||
                                fundingInformationLoc?.amount_committed
                              }
                              register={register}
                              placeholder='Enter amount committed'
                            />
                            <Textinput
                              label='Government Grants'
                              name='government_grants'
                              defaultValue={
                                fundingInformation?.government_grants ||
                                fundingInformationLoc?.government_grants
                              }
                              register={register}
                              placeholder='Enter government grants'
                            />
                            <Textinput
                              label='Equity Split'
                              name='equity_split'
                              defaultValue={
                                fundingInformation?.equity_split ||
                                fundingInformationLoc?.equity_split
                              }
                              register={register}
                              placeholder='Enter equity split'
                            />
                            <Textarea
                              label='Fund Utilization'
                              name='fund_utilization'
                              defaultValue={
                                fundingInformation?.fund_utilization ||
                                fundingInformationLoc?.fund_utilization
                              }
                              register={register}
                              placeholder='Describe fund utilization'
                            />
                            <Textinput
                              label='ARR'
                              name='arr'
                              defaultValue={
                                fundingInformation?.arr ||
                                fundingInformationLoc?.arr
                              }
                              register={register}
                              placeholder='Enter ARR'
                            />
                            <Textinput
                              label='MRR'
                              name='mrr'
                              defaultValue={
                                fundingInformation?.mrr ||
                                fundingInformationLoc?.mrr
                              }
                              register={register}
                              placeholder='Enter MRR'
                            />

                            {/* Funding Repeater Section */}
                            <div className='mt-4'>
                              <div className='text-slate-600 dark:text-slate-300 text-xs font-medium uppercase mb-4'>
                                Previous Funding Information
                              </div>
                              {fundingFields.map((item, index) => (
                                <div
                                  className='lg:grid-cols-5 md:grid-cols-4 grid-cols-1 grid gap-5 mb-5 last:mb-0'
                                  key={item.id}
                                >
                                  <Textinput
                                    label='Investor Name'
                                    type='text'
                                    id={`investorName${index}`}
                                    placeholder='Investor Name'
                                    register={register}
                                    name={`funding[${index}].investorName`}
                                  />
                                  <Textinput
                                    label='Firm Name'
                                    type='text'
                                    id={`firmName${index}`}
                                    placeholder='Firm Name'
                                    register={register}
                                    name={`funding[${index}].firmName`}
                                  />
                                  <Textinput
                                    label='Investor Type'
                                    type='text'
                                    id={`investorType${index}`}
                                    placeholder='Investor Type'
                                    register={register}
                                    name={`funding[${index}].investorType`}
                                  />
                                  <Textinput
                                    label='Amount Raised'
                                    type='number'
                                    id={`amountRaised${index}`}
                                    placeholder='Amount Raised'
                                    register={register}
                                    name={`funding[${index}].amountRaised`}
                                  />
                                  <div className='ml-auto mt-auto relative'>
                                    <button
                                      onClick={() => removeFunding(index)}
                                      type='button'
                                      className='inline-flex items-center justify-center h-10 w-10 bg-danger-500 text-lg border rounded border-danger-500 text-white'
                                    >
                                      <Icon icon='heroicons-outline:trash' />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className='mt-4'>
                                <Button
                                  text='Add new'
                                  icon='heroicons-outline:plus'
                                  className='text-slate-600 p-0 dark:text-slate-300'
                                  onClick={() =>
                                    appendFunding({
                                      investorName: '',
                                      firmName: '',
                                      investorType: '',
                                      amountRaised: '',
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className='mt-4'>
                              <div className='text-slate-600 dark:text-slate-300 text-xs font-medium uppercase mb-4'>
                                Cap Table
                              </div>
                              {capTableFields.map((item, index) => (
                                <div
                                  className='lg:grid-cols-5 md:grid-cols-4 grid-cols-1 grid gap-5 mb-5 last:mb-0'
                                  key={item.id}
                                >
                                  <Textinput
                                    label='Role'
                                    type='text'
                                    id={`role${index}`}
                                    placeholder='e.g., Founder, Investor'
                                    register={register}
                                    name={`capTable[${index}].role`}
                                    defaultValue={item.role || ''}
                                  />
                                  <Textinput
                                    label='Percentage'
                                    type='number'
                                    id={`percentage${index}`}
                                    placeholder='Percentage'
                                    register={register}
                                    name={`capTable[${index}].percentage`}
                                    defaultValue={item.percentage || ''}
                                  />
                                  <div className='ml-auto mt-auto relative'>
                                    <button
                                      onClick={() => removeCapTable(index)}
                                      type='button'
                                      className='inline-flex items-center justify-center h-10 w-10 bg-danger-500 text-lg border rounded border-danger-500 text-white'
                                    >
                                      <Icon icon='heroicons-outline:trash' />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div className='mt-4'>
                                <Button
                                  text='Add new'
                                  icon='heroicons-outline:plus'
                                  className='text-slate-600 p-0 dark:text-slate-300'
                                  onClick={() =>
                                    appendCapTable({ role: '', percentage: '' })
                                  }
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {section.key === 'company_documents' && (
                          <>
                            <InputGroup
                              label={
                                <>
                                  Upload Certificate of Incorporation&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Certificate of
                                    Incorporation, you can create one&nbsp;
                                    <a
                                      href='link_to_creation_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </>
                              }
                              type='file'
                              name='certificateOfIncorporation'
                              register={register}
                              placeholder='Upload Certificate of Incorporation'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload GST Certificate&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this GST Certificate, you
                                    can apply for one&nbsp;
                                    <a
                                      href='link_to_application_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='gstCertificate'
                              register={register}
                              placeholder='Upload GST Certificate'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload Trademark&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Trademark file, you
                                    can apply for one&nbsp;
                                    <a
                                      href='link_to_application_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='trademark'
                              register={register}
                              placeholder='Upload Trademark'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload Copyright&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Copyright file, you
                                    can apply for one&nbsp;
                                    <a
                                      href='link_to_application_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='copyright'
                              register={register}
                              placeholder='Upload Copyright'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload Patent&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Patent file, you can
                                    apply for one&nbsp;
                                    <a
                                      href='link_to_application_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='patent'
                              register={register}
                              placeholder='Upload Patent'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload Startup India Certificate&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Startup India
                                    Certificate, you can register&nbsp;
                                    <a
                                      href='link_to_registration_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='startupIndiaCertificate'
                              register={register}
                              placeholder='Upload Startup India Certificate'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your Due-Diligence Report&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Due-Diligence
                                    Report, you can consult with an expert&nbsp;
                                    <a
                                      href='link_to_consultation_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='dueDiligenceReport'
                              register={register}
                              placeholder='Upload Due-Diligence Report'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your Business Valuation Report&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Business Valuation
                                    Report, you can get one&nbsp;
                                    <a
                                      href='link_to_valuation_service'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='businessValuationReport'
                              register={register}
                              placeholder='Upload Business Valuation Report'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your MIS&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this MIS file, you can
                                    consult with your finance team&nbsp;
                                    <a
                                      href='link_to_finance_team_contact'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='mis'
                              register={register}
                              placeholder='Upload MIS'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your Financial Projections&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Financial
                                    Projections file, you can consult with a
                                    financial advisor&nbsp;
                                    <a
                                      href='link_to_financial_advisor'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='financialProjections'
                              register={register}
                              placeholder='Upload Financial Projections'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your Balance Sheet&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Balance Sheet, you
                                    can generate one&nbsp;
                                    <a
                                      href='link_to_generation_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='balanceSheet'
                              register={register}
                              placeholder='Upload Balance Sheet'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your P&L Statement&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this P&L Statement, you
                                    can generate one&nbsp;
                                    <a
                                      href='link_to_generation_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='plStatement'
                              register={register}
                              placeholder='Upload P&L Statement'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your Cashflow Statement&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Cashflow Statement,
                                    you can generate one&nbsp;
                                    <a
                                      href='link_to_generation_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='cashflowStatement'
                              register={register}
                              placeholder='Upload Cashflow Statement'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload Pitch Deck&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have a Pitch Deck, you can
                                    create one&nbsp;
                                    <a
                                      href='link_to_creation_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='pitchDeck'
                              register={register}
                              placeholder='Upload Pitch Deck'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload Video Pitch&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have a Video Pitch, you can
                                    create one&nbsp;
                                    <a
                                      href='link_to_creation_page'
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-500 underline'
                                    >
                                      here
                                    </a>
                                    )
                                  </span>
                                </div>
                              }
                              type='file'
                              name='videoPitch'
                              register={register}
                              placeholder='Upload Video Pitch'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your SHA (Previous round/ existing
                                  round)&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this SHA, please upload
                                    the latest document)
                                  </span>
                                </div>
                              }
                              type='file'
                              name='sha'
                              register={register}
                              placeholder='Upload SHA'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your Termsheet (previous round/
                                  existing round)&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Termsheet, please
                                    upload the latest document)
                                  </span>
                                </div>
                              }
                              type='file'
                              name='termsheet'
                              register={register}
                              placeholder='Upload Termsheet'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your Employment Agreement&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this Employment
                                    Agreement, please upload the latest
                                    document)
                                  </span>
                                </div>
                              }
                              type='file'
                              name='employmentAgreement'
                              register={register}
                              placeholder='Upload Employment Agreement'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your MoU&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this MoU, please upload
                                    the latest document)
                                  </span>
                                </div>
                              }
                              type='file'
                              name='mou'
                              register={register}
                              placeholder='Upload MoU'
                            />

                            <InputGroup
                              label={
                                <div className='mt-4'>
                                  Upload your NDA&nbsp;
                                  <span className='text-xs text-gray-500'>
                                    (If you don't have this NDA, please upload
                                    the latest document)
                                  </span>
                                </div>
                              }
                              type='file'
                              name='nda'
                              register={register}
                              placeholder='Upload NDA'
                            />
                          </>
                        )}

                        {section.key === 'business_details' && (
                          <>
                            <Textinput
                              label='Current Traction'
                              name='current_traction'
                              defaultValue={
                                businessDetails?.current_traction ||
                                businessDetailsLoc?.current_traction
                              }
                              register={register}
                              placeholder='Enter current traction'
                            />
                            <Textinput
                              label='New Customers'
                              name='new_Customers'
                              defaultValue={
                                businessDetails?.new_Customers ||
                                businessDetailsLoc?.new_Customers
                              }
                              register={register}
                              placeholder='Enter number of new customers'
                            />
                            <Textinput
                              label='Customer Acquisition Cost'
                              name='customer_AcquisitionCost'
                              defaultValue={
                                businessDetails?.customer_AcquisitionCost ||
                                businessDetailsLoc?.customer_AcquisitionCost
                              }
                              register={register}
                              placeholder='Enter customer acquisition cost'
                            />
                            <Textinput
                              label='Customer Lifetime Value'
                              name='customer_Lifetime_Value'
                              defaultValue={
                                businessDetails?.customer_Lifetime_Value ||
                                businessDetailsLoc?.customer_Lifetime_Value
                              }
                              register={register}
                              placeholder='Enter customer lifetime value'
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
                                    {generalInformationLoc?.email ||
                                      user?.email}
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
                                      generalInformationLoc?.mobile ||
                                      user?.mobile
                                    }`}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {user?.mobile}
                                  </a>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:globe-alt' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    LINKEDIN
                                  </div>
                                  <a
                                    href={
                                      generalInformationLoc?.linkedin_profile ||
                                      user?.linkedin_profile
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {user?.linkedin_profile || 'Not provided'}
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
                                    {companyProfileLoc?.company_name ||
                                      user?.company_name ||
                                      companyProfile?.company_name ||
                                      'Not provided'}
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
                                    {companyProfileLoc?.incorporation_date ||
                                      companyProfile?.incorporation_date ||
                                      'Not provided'}
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
                                    {renderedCountry ||
                                      companyProfileLoc?.country ||
                                      'Not Provided'}
                                    ,{' '}
                                    {companyProfileLoc?.state_city ||
                                      companyProfile?.state_city ||
                                      'Not Provided'}
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
                                    {companyProfileLoc?.office_address ||
                                      companyProfile?.office_address ||
                                      'Not provided'}
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
                                    href={
                                      companyProfileLoc?.company_website ||
                                      companyProfile?.company_website ||
                                      '#'
                                    }
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyProfileLoc?.company_website ||
                                      companyProfile?.company_website ||
                                      'Not provided'}
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
                                    href={
                                      companyProfileLoc?.linkedin_profile ||
                                      companyProfile?.linkedin_profile ||
                                      '#'
                                    }
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyProfileLoc?.linkedin_profile ||
                                      companyProfile?.linkedin_profile ||
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
                                    BUSINESS DESCRIPTION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {companyProfileLoc?.short_description ||
                                      companyProfile?.short_description ||
                                      'Not provided'}
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
                                    {companyProfileLoc?.team_size ||
                                      companyProfile?.team_size ||
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
                                    CURRENT STAGE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {companyProfileLoc?.current_stage ||
                                      companyProfile?.current_stage ||
                                      'Not provided'}
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
                                    {companyProfileLoc?.target_audience ||
                                      companyProfile?.target_audience ||
                                      'Not provided'}
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
                                    {companyProfileLoc?.usp_moat ||
                                      companyProfile?.usp_moat ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:tag' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    INDUSTRY SECTOR
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {companyProfileLoc?.industry_sector ||
                                      companyProfile?.industry_sector ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    MEDIA PRESENCE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {companyProfileLoc?.media ||
                                      companyProfile?.media ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              {/* Social Media Handles */}
                              {(
                                companyProfileLoc?.social_media_handles ||
                                companyProfile?.social_media_handles
                              )?.map((handle, index) => (
                                <li
                                  className='flex space-x-3 rtl:space-x-reverse'
                                  key={index}
                                >
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:share' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      {handle.platform || 'Not provided'}
                                    </div>
                                    <a
                                      href={handle.url || '#'}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      {handle.url || 'Not provided'}
                                    </a>
                                  </div>
                                </li>
                              ))}

                              <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-200'>
                                Media Presence Links
                              </h3>

                              {(
                                companyProfileLoc?.media_presence ||
                                companyProfile?.media_presence
                              )?.map((presence, index) => (
                                <li
                                  className='flex space-x-3 rtl:space-x-reverse'
                                  key={index}
                                >
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:newspaper' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      {presence.platform || 'Not provided'}
                                    </div>
                                    <a
                                      href={presence.url || '#'}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      {presence.url || 'Not provided'}
                                    </a>
                                  </div>
                                </li>
                              ))}
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
                                    {founderInformationLoc?.founder_name ||
                                      founderInformation?.founder_name ||
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
                                    FOUNDER EMAIL
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {founderInformationLoc?.founder_email ||
                                      founderInformation?.founder_email ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:phone' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    FOUNDER MOBILE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {founderInformationLoc?.founder_mobile ||
                                      founderInformation?.founder_mobile ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:link' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    FOUNDER LINKEDIN
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {founderInformationLoc?.founder_linkedin ||
                                      user.linkedin_profile ||
                                      founderInformation?.founder_linkedin ||
                                      'Not provided'}
                                  </div>
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
                                    {founderInformationLoc?.degree_name ||
                                      founderInformation?.degree_name ||
                                      'Not provided'}
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
                                    {founderInformationLoc?.college_name ||
                                      founderInformation?.college_name ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:calendar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    GRADUATION YEAR
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {founderInformationLoc?.graduation_year ||
                                      founderInformation?.graduation_year ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>

                              {/* Advisors Section */}
                              {founderInformation?.advisors?.map(
                                (advisor, index) => (
                                  <li
                                    key={index}
                                    className='flex space-x-3 rtl:space-x-reverse'
                                  >
                                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                      <Icon icon='heroicons:user-group' />
                                    </div>
                                    <div className='flex-1'>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Advisor Name: ${
                                          advisor.advisor_name || 'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Advisor Email: ${
                                          advisor.advisor_email ||
                                          'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Advisor Mobile: ${
                                          advisor.advisor_mobile ||
                                          'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Advisor LinkedIn: ${
                                          advisor.advisor_linkedin ||
                                          'Not provided'
                                        }`}
                                      </div>
                                    </div>
                                  </li>
                                )
                              )}

                              {/* Co-Founders Section */}
                              {founderInformation?.co_founders?.map(
                                (coFounder, index) => (
                                  <li
                                    key={index}
                                    className='flex space-x-3 rtl:space-x-reverse'
                                  >
                                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                      <Icon icon='heroicons:user-group' />
                                    </div>
                                    <div className='flex-1'>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Co-Founder Name: ${
                                          coFounder.co_founder_name ||
                                          'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Co-Founder Email: ${
                                          coFounder.co_founder_email ||
                                          'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Co-Founder Mobile: ${
                                          coFounder.co_founder_mobile ||
                                          'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Co-Founder LinkedIn: ${
                                          coFounder.co_founder_linkedin ||
                                          'Not provided'
                                        }`}
                                      </div>
                                    </div>
                                  </li>
                                )
                              )}

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CO-FOUNDER AGREEMENT
                                  </div>
                                  <a
                                    href={
                                      founderInformationLoc?.co_founder_agreement ||
                                      founderInformation?.co_founder_agreement ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    View Agreement
                                  </a>
                                </div>
                              </li>
                            </>
                          )}

                          {section.key === 'CTO_info' && (
                            <>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:user' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CTO NAME
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {ctoInfoLoc?.cto_name ||
                                      ctoInfo?.cto_name ||
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
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {ctoInfoLoc?.cto_email ||
                                      ctoInfo?.cto_email ||
                                      'Not provided'}
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
                                    {ctoInfoLoc?.cto_mobile ||
                                      ctoInfo?.cto_mobile ||
                                      'Not provided'}
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
                                      ctoInfoLoc?.cto_linkedin ||
                                      ctoInfo?.cto_linkedin ||
                                      '#'
                                    }
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {ctoInfoLoc?.cto_linkedin ||
                                      ctoInfo?.cto_linkedin ||
                                      'Not provided'}
                                  </a>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:users' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TECH TEAM SIZE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {ctoInfoLoc?.tech_team_size ||
                                      ctoInfo?.tech_team_size ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:link' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    MOBILE APP LINK (IOS)
                                  </div>
                                  <a
                                    href={
                                      ctoInfoLoc?.mobile_app_link_ios ||
                                      ctoInfo?.mobile_app_link_ios ||
                                      '#'
                                    }
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {ctoInfoLoc?.mobile_app_link_ios ||
                                      ctoInfo?.mobile_app_link_ios ||
                                      'Not provided'}
                                  </a>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:link' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    MOBILE APP LINK (Android)
                                  </div>
                                  <a
                                    href={
                                      ctoInfoLoc?.mobile_app_link_android ||
                                      ctoInfo?.mobile_app_link_android ||
                                      '#'
                                    }
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {ctoInfoLoc?.mobile_app_link_android ||
                                      ctoInfo?.mobile_app_link_android ||
                                      'Not provided'}
                                  </a>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TECHNOLOGY ROADMAP
                                  </div>
                                  <a
                                    href={
                                      ctoInfoLoc?.technology_roadmap ||
                                      ctoInfo?.technology_roadmap ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {ctoInfoLoc?.technology_roadmap
                                      ? 'View Technology Roadmap'
                                      : 'Not provided'}
                                  </a>
                                </div>
                              </li>
                            </>
                          )}

                          {section.key === 'business_details' && (
                            <>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:presentation-chart-line' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CURRENT TRACTION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {businessDetailsLoc?.current_traction ||
                                      businessDetails?.current_traction ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:user-plus' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    HOW MANY NEW CUSTOMERS YOU OBTAINED IN THE 6
                                    MONTHS?
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {businessDetailsLoc?.new_Customers ||
                                      businessDetails?.new_Customers ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:banknotes' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    WHAT IS YOUR CUSTOMER ACQUISITION COST?
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {businessDetailsLoc?.customer_AcquisitionCost ||
                                      businessDetails?.customer_AcquisitionCost ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:currency-dollar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    WHAT IS THE LIFETIME VALUE OF YOUR CUSTOMER?
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {businessDetailsLoc?.customer_Lifetime_Value ||
                                      businessDetails?.customer_Lifetime_Value ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>
                            </>
                          )}

                          {section.key === 'company_documents' && (
                            <>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CERTIFICATE OF INCORPORATION
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.certificate_of_incorporation ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.certificate_of_incorporation
                                      ? 'View Certificate'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    GST CERTIFICATE
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.gst_certificate || '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.gst_certificate
                                      ? 'View Certificate'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TRADEMARK
                                  </div>
                                  <a
                                    href={companyDocuments?.trademark || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.trademark
                                      ? 'View Trademark'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    COPYRIGHT
                                  </div>
                                  <a
                                    href={companyDocuments?.copyright || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.copyright
                                      ? 'View Copyright'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    PATENT
                                  </div>
                                  <a
                                    href={companyDocuments?.patent || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.patent
                                      ? 'View Patent'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    STARTUP INDIA CERTIFICATE
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.startup_india_certificate ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.startup_india_certificate
                                      ? 'View Certificate'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    DUE DILIGENCE REPORT
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.due_diligence_report ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.due_diligence_report
                                      ? 'View Report'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    BUSINESS VALUATION REPORT
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.business_valuation_report ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.business_valuation_report
                                      ? 'View Report'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    MIS
                                  </div>
                                  <a
                                    href={companyDocuments?.mis || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.mis
                                      ? 'View MIS'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    FINANCIAL PROJECTIONS
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.financial_projections ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.[0]
                                      ?.financial_projections
                                      ? 'View Projections'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    BALANCE SHEET
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.balance_sheet || '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.balance_sheet
                                      ? 'View Balance Sheet'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    P&L STATEMENT
                                  </div>
                                  <a
                                    href={companyDocuments?.pl_statement || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.pl_statement
                                      ? 'View P&L Statement'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CASHFLOW STATEMENT
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.cashflow_statement ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.cashflow_statement
                                      ? 'View Cashflow Statement'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    PITCH DECK
                                  </div>
                                  <a
                                    href={companyDocuments?.pitch_deck || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.pitch_deck
                                      ? 'View Pitch Deck'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    VIDEO PITCH
                                  </div>
                                  <a
                                    href={companyDocuments?.video_pitch || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.video_pitch
                                      ? 'View Video Pitch'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    SHA (PREVIOUS/EXISTING ROUND)
                                  </div>
                                  <a
                                    href={companyDocuments?.sha || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.sha
                                      ? 'View SHA'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TERMSHEET (PREVIOUS/EXISTING ROUND)
                                  </div>
                                  <a
                                    href={companyDocuments?.termsheet || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.termsheet
                                      ? 'View Termsheet'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    EMPLOYMENT AGREEMENT
                                  </div>
                                  <a
                                    href={
                                      companyDocuments?.employment_agreement ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.employment_agreement
                                      ? 'View Agreement'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    MOU
                                  </div>
                                  <a
                                    href={companyDocuments?.mou || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.mou
                                      ? 'View MoU'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    NDA
                                  </div>
                                  <a
                                    href={companyDocuments?.nda || '#'}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocuments?.nda
                                      ? 'View NDA'
                                      : 'Not Provided'}
                                  </a>
                                </div>
                              </li>
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
                                    {fundingInformationLoc?.total_funding_ask ||
                                      fundingInformation?.total_funding_ask ||
                                      'Not provided'}
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
                                    {fundingInformationLoc?.amount_committed ||
                                      fundingInformation?.amount_committed ||
                                      'Not provided'}
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
                                    {fundingInformationLoc?.government_grants ||
                                      fundingInformation?.government_grants ||
                                      'Not provided'}
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
                                    {fundingInformationLoc?.equity_split ||
                                      fundingInformation?.equity_split ||
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
                                    FUND UTILIZATION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {fundingInformationLoc?.fund_utilization ||
                                      fundingInformation?.fund_utilization ||
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
                                    ARR
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {fundingInformationLoc?.arr ||
                                      fundingInformation?.arr ||
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
                                    MRR
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {fundingInformationLoc?.mrr ||
                                      fundingInformation?.mrr ||
                                      'Not provided'}
                                  </div>
                                </div>
                              </li>

                              {/* Render Previous Funding Information */}
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:banknotes' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    PREVIOUS FUNDING INFORMATION
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {fundingInformationLoc?.previous_funding
                                      ?.length > 0 ? (
                                      <ul>
                                        {fundingInformationLoc.previous_funding.map(
                                          (funding, index) => (
                                            <li key={index}>
                                              Investor Name:{' '}
                                              {funding.investorName ||
                                                'Not provided'}
                                              , Firm Name:{' '}
                                              {funding.firmName ||
                                                'Not provided'}
                                              , Investor Type:{' '}
                                              {funding.investorType ||
                                                'Not provided'}
                                              , Amount Raised:{' '}
                                              {funding.amountRaised ||
                                                'Not provided'}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    ) : (
                                      'Not provided'
                                    )}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CAP TABLE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {fundingInformationLoc?.cap_table?.length >
                                    0 ? (
                                      <ul>
                                        {fundingInformationLoc.cap_table.map(
                                          (entry, index) => (
                                            <li key={index}>
                                              {entry.role ||
                                                'Role not specified'}
                                              :{' '}
                                              {entry.percentage ||
                                                'Not provided'}
                                              %
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    ) : (
                                      'Not provided'
                                    )}
                                  </div>
                                </div>
                              </li>
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
