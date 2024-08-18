import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const useDocumentsForStartup = (startupId) => {
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        if (!startupId) {
          setFiles(null);
          setLoading(false);
          return;
        }

        // Fetch the relevant files and company details using the startup_profile_id
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
          .eq('id', startupId) // Fetch files for the specific startup
          .single();

        if (error) throw error;

        console.log('Fetched Files Data:', data);
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
        setFiles(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [startupId]);

  return { files, loading };
};

export default useDocumentsForStartup;
