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
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

import Fileinput from '@/components/ui/Fileinput';
import {
  updateGeneralInfo,
  updateCTODetails,
  updateStartupDetails,
  updateFounderInfo,
  updateBusinessDetails,
  updateFundingInfo,
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
    cofounderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    updateUserLocally,
    updateDetailsLocally,
  } = useCompleteUserDetails();
  const { control, register, handleSubmit } = useForm();
  const { user, loading, details } = useUserDetails();
  const [editingSection, setEditingSection] = useState(null);

  const handleSave = async (data, section) => {
    try {
      console.log('Saving data for section:', section, 'with data:', data);
      let updatedData;
      let changedData = {};
      const uploadedFiles = {};

      // Check if the data already exists

      switch (section) {
        case 'general_info':
          changedData = { email: data.email, mobile: data.mobile };
          console.log('Changed Data for general_info:', changedData);
          const generalInfoResponse = await updateGeneralInfo(
            user.id,
            changedData
          );
          if (generalInfoResponse.error) throw generalInfoResponse.error;
          updatedData = generalInfoResponse.data;
          updateUserLocally(updatedData);
          break;

        case 'startup_details':
          const emptyStartupDetails = !companyProfile?.id;
          changedData = {
            profile_id: user?.id,
            company_name: data.company_name || null,
            short_description: data.short_description || null,
            incorporation_date: data.incorporation_date || null,
            country: data.country || null,
            state_city: data.state_city || null,
            office_address: data.office_address || null,
            pin_code: data.pin_code || null,
            company_website: data.company_website || null,
            linkedin_profile: data.linkedin_profile || null,
            company_logo: uploadedFiles.companyLogo || null,
            current_stage: data.current_stage || null,
            team_size: data.team_size || null,
            target_audience: data.target_audience || null,
            usp_moat: data.usp_moat || null,
            industry_sector: data.industry_sector || null,
            media: data.media || null,
          };

          console.log('Changed Data for startup_details:', changedData);

          if (emptyStartupDetails) {
            const startupDetailsResponse = await insertCompanyProfile(
              changedData,
              uploadedFiles
            );
            if (startupDetailsResponse.error)
              throw startupDetailsResponse.error;
            updatedData = startupDetailsResponse[0];
            console.log('Inserted company profile:', updatedData);
            updateDetailsLocally('companyProfile', updatedData);
          } else {
            console.log('Updating company profile:', companyProfile.id);
            const startupDetailsResponse = await updateStartupDetails(
              companyProfile.id,
              changedData
            );
            if (startupDetailsResponse.error)
              throw startupDetailsResponse.error;
            updatedData = startupDetailsResponse.data;
            console.log('Updated company profile:', updatedData);
            updateDetailsLocally({
              ...companyProfile,
              ...updatedData,
            });
          }
          break;

        case 'founder_info':
          const emptyfounder_info = !founderInformation?.id;

          const founderUploadedFiles = {};
          if (data.listofAdvisers && data.listofAdvisers[0]) {
            founderUploadedFiles.listofAdvisers = await handleFileUpload(
              data.listofAdvisers[0],
              'documents',
              companyProfile?.company_name || data.company_name,
              'listofAdvisers'
            );
          }
          changedData = {
            company_id: companyProfile?.id,
            founder_name: data.founder_name || null,
            founder_email: data.founder_email || null,
            founder_mobile: data.founder_mobile || null,
            founder_linkedin: data.founder_linkedin || null,
            degree_name: data.degree_name || null,
            college_name: data.college_name || null,
            graduation_year: data.graduation_year || null,
            list_of_advisers: founderUploadedFiles.listofAdvisers,
          };

          console.log('Changed Data for founder_info:', changedData);

          if (emptyfounder_info) {
            const founderInfoResponse = await insertFounderInformation(
              companyProfile.id,
              changedData,
              founderUploadedFiles
            );
            if (founderInfoResponse.error) throw founderInfoResponse.error;
            console.log('Inserted founder info:', founderInfoResponse.data);
            updatedData = founderInfoResponse.data;
            updateDetailsLocally('founderInformation', updatedData);
          } else {
            const founderInfoResponse = await updateFounderInfo(
              companyProfile.id,
              changedData,
              founderUploadedFiles
            );
            if (founderInfoResponse.error) throw founderInfoResponse.error;
            updatedData = founderInfoResponse.data;
            updateDetailsLocally({
              ...founderInformation,
              ...updatedData,
            });
          }

          break;

        case 'CTO_info':
          const emptycto_info = !ctoInfo?.id;
          const ctoUploadedFiles = {};
          if (data.technology_roadmap && data.technology_roadmap[0]) {
            ctoUploadedFiles.technology_roadmap = await handleFileUpload(
              data.technology_roadmap[0],
              'documents',
              companyProfile?.company_name || data.company_name,
              'technology_roadmap'
            );
          }
          changedData = {
            company_id: companyProfile?.id,
            cto_name: data.cto_name || '',
            cto_email: data.cto_email || '',
            cto_mobile: data.cto_mobile || '',
            cto_linkedin: data.cto_linkedin || '',
            tech_team_size: data.tech_team_size || '',
            mobile_app_link: data.mobile_app_link || '',
            technology_roadmap: ctoUploadedFiles.technology_roadmap || '',
          };

          console.log('Changed Data for cto_info:', changedData);
          console.log(emptycto_info);

          if (emptycto_info) {
            const ctoInfoResponse = await insertCTODetails(
              companyProfile.id,
              changedData,
              ctoUploadedFiles
            );
            if (ctoInfoResponse.error) throw ctoInfoResponse.error;
            updatedData = ctoInfoResponse.data;
            updateDetailsLocally({
              ...ctoInfo,
              ...updatedData,
            });
          } else {
            const ctoInfoResponse = await updateCTODetails(
              companyProfile.id,
              changedData,
              ctoUploadedFiles
            );
            if (ctoInfoResponse.error) throw ctoInfoResponse.error;
            updatedData = ctoInfoResponse.data;
            updateDetailsLocally({
              ...ctoInfo,
              ...updatedData,
            });
          }

          break;

        case 'company_documents':
          const emptycompany_documents = !companyDocuments?.id;
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

          if (emptycompany_documents) {
            const companyDocumentsResponse = await insertCompanyDocuments(
              companyProfile.id,
              data,
              companyUploadedFiles
            );
            if (companyDocumentsResponse.error)
              throw companyDocumentsResponse.error;
            updatedData = companyDocumentsResponse.data;
            updateDetailsLocally({
              ...companyDocuments,
              ...updatedData,
            });
          } else {
            const companyDocumentsResponse = await updateCompanyDocuments(
              companyProfile.id,
              data,
              companyUploadedFiles
            );
            if (companyDocumentsResponse.error)
              throw companyDocumentsResponse.error;
            updatedData = companyDocumentsResponse.data;
            updateDetailsLocally({
              ...companyDocuments,
              ...updatedData,
            });
          }

          break;

        case 'business_details':
          const emptybusiness_details = !businessDetails?.id;
          changedData = {
            company_id: companyProfile.id,
            current_traction: data.current_traction || null,
            new_Customers: data.new_Customers || null,
            customer_AcquisitionCost: data.customer_AcquisitionCost || null,
            customer_Lifetime_Value: data.customer_Lifetime_Value || null,
          };

          console.log('Changed Data for business_details:', changedData);

          try {
            let businessDetailsResponse;
            if (emptybusiness_details) {
              console.log(
                'Inserting business details for company:',
                companyProfile.id
              );
              businessDetailsResponse = await insertBusinessDetails(
                companyProfile.id,
                changedData
              );
            } else {
              console.log(
                'Updating business details for company:',
                companyProfile.id
              );
              businessDetailsResponse = await updateBusinessDetails(
                companyProfile.id,
                changedData
              );
            }

            if (businessDetailsResponse.error) {
              console.error('Error response:', businessDetailsResponse.error);
              throw businessDetailsResponse.error;
            }

            updatedData = businessDetailsResponse.data;
            console.log('Data saved successfully:', updatedData);
            updateDetailsLocally('businessDetails', updatedData);
          } catch (error) {
            console.error('Error saving business details:', error);
          }

          break;

        case 'funding_info':
          const emptyfunding_info = !fundingInformation?.id;
          console.log('funding_info:', fundingInformation);
          console.log('emptyfunding_info:', emptyfunding_info);
          const fundingUploadedFiles = {};
          if (data.current_cap_table && data.current_cap_table[0]) {
            fundingUploadedFiles.current_cap_table = await handleFileUpload(
              data.current_cap_table[0],
              'documents',
              companyProfile?.company_name || data.company_name,
              'current_cap_table'
            );
          }
          changedData = {
            company_id: companyProfile?.id,
            total_funding_ask: data.total_funding_ask || '',
            amount_committed: data.amount_committed || '',
            current_cap_table: fundingUploadedFiles.current_cap_table || '',
            government_grants: data.government_grants || '',
            equity_split: data.equity_split || '',
            fund_utilization: data.fund_utilization || '',
            arr: data.arr || '',
            mrr: data.mrr || '',
          };

          console.log('Changed Data for funding_info:', changedData);

          if (emptyfunding_info) {
            const fundingInfoResponse = await insertFundingInformation(
              companyProfile.id,
              changedData,
              fundingUploadedFiles
            );
            if (fundingInfoResponse.error) throw fundingInfoResponse.error;
            updatedData = fundingInfoResponse.data;
            updateDetailsLocally({
              ...fundingInformation,
              ...updatedData,
            });
          } else {
            const fundingInfoResponse = await updateFundingInfo(
              companyProfile.id,
              changedData,
              fundingUploadedFiles
            );
            if (fundingInfoResponse.error) throw fundingInfoResponse.error;
            updatedData = fundingInfoResponse.data;
            updateDetailsLocally({
              ...fundingInformation,
              ...updatedData,
            });
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
                              defaultValue={companyProfile?.company_name}
                              placeholder='Enter your company name'
                              register={register}
                            />
                            <Textinput
                              label='Incorporation Date'
                              type='date'
                              name='incorporation_date'
                              defaultValue={companyProfile?.incorporation_date}
                              placeholder='Select the incorporation date'
                              register={register}
                            />
                            <Textinput
                              label='Country'
                              name='country'
                              defaultValue={companyProfile?.country}
                              placeholder='Enter the country'
                              register={register}
                            />
                            <Textinput
                              label='State/City'
                              name='state_city'
                              defaultValue={companyProfile?.state_city}
                              placeholder='Enter the state or city'
                              register={register}
                            />
                            <Textinput
                              label='Office Address'
                              name='office_address'
                              defaultValue={companyProfile?.office_address}
                              placeholder='Enter the office address'
                              register={register}
                            />
                            <Textinput
                              label='Company Website'
                              name='company_website'
                              defaultValue={companyProfile?.company_website}
                              placeholder='Enter the company website URL'
                              register={register}
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='linkedin_profile'
                              defaultValue={companyProfile?.linkedin_profile}
                              placeholder='Enter the LinkedIn profile URL'
                              register={register}
                            />
                            <Textarea
                              label='Business Description'
                              name='short_description'
                              defaultValue={companyProfile?.short_description}
                              placeholder='Provide a brief business description'
                              register={register}
                            />
                            <Select
                              label='Target Audience'
                              name='target_audience'
                              defaultValue={companyProfile?.target_audience}
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
                            <Select
                              label='Industry or Sector'
                              name='industry_sector'
                              defaultValue={companyProfile?.industry_sector}
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
                              defaultValue={companyProfile?.team_size}
                              placeholder='Enter the team size'
                              register={register}
                            />
                            <Textinput
                              label='Current Stage'
                              name='current_stage'
                              defaultValue={companyProfile?.current_stage}
                              placeholder='Enter the current stage'
                              register={register}
                            />
                            <Textarea
                              label='USP/MOAT'
                              name='usp_moat'
                              defaultValue={companyProfile?.usp_moat}
                              placeholder='Describe the USP/MOAT'
                              register={register}
                            />
                            <Select
                              label='Is your startup in media?'
                              name='media'
                              defaultValue={companyProfile?.media}
                              options={[
                                { value: 'Yes', label: 'Yes' },
                                { value: 'No', label: 'No' },
                              ]}
                              placeholder='Is your startup in media?'
                              register={register}
                            />
                            <Fileinput
                              name='company_logo'
                              selectedFile={companyProfile?.company_logo}
                              onChange={(e) => onChange(e.target.files[0])}
                              label='Company Logo'
                            />
                          </>
                        )}
                        {section.key === 'CTO_info' && (
                          <>
                            <Textinput
                              label='CTO Name'
                              name='cto_name'
                              defaultValue={ctoInfo?.cto_name}
                              register={register}
                              placeholder='Enter CTO name'
                            />
                            <Textinput
                              label='Email'
                              name='cto_email'
                              defaultValue={ctoInfo?.cto_email}
                              register={register}
                              placeholder='Enter CTO email'
                            />
                            <Textinput
                              label='Mobile Number'
                              name='cto_mobile'
                              defaultValue={ctoInfo?.cto_mobile}
                              register={register}
                              placeholder='Enter CTO mobile number'
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='cto_linkedin'
                              defaultValue={ctoInfo?.cto_linkedin}
                              register={register}
                              placeholder='Enter CTO LinkedIn profile URL'
                            />
                            <Textinput
                              label='Tech Team Size'
                              type='number'
                              name='tech_team_size'
                              defaultValue={ctoInfo?.tech_team_size}
                              register={register}
                              placeholder='Enter tech team size'
                            />
                            <Textinput
                              label='Mobile App Link'
                              name='mobile_app_link'
                              defaultValue={ctoInfo?.mobile_app_link}
                              register={register}
                              placeholder='Enter mobile app link'
                            />
                            <Fileinput
                              name='technology_roadmap'
                              selectedFile={ctoInfo?.technology_roadmap}
                              onChange={(e) => onChange(e.target.files[0])}
                              label='Upload Technology Roadmap'
                              placeholder='Upload technology roadmap'
                            />
                          </>
                        )}

                        {section.key === 'founder_info' && (
                          <>
                            <Textinput
                              label='Founder Name'
                              name='founder_name'
                              defaultValue={founderInformation?.founder_name}
                              register={register}
                              placeholder='Enter founder name'
                            />
                            <Textinput
                              label='Email'
                              name='founder_email'
                              defaultValue={founderInformation?.founder_email}
                              register={register}
                              placeholder='Enter founder email'
                            />
                            <Textinput
                              label='Mobile Number'
                              name='founder_mobile'
                              defaultValue={founderInformation?.founder_mobile}
                              register={register}
                              placeholder='Enter founder mobile number'
                            />
                            <Textinput
                              label='LinkedIn Profile'
                              name='founder_linkedin'
                              defaultValue={
                                founderInformation?.founder_linkedin
                              }
                              register={register}
                              placeholder='Enter founder LinkedIn profile URL'
                            />
                            <Textinput
                              label='Degree Name'
                              name='degree_name'
                              defaultValue={founderInformation?.degree_name}
                              register={register}
                              placeholder='Enter degree name'
                            />
                            <Textinput
                              label='College Name'
                              name='college_name'
                              defaultValue={founderInformation?.college_name}
                              register={register}
                              placeholder='Enter college name'
                            />
                            <Textinput
                              label='Year of Graduation'
                              type='date'
                              name='graduation_year'
                              defaultValue={founderInformation?.graduation_year}
                              register={register}
                              placeholder='Enter year of graduation'
                            />
                            <Fileinput
                              name='listofAdvisers'
                              selectedFile={
                                founderInformation?.list_of_advisers
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
                              defaultValue={businessDetails?.current_traction}
                              register={register}
                              placeholder='Enter current traction'
                            />
                            <Textinput
                              label='New Customers'
                              name='new_Customers'
                              defaultValue={businessDetails?.new_Customers}
                              register={register}
                              placeholder='Enter number of new customers'
                            />
                            <Textinput
                              label='Customer Acquisition Cost'
                              name='customer_AcquisitionCost'
                              defaultValue={
                                businessDetails?.customer_AcquisitionCost
                              }
                              register={register}
                              placeholder='Enter customer acquisition cost'
                            />
                            <Textinput
                              label='Customer Lifetime Value'
                              name='customer_Lifetime_Value'
                              defaultValue={
                                businessDetails?.customer_Lifetime_Value
                              }
                              register={register}
                              placeholder='Enter customer lifetime value'
                            />
                          </>
                        )}

                        {section.key === 'funding_info' && (
                          <>
                            <Textinput
                              label='Total Funding Ask'
                              name='total_funding_ask'
                              defaultValue={
                                fundingInformation?.total_funding_ask
                              }
                              register={register}
                              placeholder='Enter total funding ask'
                            />
                            <Textinput
                              label='Amount Committed'
                              name='amount_committed'
                              defaultValue={
                                fundingInformation?.amount_committed
                              }
                              register={register}
                              placeholder='Enter amount committed'
                            />
                            <Textinput
                              label='Government Grants'
                              name='government_grants'
                              defaultValue={
                                fundingInformation?.government_grants
                              }
                              register={register}
                              placeholder='Enter government grants'
                            />
                            <Textinput
                              label='Equity Split'
                              name='equity_split'
                              defaultValue={fundingInformation?.equity_split}
                              register={register}
                              placeholder='Enter equity split'
                            />
                            <Textarea
                              label='Fund Utilization'
                              name='fund_utilization'
                              defaultValue={
                                fundingInformation?.fund_utilization
                              }
                              register={register}
                              placeholder='Describe fund utilization'
                            />
                            <Textinput
                              label='ARR'
                              name='arr'
                              defaultValue={fundingInformation?.arr}
                              register={register}
                              placeholder='Enter ARR'
                            />
                            <Textinput
                              label='MRR'
                              name='mrr'
                              defaultValue={fundingInformation?.mrr}
                              register={register}
                              placeholder='Enter MRR'
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
                                    {companyProfile?.company_name}
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
                                    {companyProfile?.incorporation_date}
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
                                    {companyProfile?.country},{' '}
                                    {companyProfile?.state_city}
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
                                    {companyProfile?.office_address}
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
                                    href={companyProfile?.company_website}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyProfile?.company_website}
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
                                    href={companyProfile?.linkedin_profile}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {companyProfile?.linkedin_profile}
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
                                    {companyProfile?.short_description}
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
                                    {companyProfile?.team_size}
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
                                    {companyProfile?.current_stage}
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
                                    {companyProfile?.target_audience}
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
                                    {companyProfile?.usp_moat}
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
                                    {companyProfile?.industry_sector}
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
                                    {companyProfile?.media}
                                  </div>
                                </div>
                              </li>
                              {companyProfile?.company_logo && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      COMPANY LOGO
                                    </div>
                                    <a
                                      href={companyProfile?.company_logo}
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
                                    {founderInformation?.founder_name}
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
                                    {founderInformation?.founder_email}
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
                                    {founderInformation?.founder_mobile}
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
                                    href={founderInformation?.founder_linkedin}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {founderInformation?.founder_linkedin}
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
                                    {founderInformation?.degree_name}
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
                                    {founderInformation?.college_name}
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
                                    {founderInformation?.graduation_year}
                                  </div>
                                </div>
                              </li>
                              {founderInformation?.list_of_advisers && (
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
                                        founderInformation?.list_of_advisers
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
                                    {ctoInfo?.cto_name}
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
                                    {ctoInfo?.cto_email}
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
                                    {ctoInfo?.cto_mobile}
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
                                    href={ctoInfo?.cto_linkedin}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {ctoInfo?.cto_linkedin}
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
                                    {ctoInfo?.tech_team_size}
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
                                    href={ctoInfo?.mobile_app_link}
                                    className='text-base text-slate-600 dark:text-slate-50'
                                  >
                                    {ctoInfo?.mobile_app_link}
                                  </a>
                                </div>
                              </li>
                              {ctoInfo?.technology_roadmap && (
                                <li className='flex space-x-3 rtl:space-x-reverse'>
                                  <div className='flex-none text-2xl text-slate-600 dark:text-slate-300'>
                                    <Icon icon='heroicons:document' />
                                  </div>
                                  <div className='flex-1'>
                                    <div className='uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]'>
                                      TECHNOLOGY ROADMAP
                                    </div>
                                    <a
                                      href={ctoInfo?.technology_roadmap}
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
                                    {businessDetails?.current_traction}
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
                                    {businessDetails?.new_Customers}
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
                                    {businessDetails?.customer_AcquisitionCost}
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
                                    {businessDetails?.customer_Lifetime_Value}
                                  </div>
                                </div>
                              </li>
                            </>
                          )}

                          {section.key === 'company_documents' && (
                            <>
                              {companyDocuments?.certificate_of_incorporation && (
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
                              {companyDocuments?.gst_certificate && (
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
                              {companyDocuments?.trademark && (
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
                              {companyDocuments?.copyright && (
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
                              {companyDocuments?.patent && (
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
                              {companyDocuments?.startup_india_certificate && (
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
                              {companyDocuments?.due_diligence_report && (
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
                              {companyDocuments?.business_valuation_report && (
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
                              {companyDocuments?.mis && (
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
                              {companyDocuments?.financial_projections && (
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
                              {companyDocuments?.balance_sheet && (
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
                              {companyDocuments?.pl_statement && (
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
                              {companyDocuments?.cashflow_statement && (
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
                              {companyDocuments?.pitch_deck && (
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
                              {companyDocuments?.video_pitch && (
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
                              {companyDocuments?.sha && (
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
                              {companyDocuments?.termsheet && (
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
                              {companyDocuments?.employment_agreement && (
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
                              {companyDocuments?.mou && (
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
                              {companyDocuments?.nda && (
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
                                    {fundingInformation?.total_funding_ask}
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
                                    {fundingInformation?.amount_committed}
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
                                    {fundingInformation?.government_grants}
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
                                    {fundingInformation?.equity_split}
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
                                    {fundingInformation?.fund_utilization}
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
                                    {fundingInformation?.arr}
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
                                    {fundingInformation?.mrr}
                                  </div>
                                </div>
                              </li>
                              {fundingInformation?.current_cap_table && (
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
                                        fundingInformation?.current_cap_table
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
