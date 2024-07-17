'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/components/Loading';

const FormCompletionBanner = ({ profileId }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const {
    user,
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    cofounderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    loading,
  } = useCompleteUserDetails();

  const router = useRouter();

  useEffect(() => {
    if (loading || !profile) return;

    let fields = [];
    let data = null;
    let completedFields = 0;

    if (profile.user_type === 'investor' && investorSignup) {
      data = investorSignup;
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
      data = {};
      const startupData = [
        {
          details: companyProfile,
          fields: [
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
            'media',
          ],
        },
        {
          details: businessDetails,
          fields: [
            'current_traction',
            'new_Customers',
            'customer_AcquisitionCost',
            'customer_Lifetime_Value',
          ],
        },
        {
          details: founderInformation,
          fields: [
            'founder_name',
            'founder_email',
            'founder_mobile',
            'founder_linkedin',
            'degree_name',
            'college_name',
            'graduation_year',
            'list_of_advisers',
          ],
        },
        {
          details: cofounderInformation,
          fields: [
            'cofounder_name',
            'cofounder_email',
            'cofounder_mobile',
            'cofounder_linkedin',
          ],
        },
        {
          details: fundingInformation,
          fields: [
            'total_funding_ask',
            'amount_committed',
            'current_cap_table',
            'government_grants',
            'equity_split',
            'fund_utilization',
            'arr',
            'mrr',
          ],
        },
        {
          details: ctoInfo,
          fields: [
            'cto_name',
            'cto_email',
            'cto_mobile',
            'cto_linkedin',
            'tech_team_size',
            'mobile_app_link',
            'technology_roadmap',
          ],
        },
        {
          details: companyDocuments,
          fields: [
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
            'nda',
          ],
        },
      ];

      startupData.forEach(({ details, fields: detailFields }) => {
        if (details) {
          data = { ...data, ...details };
          fields.push(...detailFields);
        }
      });
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
  }, [
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    cofounderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    loading,
  ]);

  const handleCloseBanner = () => {
    setIsBannerVisible(false);
  };

  if (!isBannerVisible) {
    return null;
  }

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
      </div>
    </div>
  );
};

export default FormCompletionBanner;
