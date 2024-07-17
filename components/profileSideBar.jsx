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

const fileFields = [
  { name: 'company_logo', label: 'Company Logo' },
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
  { name: 'current_cap_table', label: 'Current Cap Table' },
  { name: 'technology_roadmap', label: 'Technology Roadmap' },
  { name: 'list_of_advisers', label: 'List of Advisers' },
  { name: 'trademark', label: 'Trademark' },
  { name: 'copyright', label: 'Copyright' },
  { name: 'patent', label: 'Patent' },
  { name: 'financial_projections', label: 'Financial Projections' },
  { name: 'balance_sheet', label: 'Balance Sheet' },
  { name: 'pl_statement', label: 'P&L Statement' },
  { name: 'cashflow_statement', label: 'Cashflow Statement' },
  { name: 'sha', label: 'SHA' },
  { name: 'termsheet', label: 'Termsheet' },
  { name: 'employment_agreement', label: 'Employment Agreement' },
  { name: 'mou', label: 'MoU' },
  { name: 'nda', label: 'NDA' },
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
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    updateUserLocally,
  } = useCompleteUserDetails();
  const {
    control,
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

  const { user, loading } = useUserDetails();
  const [editingSection, setEditingSection] = useState(null);
  const [founderInformationLoc, setFounderInformationLoc] = useState(null);
  const [companyProfileLoc, setCompanyProfileLoc] = useState(null);
  const [fundingInformationLoc, setFundingInformationLoc] = useState(null);
  const [ctoInfoLoc, setCtoInfoLoc] = useState(null);
  const [businessDetailsLoc, setBusinessDetailsLoc] = useState(null);
  const [companyDocumentsLoc, setCompanyDocumentsLoc] = useState(null);

  useEffect(() => {
    setFounderInformationLoc(founderInformation);
    setCompanyProfileLoc(companyProfile);
    setFundingInformationLoc(fundingInformation);
    setCtoInfoLoc(ctoInfo);
    setBusinessDetailsLoc(businessDetails);
    setCompanyDocumentsLoc(companyDocuments);
  }, [companyProfile]);

  const handleSave = async (data, section) => {
    try {
      // console.log('Saving data for section:', section, 'with data:', data);
      let updatedData;
      let changedData = {};
      const uploadedFiles = {};

      // Handle file uploads
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

          case 'company_documents':
            for (const [formField] of Object.entries(companyDocumentsFiles)) {
              if (data[formField] && data[formField][0]) {
                uploadedFiles[formField] = await handleFileUpload(
                  data[formField][0],
                  'documents',
                  companyProfile?.company_name || data.company_name,
                  formField
                );
              }
            }
            break;

          case 'funding_info':
            if (data.current_cap_table && data.current_cap_table[0]) {
              uploadedFiles.current_cap_table = await handleFileUpload(
                data.current_cap_table[0],
                'documents',
                companyProfile?.company_name || data.company_name,
                'current_cap_table'
              );
            }
            break;

          // Add more cases for other sections as needed
        }
      };

      await handleUploads(data);

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
          console.log('companyProfile:', companyProfile);
          const emptyStartupDetails =
            !companyProfile?.id || !companyProfileLoc?.id;
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
            socialMedia: data.socialMedia || [], // Ensure this is handled correctly as JSONB
          };

          try {
            console.log('uploadFiles:', uploadedFiles);
            let startupDetailsResponse;
            console.log('emptyStartupDetails:', emptyStartupDetails);
            if (emptyStartupDetails) {
              startupDetailsResponse = await insertStartupDetails(
                startupData,
                user.id,
                uploadedFiles
              );
            } else {
              console.log('emptyStartupDetails:', emptyStartupDetails);
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
              console.log(
                `${
                  emptyStartupDetails ? 'Inserted' : 'Updated'
                } startup details:`,
                updatedData
              );
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
          const emptyFounderInfo =
            !founderInformation?.id || !founderInformationLoc?.id;
          const founderData = {
            company_id: companyProfile?.id,
            founder_name: data.founder_name || null,
            founder_email: data.founder_email || null,
            founder_mobile: data.founder_mobile || null,
            founder_linkedin: data.founder_linkedin || null,
            degree_name: data.degree_name || null,
            college_name: data.college_name || null,
            graduation_year: data.graduation_year || null,
            advisors: data.advisors || [], // Ensure this is handled correctly as JSONB
            co_founders: data.co_founders || [], // Ensure this is handled correctly as JSONB
            co_founder_agreement: uploadedFiles.co_founder_agreement || null,
          };

          try {
            let founderInfoResponse;
            if (emptyFounderInfo) {
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

            if (founderInfoResponse) {
              updatedData = founderInfoResponse;
              console.log(
                `${
                  emptyFounderInfo ? 'Inserted' : 'Updated'
                } founder information:`,
                updatedData
              );
              setFounderInformationLoc(updatedData);
            } else {
              console.error('Unexpected response format:', founderInfoResponse);
            }
          } catch (error) {
            console.error('Error handling founder information:', error);
          }
          break;

        case 'CTO_info':
          const emptyCtoInfo = !ctoInfo?.id || !ctoInfoLoc?.id;
          changedData = {
            company_id: companyProfile?.id,
            cto_name: data.cto_name || null,
            cto_email: data.cto_email || null,
            cto_mobile: data.cto_mobile || null,
            cto_linkedin: data.cto_linkedin || null,
            tech_team_size: data.tech_team_size || null,
            mobile_app_link: data.mobile_app_link || null,
            technology_roadmap: uploadedFiles.technology_roadmap || null,
          };

          if (emptyCtoInfo) {
            const ctoInfoResponse = await insertCTODetails(
              companyProfile.id,
              changedData,
              uploadedFiles
            );
            if (ctoInfoResponse.error) {
              throw ctoInfoResponse.error;
            }
            updatedData = ctoInfoResponse;
            console.log('Inserted CTO details:', updatedData);
            setCtoInfoLoc(updatedData);
          } else {
            const ctoInfoResponse = await updateCTODetails(
              companyProfile.id,
              changedData,
              uploadedFiles
            );
            if (ctoInfoResponse.error) {
              throw ctoInfoResponse.error;
            }
            updatedData = ctoInfoResponse.data;
            console.log('Updated CTO details:', updatedData);
            setCtoInfoLoc(updatedData);
          }
          break;

        case 'company_documents':
          console.log(companyDocuments[0]?.id);
          const emptyCompanyDocuments =
            !companyDocuments[0]?.id || !companyDocumentsLoc?.id;
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

          console.log('Changed Data for company_documents:', data);
          console.log(emptyCompanyDocuments);
          try {
            if (emptyCompanyDocuments) {
              const companyDocumentsResponse = await insertCompanyDocuments(
                companyProfile.id,
                companyUploadedFiles
              );
              if (companyDocumentsResponse.error) {
                throw companyDocumentsResponse.error;
              }
              updatedData = companyDocumentsResponse;
              console.log('Inserted company documents:', updatedData);
            } else {
              const companyDocumentsResponse = await updateCompanyDocuments(
                companyProfile.id,
                companyUploadedFiles
              );
              if (companyDocumentsResponse.error) {
                throw companyDocumentsResponse.error;
              }
              updatedData = companyDocumentsResponse.data;
              console.log('Updated company documents:', updatedData);
            }
            setCompanyDocumentsLoc(updatedData);
          } catch (error) {
            console.error('Error saving company documents:', error);
          }
          break;

        case 'business_details':
          const emptyBusinessDetails =
            !businessDetails?.id || !businessDetailsLoc?.id;
          changedData = {
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
                changedData
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
                changedData
              );
              if (businessDetailsResponse.error) {
                throw businessDetailsResponse.error;
              }
              updatedData = businessDetailsResponse.data;
              console.log('Updated business details:', updatedData);
              setBusinessDetailsLoc(updatedData);
              console.log('Business Details:', businessDetailsLoc);
            }
            console.log('Data saved successfully:', updatedData);
          } catch (error) {
            console.error('Error saving business details:', error);
          }
          break;

        case 'funding_info':
          const emptyFundingInfo =
            !fundingInformation?.id || !fundingInformationLoc?.id;
          const fundingData = {
            company_id: companyProfile?.id,
            total_funding_ask: data.total_funding_ask || null,
            amount_committed: data.amount_committed || null,
            current_cap_table: uploadedFiles.current_cap_table || null,
            government_grants: data.government_grants || null,
            equity_split: data.equity_split || null,
            fund_utilization: data.fund_utilization || null,
            arr: data.arr || null,
            mrr: data.mrr || null,
            previous_funding: data.funding || [], // Ensure this is handled correctly as JSONB
          };

          try {
            let fundingInfoResponse;
            if (emptyFundingInfo) {
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

            if (fundingInfoResponse) {
              updatedData = fundingInfoResponse;
              console.log(
                `${
                  emptyFundingInfo ? 'Inserted' : 'Updated'
                } funding information:`,
                updatedData
              );
              setFundingInformationLoc(updatedData);
            } else {
              console.error('Unexpected response format:', fundingInfoResponse);
            }
          } catch (error) {
            console.error('Error handling funding information:', error);
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
                              defaultValue={user?.company_name}
                              placeholder='Enter your company name'
                              register={register}
                              readOnly={!!user?.company_name} // This makes the input read-only if there is a default value
                            />

                            <Textinput
                              label='Incorporation Date'
                              type='date'
                              name='incorporation_date'
                              defaultValue={
                                companyProfileLoc?.incorporation_date
                              }
                              placeholder='Select the incorporation date'
                              register={register}
                            />
                            <Controller
                              name='country'
                              control={control}
                              defaultValue=''
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
                                    register={register}
                                    styles={{
                                      option: (provided) => ({
                                        ...provided,
                                        fontSize: '14px',
                                      }),
                                    }}
                                    className='react-select'
                                    classNamePrefix='select'
                                    defaultValue={countries[0]}
                                  />
                                </div>
                              )}
                            />

                            <Textinput
                              label='State/City'
                              name='state_city'
                              defaultValue={companyProfileLoc?.state_city}
                              placeholder='Enter the state or city'
                              register={register}
                            />
                            <Textinput
                              label='Office Address'
                              name='office_address'
                              defaultValue={companyProfileLoc?.office_address}
                              placeholder='Enter the office address'
                              register={register}
                            />
                            <Textinput
                              label='Company Website'
                              name='company_website'
                              defaultValue={companyProfileLoc?.company_website}
                              placeholder='Enter the company website URL'
                              register={register}
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='linkedin_profile'
                              defaultValue={companyProfileLoc?.linkedin_profile}
                              placeholder='Enter the LinkedIn profile URL'
                              register={register}
                            />
                            <Textarea
                              label='Business Description'
                              name='short_description'
                              defaultValue={
                                companyProfileLoc?.short_description
                              }
                              placeholder='Provide a brief business description'
                              register={register}
                            />
                            <CustomSelect
                              label='Target Audience'
                              name='target_audience'
                              defaultValue={companyProfileLoc?.target_audience}
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
                              defaultValue={companyProfileLoc?.industry_sector}
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
                              defaultValue={companyProfileLoc?.team_size}
                              placeholder='Enter the team size'
                              register={register}
                            />
                            <Textinput
                              label='Current Stage'
                              name='current_stage'
                              defaultValue={companyProfileLoc?.current_stage}
                              placeholder='Enter the current stage'
                              register={register}
                            />
                            <Textarea
                              label='USP/MOAT'
                              name='usp_moat'
                              defaultValue={companyProfileLoc?.usp_moat}
                              placeholder='Describe the USP/MOAT'
                              register={register}
                            />
                            <CustomSelect
                              label='Is your startup in media?'
                              name='media'
                              defaultValue={companyProfileLoc?.media}
                              options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                              ]}
                              placeholder='Is your startup in media?'
                              register={register}
                            />
                            <InputGroup
                              label='Upload Company Logo'
                              type='file'
                              name='company_logo'
                              error={errors.company_logo}
                              register={register}
                            />
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
                              defaultValue={ctoInfoLoc?.cto_name}
                              register={register}
                              placeholder='Enter CTO name'
                            />
                            <Textinput
                              label='Email'
                              name='cto_email'
                              defaultValue={ctoInfoLoc?.cto_email}
                              register={register}
                              placeholder='Enter CTO email'
                            />
                            <Textinput
                              label='Mobile Number'
                              name='cto_mobile'
                              defaultValue={ctoInfoLoc?.cto_mobile}
                              register={register}
                              placeholder='Enter CTO mobile number'
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='cto_linkedin'
                              defaultValue={ctoInfoLoc?.cto_linkedin}
                              register={register}
                              placeholder='Enter CTO LinkedIn profile URL'
                            />
                            <Textinput
                              label='Tech Team Size'
                              type='number'
                              name='tech_team_size'
                              defaultValue={ctoInfoLoc?.tech_team_size}
                              register={register}
                              placeholder='Enter tech team size'
                            />
                            <Textinput
                              label='Mobile App Link'
                              name='mobile_app_link'
                              defaultValue={ctoInfoLoc?.mobile_app_link}
                              register={register}
                              placeholder='Enter mobile app link'
                            />
                            <InputGroup
                              label='Upload Technology Roadmap'
                              name='technology_roadmap'
                              type='file'
                              register={register}
                              defaultValue={ctoInfoLoc?.technology_roadmap}
                              error={errors.technology_roadmap}
                            />
                          </>
                        )}
                        {section.key === 'founder_info' && (
                          <>
                            <Textinput
                              label='Founder Name'
                              name='founder_name'
                              defaultValue={
                                founderInformationLoc?.founder_name ||
                                founderInformation?.founder_name ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder name'
                            />
                            <Textinput
                              label='Email'
                              name='founder_email'
                              defaultValue={
                                founderInformationLoc?.founder_email ||
                                founderInformation?.founder_email ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder email'
                            />
                            <Textinput
                              label='Mobile Number'
                              name='founder_mobile'
                              defaultValue={
                                founderInformationLoc?.founder_mobile ||
                                founderInformation?.founder_mobile ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder mobile number'
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='founder_linkedin'
                              defaultValue={
                                founderInformationLoc?.founder_linkedin ||
                                founderInformation?.founder_linkedin ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter founder LinkedIn profile URL'
                            />
                            <Textinput
                              label='Degree Name'
                              name='degree_name'
                              defaultValue={
                                founderInformationLoc?.degree_name ||
                                founderInformation?.degree_name ||
                                'Not provided'
                              }
                              register={register}
                              placeholder='Enter degree name'
                            />
                            <Textinput
                              label='College Name'
                              name='college_name'
                              defaultValue={
                                founderInformationLoc?.college_name ||
                                founderInformation?.college_name ||
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
                                founderInformationLoc?.graduation_year ||
                                founderInformation?.graduation_year ||
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
                                fundingInformationLoc?.total_funding_ask
                              }
                              register={register}
                              placeholder='Enter total funding ask'
                            />
                            <Textinput
                              label='Amount Committed'
                              name='amount_committed'
                              defaultValue={
                                fundingInformationLoc?.amount_committed
                              }
                              register={register}
                              placeholder='Enter amount committed'
                            />
                            <Textinput
                              label='Government Grants'
                              name='government_grants'
                              defaultValue={
                                fundingInformationLoc?.government_grants
                              }
                              register={register}
                              placeholder='Enter government grants'
                            />
                            <Textinput
                              label='Equity Split'
                              name='equity_split'
                              defaultValue={fundingInformationLoc?.equity_split}
                              register={register}
                              placeholder='Enter equity split'
                            />
                            <Textarea
                              label='Fund Utilization'
                              name='fund_utilization'
                              defaultValue={
                                fundingInformationLoc?.fund_utilization
                              }
                              register={register}
                              placeholder='Describe fund utilization'
                            />
                            <Textinput
                              label='ARR'
                              name='arr'
                              defaultValue={fundingInformationLoc?.arr}
                              register={register}
                              placeholder='Enter ARR'
                            />
                            <Textinput
                              label='MRR'
                              name='mrr'
                              defaultValue={fundingInformationLoc?.mrr}
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
                          </>
                        )}

                        {section.key === 'company_documents' && (
                          <>
                            <InputGroup
                              label='Upload Certificate of Incorporation'
                              type='file'
                              name='certificateOfIncorporation'
                              defaultValue={
                                companyDocuments?.certificate_of_incorporation
                              }
                              register={register}
                              placeholder='Upload Certificate of Incorporation'
                            />
                            <InputGroup
                              label='Upload GST Certificate'
                              type='file'
                              name='gstCertificate'
                              defaultValue={companyDocuments?.gst_certificate}
                              register={register}
                              placeholder='Upload GST Certificate'
                            />
                            <InputGroup
                              label='Upload Trademark'
                              type='file'
                              name='trademark'
                              defaultValue={companyDocuments?.trademark}
                              register={register}
                              placeholder='Upload Trademark'
                            />
                            <InputGroup
                              label='Upload Copyright'
                              type='file'
                              name='copyright'
                              defaultValue={companyDocuments?.copyright}
                              register={register}
                              placeholder='Upload Copyright'
                            />
                            <InputGroup
                              label='Upload Patent'
                              type='file'
                              name='patent'
                              defaultValue={companyDocuments?.patent}
                              register={register}
                              placeholder='Upload Patent'
                            />
                            <InputGroup
                              label='Upload Startup India Certificate'
                              type='file'
                              name='startupIndiaCertificate'
                              defaultValue={
                                companyDocuments?.startup_india_certificate
                              }
                              register={register}
                              placeholder='Upload Startup India Certificate'
                            />
                            <InputGroup
                              label='Upload your Due-Diligence Report'
                              type='file'
                              name='dueDiligenceReport'
                              defaultValue={
                                companyDocuments?.due_diligence_report
                              }
                              register={register}
                              placeholder='Upload Due-Diligence Report'
                            />
                            <InputGroup
                              label='Upload your Business Valuation report'
                              type='file'
                              name='businessValuationReport'
                              defaultValue={
                                companyDocuments?.business_valuation_report
                              }
                              register={register}
                              placeholder='Upload Business Valuation Report'
                            />
                            <InputGroup
                              label='Upload your MIS'
                              type='file'
                              name='mis'
                              defaultValue={companyDocuments?.mis}
                              register={register}
                              placeholder='Upload MIS'
                            />
                            <InputGroup
                              label='Upload your financial projections'
                              type='file'
                              name='financialProjections'
                              defaultValue={
                                companyDocuments?.financial_projections
                              }
                              register={register}
                              placeholder='Upload Financial Projections'
                            />
                            <InputGroup
                              label='Upload your balance sheet'
                              type='file'
                              name='balanceSheet'
                              defaultValue={companyDocuments?.balance_sheet}
                              register={register}
                              placeholder='Upload Balance Sheet'
                            />
                            <InputGroup
                              label='Upload your P&L Statement'
                              type='file'
                              name='plStatement'
                              defaultValue={companyDocuments?.pl_statement}
                              register={register}
                              placeholder='Upload P&L Statement'
                            />
                            <InputGroup
                              label='Upload your cashflow statement'
                              type='file'
                              name='cashflowStatement'
                              defaultValue={
                                companyDocuments?.cashflow_statement
                              }
                              register={register}
                              placeholder='Upload Cashflow Statement'
                            />
                            <InputGroup
                              label='Upload Pitch Deck'
                              type='file'
                              name='pitchDeck'
                              defaultValue={companyDocuments?.pitch_deck}
                              register={register}
                              placeholder='Upload Pitch Deck'
                            />
                            <InputGroup
                              label='Upload Video Pitch'
                              type='file'
                              name='videoPitch'
                              defaultValue={companyDocuments?.video_pitch}
                              register={register}
                              placeholder='Upload Video Pitch'
                            />
                            <InputGroup
                              label='Upload your SHA (Previous round/ existing round)'
                              type='file'
                              name='sha'
                              defaultValue={companyDocuments?.sha}
                              register={register}
                              placeholder='Upload SHA'
                            />
                            <InputGroup
                              label='Upload your Termsheet (previous round/ existing round)'
                              type='file'
                              name='termsheet'
                              defaultValue={companyDocuments?.termsheet}
                              register={register}
                              placeholder='Upload Termsheet'
                            />
                            <InputGroup
                              label='Upload your employment agreement'
                              type='file'
                              name='employmentAgreement'
                              defaultValue={
                                companyDocuments?.employment_agreement
                              }
                              register={register}
                              placeholder='Upload Employment Agreement'
                            />
                            <InputGroup
                              label='Upload your MoU'
                              type='file'
                              name='mou'
                              defaultValue={companyDocuments?.mou}
                              register={register}
                              placeholder='Upload MoU'
                            />
                            <InputGroup
                              label='Upload your NDA'
                              type='file'
                              name='nda'
                              defaultValue={companyDocuments?.nda}
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
                                businessDetailsLoc?.current_traction
                              }
                              register={register}
                              placeholder='Enter current traction'
                            />
                            <Textinput
                              label='New Customers'
                              name='new_Customers'
                              defaultValue={businessDetailsLoc?.new_Customers}
                              register={register}
                              placeholder='Enter number of new customers'
                            />
                            <Textinput
                              label='Customer Acquisition Cost'
                              name='customer_AcquisitionCost'
                              defaultValue={
                                businessDetailsLoc?.customer_AcquisitionCost
                              }
                              register={register}
                              placeholder='Enter customer acquisition cost'
                            />
                            <Textinput
                              label='Customer Lifetime Value'
                              name='customer_Lifetime_Value'
                              defaultValue={
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
                                    {user?.company_name ||
                                      companyProfileLoc?.company_name ||
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
                                    {companyProfileLoc?.country ||
                                      companyProfile?.country ||
                                      'Not provided'}
                                    ,{' '}
                                    {companyProfileLoc?.state_city ||
                                      companyProfile?.state_city ||
                                      'Not provided'}
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

                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    COMPANY LOGO
                                  </div>
                                  <a
                                    href={
                                      companyProfileLoc?.company_logo ||
                                      companyProfile?.company_logo ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyProfileLoc?.company_logo ||
                                    companyProfile?.company_logo
                                      ? 'View Company Logo'
                                      : 'Not provided'}
                                  </a>
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
                              {founderInformationLoc ? (
                                <>
                                  {founderInformationLoc?.advisors?.map(
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
                                              advisor.advisor_name ||
                                              'Not provided'
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
                                </>
                              ) : (
                                <>
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
                                              advisor.advisor_name ||
                                              'Not provided'
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
                                </>
                              )}

                              {founderInformationLoc?.co_founders?.map(
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
                                      'Not provided'
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
                                    MOBILE APP LINK
                                  </div>
                                  <a
                                    href={
                                      ctoInfoLoc?.mobile_app_link ||
                                      ctoInfo?.mobile_app_link ||
                                      '#'
                                    }
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {ctoInfoLoc?.mobile_app_link ||
                                      ctoInfo?.mobile_app_link ||
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
                                    {ctoInfoLoc?.technology_roadmap ||
                                    ctoInfo?.technology_roadmap
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
                                      companyDocumentsLoc?.certificate_of_incorporation ||
                                      companyDocuments?.[0]
                                        ?.certificate_of_incorporation ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.certificate_of_incorporation ||
                                    companyDocuments?.[0]
                                      ?.certificate_of_incorporation
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
                                      companyDocumentsLoc?.gst_certificate ||
                                      companyDocuments?.[0]?.gst_certificate ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.gst_certificate ||
                                    companyDocuments?.[0]?.gst_certificate
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
                                    href={
                                      companyDocumentsLoc?.trademark ||
                                      companyDocuments?.[0]?.trademark ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.trademark ||
                                    companyDocuments?.[0]?.trademark
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
                                    href={
                                      companyDocumentsLoc?.copyright ||
                                      companyDocuments?.[0]?.copyright ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.copyright ||
                                    companyDocuments?.[0]?.copyright
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
                                    href={
                                      companyDocumentsLoc?.patent ||
                                      companyDocuments?.[0]?.patent ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.patent ||
                                    companyDocuments?.[0]?.patent
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
                                      companyDocumentsLoc?.startup_india_certificate ||
                                      companyDocuments?.[0]
                                        ?.startup_india_certificate ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.startup_india_certificate ||
                                    companyDocuments?.[0]
                                      ?.startup_india_certificate
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
                                      companyDocumentsLoc?.due_diligence_report ||
                                      companyDocuments?.[0]
                                        ?.due_diligence_report ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.due_diligence_report ||
                                    companyDocuments?.[0]?.due_diligence_report
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
                                      companyDocumentsLoc?.business_valuation_report ||
                                      companyDocuments?.[0]
                                        ?.business_valuation_report ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.business_valuation_report ||
                                    companyDocuments?.[0]
                                      ?.business_valuation_report
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
                                    href={
                                      companyDocumentsLoc?.mis ||
                                      companyDocuments?.[0]?.mis ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.mis ||
                                    companyDocuments?.[0]?.mis
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
                                      companyDocumentsLoc?.financial_projections ||
                                      companyDocuments?.[0]
                                        ?.financial_projections ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.financial_projections ||
                                    companyDocuments?.[0]?.financial_projections
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
                                      companyDocumentsLoc?.balance_sheet ||
                                      companyDocuments?.[0]?.balance_sheet ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.balance_sheet ||
                                    companyDocuments?.[0]?.balance_sheet
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
                                    href={
                                      companyDocumentsLoc?.pl_statement ||
                                      companyDocuments?.[0]?.pl_statement ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.pl_statement ||
                                    companyDocuments?.[0]?.pl_statement
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
                                      companyDocumentsLoc?.cashflow_statement ||
                                      companyDocuments?.[0]
                                        ?.cashflow_statement ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.cashflow_statement ||
                                    companyDocuments?.[0]?.cashflow_statement
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
                                    href={
                                      companyDocumentsLoc?.pitch_deck ||
                                      companyDocuments?.[0]?.pitch_deck ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.pitch_deck ||
                                    companyDocuments?.[0]?.pitch_deck
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
                                    href={
                                      companyDocumentsLoc?.video_pitch ||
                                      companyDocuments?.[0]?.video_pitch ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.video_pitch ||
                                    companyDocuments?.[0]?.video_pitch
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
                                    href={
                                      companyDocumentsLoc?.sha ||
                                      companyDocuments?.[0]?.sha ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.sha ||
                                    companyDocuments?.[0]?.sha
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
                                    href={
                                      companyDocumentsLoc?.termsheet ||
                                      companyDocuments?.[0]?.termsheet ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.termsheet ||
                                    companyDocuments?.[0]?.termsheet
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
                                      companyDocumentsLoc?.employment_agreement ||
                                      companyDocuments?.[0]
                                        ?.employment_agreement ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.employment_agreement ||
                                    companyDocuments?.[0]?.employment_agreement
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
                                    href={
                                      companyDocumentsLoc?.mou ||
                                      companyDocuments?.[0]?.mou ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.mou ||
                                    companyDocuments?.[0]?.mou
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
                                    href={
                                      companyDocumentsLoc?.nda ||
                                      companyDocuments?.[0]?.nda ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyDocumentsLoc?.nda ||
                                    companyDocuments?.[0]?.nda
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
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:document' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CAP TABLE
                                  </div>
                                  <a
                                    href={
                                      fundingInformationLoc?.current_cap_table ||
                                      fundingInformation?.current_cap_table ||
                                      '#'
                                    }
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {fundingInformationLoc?.current_cap_table ||
                                    fundingInformation?.current_cap_table
                                      ? 'View Cap Table'
                                      : 'Not provided'}
                                  </a>
                                </div>
                              </li>
                              {/* Render Previous Funding Information */}
                              <div className='mt-4 text-slate-600 dark:text-slate-300 uppercase text-xs font-medium mb-1 leading-[12px]'>
                                Previous Funding Information
                              </div>
                              {fundingInformationLoc?.previous_funding?.map(
                                (funding, index) => (
                                  <li
                                    key={index}
                                    className='flex space-x-3 rtl:space-x-reverse'
                                  >
                                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                      <Icon icon='heroicons:banknotes' />
                                    </div>
                                    <div className='flex-1'>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Investor Name: ${
                                          funding.investorName || 'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Firm Name: ${
                                          funding.firmName || 'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Investor Type: ${
                                          funding.investorType || 'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Amount Raised: ${
                                          funding.amountRaised || 'Not provided'
                                        }`}
                                      </div>
                                    </div>
                                  </li>
                                )
                              )}
                              {fundingInformation?.previous_funding?.map(
                                (funding, index) => (
                                  <li
                                    key={index}
                                    className='flex space-x-3 rtl:space-x-reverse'
                                  >
                                    <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                      <Icon icon='heroicons:banknotes' />
                                    </div>
                                    <div className='flex-1'>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Investor Name: ${
                                          funding.investorName || 'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Firm Name: ${
                                          funding.firmName || 'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Investor Type: ${
                                          funding.investorType || 'Not provided'
                                        }`}
                                      </div>
                                      <div className='text-base text-slate-600 dark:text-slate-50'>
                                        {`Amount Raised: ${
                                          funding.amountRaised || 'Not provided'
                                        }`}
                                      </div>
                                    </div>
                                  </li>
                                )
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
