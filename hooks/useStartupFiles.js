import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useStartupFiles = (investorProfileId) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!investorProfileId) {
      // Early return if investorProfileId is not provided
      setLoading(false);
      return;
    }

    const fetchFiles = async () => {
      try {
        // Step 1: Fetch the startup_profile_id(s) connected to the investor
        const { data: connectedStartups, error: connectedError } =
          await supabase
            .from('investor_startup_assignments')
            .select('startup_id')
            .eq('investor_id', investorProfileId);

        if (connectedError)
          throw new Error('Failed to fetch connected startups.');

        const startupProfileIds = connectedStartups.map(
          (connection) => connection.startup_id
        );

        if (startupProfileIds.length === 0) {
          setFiles([]);
          return;
        }

        // Step 2: Fetch the relevant files and company details using the startup_profile_ids
        const { data, error } = await supabase
          .from('company_profile')
          .select(
            `
            id,
            company_name,
            founder_information (
              co_founder_agreement
            ),
            CTO_info (
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
          .in('id', startupProfileIds);

        if (error) throw new Error('Failed to fetch company documents.');

        console.log('Fetched Files Data:', data);
        setFiles(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [investorProfileId]);

  return { files, loading };
};

export default useStartupFiles;
