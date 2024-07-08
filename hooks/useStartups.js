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
          .select(`
            id,
            name,
            email,
            mobile,
            user_type,
            company_profile (
              company_name,
              company_logo,
              incorporation_date,
              country,
              state_city,
              office_address,
              pin_code,
              company_website,
              founder_information (
                founder_name,
                founder_email,
                founder_mobile,
                founder_linkedin,
                college_name,
                graduation_year
              ),
              business_details (
                team_size,
                industry_sector,
                current_stage,
                current_traction,
                certificate_of_incorporation,
                target_audience,
                usp_moat,
                gst_certificate,
                startup_india_certificate,
                due_diligence_report,
                business_valuation_report,
                mis,
                pitch_deck,
                video_pitch
              ),
              funding_information(
                current_cap_table,
                government_grants,
                total_funding_ask
              )
            )
          `)
          .eq('user_type', 'startup');

        if (error) throw error;

        console.log('Fetched Startups Data:', data); // Log fetched data
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
