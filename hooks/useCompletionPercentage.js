import { useState, useEffect } from 'react';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const useCompletionPercentage = () => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const {
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    loading,
  } = useCompleteUserDetails();

  useEffect(() => {
    if (loading || !profile) return;

    let fields = [];
    let completedFields = 0;

    if (profile.user_type === 'investor' && investorSignup) {
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

      const filledFields = fields.filter((field) => investorSignup[field]);
      completedFields = filledFields.length;
    } else if (profile.user_type === 'startup') {
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
            'current_stage',
            'team_size',
            'target_audience',
            'usp_moat',
            'industry_sector',
            'media',
            'social_media_handles',
            'media_presence',
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
            'advisors',
            'co_founders',
            'co_founder_agreement',
          ],
        },
        {
          details: fundingInformation,
          fields: [
            'total_funding_ask',
            'amount_committed',
            'government_grants',
            'equity_split',
            'fund_utilization',
            'arr',
            'mrr',
            'previous_funding',
            'cap_table',
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
            'mobile_app_link_ios',
            'mobile_app_link_android',
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
          fields.push(...detailFields);
          const filledFields = detailFields.filter((field) => details[field]);
          completedFields += filledFields.length;
        }
      });
    }

    setCompletionPercentage(
      Math.round((completedFields / fields.length) * 100)
    );
  }, [
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
    loading,
  ]);

  return { completionPercentage, loading };
};

export default useCompletionPercentage;
