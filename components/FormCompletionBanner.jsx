'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/components/Loading'; // Make sure you have a Loading component

const FormCompletionBanner = ({ profileId }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, loading } = useUserDetails();

  useEffect(() => {
    if (loading || !user) return;

    const fetchCompletionData = async () => {
      setIsLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setIsLoading(false);
        return;
      }

      if (profile) {
        setUserType(profile.user_type);

        let fields = [];
        let data = null;
        let completedFields = 0;

        if (profile.user_type === 'investor') {
          const { data: investorDetails, error: investorError } = await supabase
            .from('investor_signup')
            .select('*')
            .eq('profile_id', profileId)
            .single();

          if (investorError) {
            console.error('Error fetching investor details:', investorError);
            setIsLoading(false);
            return;
          }

          data = investorDetails;
          fields = [
            'name',
            'email',
            'mobile',
            'typeof',
            'investment_thesis',
            'cheque_size',
            'sectors',
            'investment_stage',
          ];
        } else if (profile.user_type === 'startup') {
          const startupDetails = await Promise.all([
            supabase
              .from('company_profile')
              .select('*')
              .eq('profile_id', profileId)
              .single(),
            supabase
              .from('contact_information')
              .select('*')
              .eq('company_id', profileId)
              .single(),
            supabase
              .from('founder_information')
              .select('*')
              .eq('company_id', profileId)
              .single(),
            supabase
              .from('cto_information')
              .select('*')
              .eq('company_id', profileId)
              .single(),
            supabase
              .from('business_details')
              .select('*')
              .eq('company_id', profileId)
              .single(),
            supabase
              .from('company_documents')
              .select('*')
              .eq('company_id', profileId)
              .single(),
            supabase
              .from('funding_information')
              .select('*')
              .eq('company_id', profileId)
              .single(),
            supabase
              .from('cofounder_information')
              .select('*')
              .eq('company_id', profileId)
              .single(),
          ]);

          const [
            companyProfile,
            contactInformation,
            founderInformation,
            ctoInformation,
            businessDetails,
            companyDocuments,
            fundingInformation,
            cofounderInformation,
          ] = startupDetails.map((res) => res.data);

          if (companyProfile) {
            data = { ...data, ...companyProfile };
            fields.push(
              'company_name',
              'short_description',
              'incorporation_date',
              'country',
              'state_city',
              'office_address',
              'pin_code',
              'company_website',
              'linkedin_profile',
              'company_logo',
              'current_stage',
              'team_size',
              'target_audience',
              'usp_moat',
              'industry_sector',
              'media'
            );
          }
          if (contactInformation) {
            data = { ...data, ...contactInformation };
            fields.push('mobile', 'business_description');
          }
          if (founderInformation) {
            data = { ...data, ...founderInformation };
            fields.push(
              'founder_name',
              'founder_email',
              'founder_mobile',
              'founder_linkedin',
              'degree_name',
              'college_name',
              'graduation_year',
              'list_of_advisers'
            );
          }
          if (ctoInformation) {
            data = { ...data, ...ctoInformation };
            fields.push(
              'cto_name',
              'cto_email',
              'cto_mobile',
              'cto_linkedin',
              'tech_team_size',
              'mobile_app_link',
              'technology_roadmap'
            );
          }
          if (businessDetails) {
            data = { ...data, ...businessDetails };
            fields.push(
              'current_traction',
              'new_Customers',
              'customer_AcquisitionCost',
              'customer_Lifetime_Value'
            );
          }
          if (companyDocuments) {
            data = { ...data, ...companyDocuments };
            fields.push(
              'certificate_of_incorporation',
              'gst_certificate',
              'trademark',
              'copyright',
              'patent',
              'startup_india_certificate',
              'due_diligence_report',
              'business_valuation_report',
              'mis',
              'financial_projections',
              'balance_sheet',
              'pl_statement',
              'cashflow_statement',
              'pitch_deck',
              'video_pitch',
              'sha',
              'termsheet',
              'employment_agreement',
              'mou',
              'nda'
            );
          }
          if (fundingInformation) {
            data = { ...data, ...fundingInformation };
            fields.push(
              'total_funding_ask',
              'amount_committed',
              'current_cap_table',
              'government_grants',
              'equity_split',
              'fund_utilization',
              'arr',
              'mrr'
            );
          }
          if (cofounderInformation) {
            data = { ...data, ...cofounderInformation };
            fields.push(
              'cofounder_name',
              'cofounder_email',
              'cofounder_mobile',
              'cofounder_linkedin'
            );
          }
        }

        if (data) {
          const filledFields = fields.filter((field) => data[field]);
          completedFields = filledFields.length;
          console.log('Filled fields:', filledFields);
          console.log('Total fields:', fields.length);
          setCompletionPercentage(
            Math.round((completedFields / fields.length) * 100)
          );
        }

        setIsLoading(false);
      }
    };

    fetchCompletionData();
  }, [profileId, user, loading]);

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  if (!isBannerVisible) {
    return null;
  }

  // if (isLoading) {
  //   return <Loading />; // Render the Loading component while fetching data
  // }

  return (
    <div className='completion-banner bg-grey-100 text-black py-4 px-6 flex items-center justify-between shadow-md rounded-md'>
      <div>
        <p className='font-medium text-lg'>
          {completionPercentage === 100
            ? 'Your profile is complete'
            : 'Few steps away from completing your profile'}
        </p>
        <p className='text-sm'>Form Completion: {completionPercentage}%</p>
      </div>
      <div className='flex items-center'>
        <button
          onClick={handleCloseBanner}
          className='ml-4 text-black red-500 text-xl font-bold'
          aria-label='Close Banner'
        >
          &#x2716;
        </button>
        {/* {completionPercentage < 100 && (
          <button
            onClick={() => {
              if (user?.user_type === 'investor') {
                router.push(`investor-form?profile_id=${user.id}`);
              } else if (user?.user_type === 'startup') {
                router.push(`startup-form?profile_id=${user.id}`);
              }
            }}
            className='ml-4 bg-blue-500 text-white py-2 px-4 rounded-md'
          >
            Update Profile
          </button>
        )} */}
      </div>
    </div>
  );
};

export default FormCompletionBanner;
