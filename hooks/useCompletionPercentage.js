import { useState, useEffect } from 'react';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const useCompletionPercentage = () => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
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
    loading: detailsLoading,
  } = useCompleteUserDetails();

  useEffect(() => {
    if (detailsLoading || !profile) return;

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
      setCompletionPercentage(
        Math.round((completedFields / fields.length) * 100)
      );
    }

    setLoading(false);
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
    detailsLoading,
  ]);

  return { completionPercentage, loading };
};

export default useCompletionPercentage;
