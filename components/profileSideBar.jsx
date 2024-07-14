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
import Select from './ui/Select';
import InputGroup from './ui/InputGroup';

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
            target_audience: data.targetAudience,
            usp_moat: data.uspMoat,
            industry_sector: data.industrySector,
            media: data.media,
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
          const founderUploadedFiles = {};

          if (data.listofAdvisers && data.listofAdvisers[0]) {
            console.log('Uploading file for listofAdvisers');
            founderUploadedFiles.listofAdvisers = await handleFileUpload(
              data.listofAdvisers[0],
              'documents',
              details.company_name,
              'listofAdvisers'
            );
            console.log(
              `Uploaded file URL for listofAdvisers: ${founderUploadedFiles.listofAdvisers}`
            );
          } else {
            console.log('listofAdvisers not found in data.');
          }

          changedData = {
            founder_name: data.founder_name,
            founder_email: data.founder_email,
            founder_mobile: data.founder_mobile,
            founder_linkedin: data.founder_linkedin,
            degree_name: data.degree_name,
            college_name: data.college_name,
            graduation_year: data.graduation_year,
            list_of_advisers: founderUploadedFiles.listofAdvisers,
          };
          const founderInfoResponse = await updateFounderInfo(
            details.id,
            changedData
          );
          if (founderInfoResponse.error) throw founderInfoResponse.error;
          updatedData = founderInfoResponse.data;
          updateDetailsLocally({ ...details, founderInformation: updatedData });
          break;

        case 'cto_information':
          const ctoUploadedFiles = {};

          if (data.technologyRoadmap && data.technologyRoadmap[0]) {
            console.log('Uploading file for technologyRoadmap');
            ctoUploadedFiles.technologyRoadmap = await handleFileUpload(
              data.technologyRoadmap[0],
              'documents',
              details.company_name,
              'technologyRoadmap'
            );
            console.log(
              `Uploaded file URL for technologyRoadmap: ${ctoUploadedFiles.technologyRoadmap}`
            );
          } else {
            console.log('technologyRoadmap not found in data.');
          }

          changedData = {
            cto_name: data.ctoName,
            cto_email: data.ctoEmail,
            cto_mobile: data.ctoMobile,
            cto_linkedin: data.ctoLinkedin,
            tech_team_size: data.techTeamSize,
            mobile_app_link: data.mobileAppLink,
            technology_roadmap: ctoUploadedFiles.technologyRoadmap,
          };
          const ctoInfoResponse = await insertCTODetails(
            details.id,
            changedData,
            ctoUploadedFiles
          );
          if (ctoInfoResponse.error) throw ctoInfoResponse.error;
          updatedData = ctoInfoResponse.data;
          updateDetailsLocally({ ...details, ctoInformation: updatedData });
          break;

        case 'company_documents':
          const companyUploadedFiles = {};

          for (const [dbField, formField] of Object.entries(
            companyDocumentsFiles
          )) {
            if (data[formField] && data[formField][0]) {
              console.log(`Uploading file for ${formField}`);
              companyUploadedFiles[formField] = await handleFileUpload(
                data[formField][0],
                'documents',
                details.company_name,
                formField
              );
              console.log(
                `Uploaded file URL for ${formField}: ${companyUploadedFiles[formField]}`
              );
            } else {
              console.log(`${formField} not found in data.`);
            }
          }

          const companyDocumentsResponse = await insertCompanyDocuments(
            details.id,
            data,
            companyUploadedFiles
          );
          if (companyDocumentsResponse.error)
            throw companyDocumentsResponse.error;
          updatedData = companyDocumentsResponse.data;
          updateDetailsLocally({ ...details, companyDocuments: updatedData });
          break;
        case 'business_details':
          // for (const { name } of fileFields) {
          //   if (data[name] && data[name][0]) {
          //     console.log(`Uploading file for ${name}`);
          //     uploadedFiles[name] = await updateFile(
          //       data[name][0],
          //       'documents',
          //       details.company_name,
          //       name
          //     );
          //     console.log(
          //       `Uploaded file URL for ${name}: ${uploadedFiles[name]}`
          //     );
          //     changedData[name] = uploadedFiles[name];
          //   } else {
          //     console.log(`${name} not found in data.`);
          //   }
          // }
          changedData = {
            ...changedData,
            company_id: companyId,
            current_traction: formData.currentTraction,
            new_Customers: formData.newCustomers,
            customer_AcquisitionCost: formData.customerAcquisitionCost,
            customer_Lifetime_Value: formData.customerLifetimeValue,
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
                            <Select
                              label='Target Audience'
                              name='target_audience'
                              defaultValue={details?.target_audience}
                              options={[
                                { value: 'B2C', label: 'B2C' },
                                { value: 'B2B', label: 'B2B' },
                                { value: 'B2B2B', label: 'B2B2B' },
                                { value: 'D2C', label: 'D2C' },
                                { value: 'B2G', label: 'B2G' },
                                { value: 'B2B2C', label: 'B2B2C' },
                              ]}
                              register={register}
                            />
                            <Select
                              label='Industry or Sector'
                              name='industry_sector'
                              defaultValue={details?.industry_sector}
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
                              register={register}
                            />
                            <Textinput
                              label='Team Size'
                              type='number'
                              name='team_size'
                              defaultValue={details?.team_size}
                              register={register}
                            />
                            <Textinput
                              label='Current Stage'
                              name='current_stage'
                              defaultValue={details?.current_stage}
                              register={register}
                            />
                            <Textarea
                              label='USP/MOAT'
                              name='usp_moat'
                              defaultValue={details?.usp_moat}
                              register={register}
                            />
                            <Select
                              label='Is your startup in media?'
                              name='media'
                              defaultValue={details?.media}
                              options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                              ]}
                              register={register}
                            />
                            <Fileinput
                              name='company_logo'
                              selectedFile={details?.company_logo}
                              onChange={(e) => onChange(e.target.files[0])}
                              label='Company Logo'
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
                            <Fileinput
                              name='listofAdvisers'
                              selectedFile={
                                details?.founderInformation?.list_of_advisers
                              }
                              onChange={(e) => onChange(e.target.files[0])}
                              label='List of Advisers'
                            />
                          </>
                        )}
                        {section.key === 'company_documents' && (
                          <>
                            <InputGroup
                              label='Upload Certificate of Incorporation'
                              type='file'
                              name='certificateOfIncorporation'
                              defaultValue={
                                details?.companyDocuments
                                  ?.certificate_of_incorporation
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload GST Certificate'
                              type='file'
                              name='gstCertificate'
                              defaultValue={
                                details?.companyDocuments?.gst_certificate
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload Trademark'
                              type='file'
                              name='trademark'
                              defaultValue={
                                details?.companyDocuments?.trademark
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload Copyright'
                              type='file'
                              name='copyright'
                              defaultValue={
                                details?.companyDocuments?.copyright
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload Patent'
                              type='file'
                              name='patent'
                              defaultValue={details?.companyDocuments?.patent}
                              register={register}
                            />
                            <InputGroup
                              label='Upload Startup India Certificate'
                              type='file'
                              name='startupIndiaCertificate'
                              defaultValue={
                                details?.companyDocuments
                                  ?.startup_india_certificate
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your Due-Diligence Report'
                              type='file'
                              name='dueDiligenceReport'
                              defaultValue={
                                details?.companyDocuments?.due_diligence_report
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your Business Valuation report'
                              type='file'
                              name='businessValuationReport'
                              defaultValue={
                                details?.companyDocuments
                                  ?.business_valuation_report
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your MIS'
                              type='file'
                              name='mis'
                              defaultValue={details?.companyDocuments?.mis}
                              register={register}
                            />
                            <InputGroup
                              label='Upload your financial projections'
                              type='file'
                              name='financialProjections'
                              defaultValue={
                                details?.companyDocuments?.financial_projections
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your balance sheet'
                              type='file'
                              name='balanceSheet'
                              defaultValue={
                                details?.companyDocuments?.balance_sheet
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your P&L Statement'
                              type='file'
                              name='plStatement'
                              defaultValue={
                                details?.companyDocuments?.pl_statement
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your cashflow statement'
                              type='file'
                              name='cashflowStatement'
                              defaultValue={
                                details?.companyDocuments?.cashflow_statement
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload Pitch Deck'
                              type='file'
                              name='pitchDeck'
                              defaultValue={
                                details?.companyDocuments?.pitch_deck
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload Video Pitch'
                              type='file'
                              name='videoPitch'
                              defaultValue={
                                details?.companyDocuments?.video_pitch
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your SHA (Previous round/ existing round)'
                              type='file'
                              name='sha'
                              defaultValue={details?.companyDocuments?.sha}
                              register={register}
                            />
                            <InputGroup
                              label='Upload your Termsheet (previous round/ existing round)'
                              type='file'
                              name='termsheet'
                              defaultValue={
                                details?.companyDocuments?.termsheet
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your employment agreement'
                              type='file'
                              name='employmentAgreement'
                              defaultValue={
                                details?.companyDocuments?.employment_agreement
                              }
                              register={register}
                            />
                            <InputGroup
                              label='Upload your MoU'
                              type='file'
                              name='mou'
                              defaultValue={details?.companyDocuments?.mou}
                              register={register}
                            />
                            <InputGroup
                              label='Upload your NDA'
                              type='file'
                              name='nda'
                              defaultValue={details?.companyDocuments?.nda}
                              register={register}
                            />
                          </>
                        )}

                        {section.key === 'business_details' && (
                          <>
                            <Textinput
                              label='Current Traction'
                              name='currentTraction'
                              defaultValue={
                                details?.businessDetails?.current_traction
                              }
                              register={register}
                            />
                            <Textinput
                              label='New Customers'
                              name='newCustomers'
                              defaultValue={
                                details?.businessDetails?.new_Customers
                              }
                              register={register}
                            />
                            <Textinput
                              label='Customer Acquisition Cost'
                              name='customerAcquisitionCost'
                              defaultValue={
                                details?.businessDetails
                                  ?.customer_AcquisitionCost
                              }
                              register={register}
                            />
                            <Textinput
                              label='Customer Lifetime Value'
                              name='customerLifetimeValue'
                              defaultValue={
                                details?.businessDetails
                                  ?.customer_Lifetime_Value
                              }
                              register={register}
                            />
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
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:users' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    TEAM SIZE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.team_size}
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
                                    {details?.current_stage}
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
                                    {details?.target_audience}
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
                                    {details?.usp_moat}
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
                                    {details?.industry_sector}
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
                                    {details?.media}
                                  </div>
                                </div>
                              </li>
                              {details?.company_logo && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      COMPANY LOGO
                                    </div>
                                    <a
                                      href={details?.company_logo}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Company Logo
                                    </a>
                                  </div>
                                </li>
                              )}
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
                              {details?.founderInformation
                                ?.list_of_advisers && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      LIST OF ADVISERS
                                    </div>
                                    <a
                                      href={
                                        details?.founderInformation
                                          ?.list_of_advisers
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View List of Advisers
                                    </a>
                                  </div>
                                </li>
                              )}
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
                                    {details?.ctoInfo?.cto_name}
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
                                    {details?.ctoInfo?.cto_email}
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
                                    {details?.ctoInfo?.cto_mobile}
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
                                    href={details?.ctoInfo?.cto_linkedin}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {details?.ctoInfo?.cto_linkedin}
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
                                    {details?.ctoInfo?.tech_team_size}
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
                                    href={details?.ctoInfo?.mobile_app_link}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {details?.ctoInfo?.mobile_app_link}
                                  </a>
                                </div>
                              </li>
                              {details?.ctoInfo?.technology_roadmap && (
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
                                        details?.ctoInfo?.technology_roadmap
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Technology Roadmap
                                    </a>
                                  </div>
                                </li>
                              )}
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
                                    {details?.businessDetails?.current_traction}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:user-plus' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    NEW CUSTOMERS IN LAST 6 MONTHS
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {details?.businessDetails?.new_Customers}
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:banknotes' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CUSTOMER ACQUISITION COST
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.businessDetails
                                        ?.customer_AcquisitionCost
                                    }
                                  </div>
                                </div>
                              </li>
                              <li className='flex space-x-3 rtl:space-x-reverse'>
                                <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                  <Icon icon='heroicons:currency-dollar' />
                                </div>
                                <div className='flex-1'>
                                  <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                    CUSTOMER LIFETIME VALUE
                                  </div>
                                  <div className='text-base text-slate-600 dark:text-slate-50'>
                                    {
                                      details?.businessDetails
                                        ?.customer_Lifetime_Value
                                    }
                                  </div>
                                </div>
                              </li>
                            </>
                          )}

                          {section.key === 'company_documents' && (
                            <>
                              {details?.companyDocuments
                                ?.certificate_of_incorporation && (
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
                                        details.companyDocuments
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
                              {details?.companyDocuments?.gst_certificate && (
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
                                        details.companyDocuments.gst_certificate
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
                              {details?.companyDocuments?.trademark && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      TRADEMARK
                                    </div>
                                    <a
                                      href={details.companyDocuments.trademark}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Trademark
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.copyright && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      COPYRIGHT
                                    </div>
                                    <a
                                      href={details.companyDocuments.copyright}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Copyright
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.patent && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      PATENT
                                    </div>
                                    <a
                                      href={details.companyDocuments.patent}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Patent
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments
                                ?.startup_india_certificate && (
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
                                        details.companyDocuments
                                          .startup_india_certificate
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
                              {details?.companyDocuments
                                ?.due_diligence_report && (
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
                                        details.companyDocuments
                                          .due_diligence_report
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Report
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments
                                ?.business_valuation_report && (
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
                                        details.companyDocuments
                                          .business_valuation_report
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Report
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.mis && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      MIS
                                    </div>
                                    <a
                                      href={details.companyDocuments.mis}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View MIS
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments
                                ?.financial_projections && (
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
                                        details.companyDocuments
                                          .financial_projections
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Projections
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.balance_sheet && (
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
                                        details.companyDocuments.balance_sheet
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Balance Sheet
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.pl_statement && (
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
                                        details.companyDocuments.pl_statement
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View P&L Statement
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments
                                ?.cashflow_statement && (
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
                                        details.companyDocuments
                                          .cashflow_statement
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Cashflow Statement
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.pitch_deck && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      PITCH DECK
                                    </div>
                                    <a
                                      href={details.companyDocuments.pitch_deck}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Pitch Deck
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.video_pitch && (
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
                                        details.companyDocuments.video_pitch
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Video Pitch
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.sha && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      SHA (PREVIOUS/EXISTING ROUND)
                                    </div>
                                    <a
                                      href={details.companyDocuments.sha}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View SHA
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.termsheet && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      TERMSHEET (PREVIOUS/EXISTING ROUND)
                                    </div>
                                    <a
                                      href={details.companyDocuments.termsheet}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Termsheet
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments
                                ?.employment_agreement && (
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
                                        details.companyDocuments
                                          .employment_agreement
                                      }
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View Agreement
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.mou && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      MOU
                                    </div>
                                    <a
                                      href={details.companyDocuments.mou}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View MoU
                                    </a>
                                  </div>
                                </li>
                              )}
                              {details?.companyDocuments?.nda && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      NDA
                                    </div>
                                    <a
                                      href={details.companyDocuments.nda}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-base text-slate-600 dark:text-slate-50'
                                    >
                                      View NDA
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
