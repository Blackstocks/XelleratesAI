import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useStartups = (investorProfileId) => {
  console.log('Investor Profile ID:', investorProfileId);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startupCount, setStartupCount] = useState(0);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        // Step 1: Fetch the startup_profile_id(s) connected to the investor
        const { data: connectedStartups, error: connectedError } =
          await supabase
            .from('investor_startup_assignments')
            .select('startup_id')
            .eq('investor_id', investorProfileId);

        if (connectedError) throw connectedError;

        // Extract startup profile IDs
        const startupProfileIds = connectedStartups.map(
          (connection) => connection.startup_id
        );

        if (startupProfileIds.length === 0) {
          setStartups([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch the startup details using the startup_profile_ids
        const { data, error } = await supabase
          .from('company_profile')
          .select(
            `
            id,
            company_name,
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
            ),
             profiles (
              company_logo
            )
          `
          )
          .in('id', startupProfileIds); // Only fetch startups with the connected IDs

        if (error) throw error;

        console.log('Fetched Startups Data:', data);
        setStartups(data);
        setStartupCount(data.length);
      } catch (error) {
        console.error('Error fetching startups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [investorProfileId]);

  return { startups, loading, startupCount };
};

export default useStartups;
