import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useStartupFiles = (investorProfileId) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
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
          setFiles([]);
          setLoading(false);
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
          .in('id', startupProfileIds); // Only fetch startups with the connected IDs

        if (error) throw error;

        console.log('Fetched Files Data:', data);
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [investorProfileId]);

  return { files, loading };
};

export default useStartupFiles;
