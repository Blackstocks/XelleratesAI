import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useStartups = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            `
            id,
            name,
            email,
            mobile,
            user_type,
            company_profile (
            id,
              company_name,
              company_logo,
              incorporation_date,
              country,
              state_city,
              office_address,
              company_website,
              linkedin_profile,
              short_description,
              target_audience,
              industry_sector,
              team_size,
              current_stage,
              usp_moat,
              media,
              social_media_handles,
              founder_information (
              id,
                founder_name,
                founder_email,
                founder_mobile,
                founder_linkedin,
                degree_name,
                college_name,
                graduation_year,
                advisors,
                co_founders,
                co_founder_agreement
              ),
              business_details (
                current_traction,
                new_Customers,
                customer_AcquisitionCost,
                customer_Lifetime_Value
              ),
              funding_information(
                total_funding_ask,
                amount_committed,
               cap_table,
                government_grants,
                equity_split,
                fund_utilization,
                arr,
                mrr,
                previous_funding
              ),
              CTO_info (
                cto_name,
                cto_email,
                cto_mobile,
                cto_linkedin,
                tech_team_size,
                mobile_app_link_ios,
                mobile_app_link_android,
                technology_roadmap
              ),
              company_documents (
                certificate_of_incorporation,
                gst_certificate,
                trademark,
                copyright,
                patent,
                startup_india_certificate,
                due_diligence_report,
                business_valuation_report,
                mis,
                financial_projections,
                balance_sheet,
                pl_statement,
                cashflow_statement,
                pitch_deck,
                video_pitch,
                sha,
                termsheet,
                employment_agreement,
                mou,
                nda
              )
            )
          `
          )
          .eq('user_type', 'startup');

        if (error) throw error;

        console.log('Fetched Startups Data:', data);
        setStartups(data);
      } catch (error) {
        console.error('Error fetching startups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, []);

  return { startups, loading };
};

export default useStartups;
