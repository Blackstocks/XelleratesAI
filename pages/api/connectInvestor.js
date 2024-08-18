import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { investorId, startupDetails } = req.body;

    if (!investorId || !startupDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      // Check if the investor is already connected
      const { data, error: fetchError } = await supabase
        .from('connected_investors')
        .select('*')
        .eq('profile_id', investorId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        return res.status(200).json({ hasConnected: true });
      }

      // Insert the new connection
      const { error: insertError } = await supabase
        .from('connected_investors')
        .insert([
          {
            company_name: startupDetails.company_name,
            name: startupDetails.name,
            linkedin_profile: startupDetails.linkedin_profile,
            email: startupDetails.email,
            mobile: startupDetails.mobile,
            user_type: startupDetails.typeof,
            profile_id: investorId, // Use the provided investorId
            sectors: startupDetails.sectors,
            has_connected: true,
            investment_thesis: startupDetails.investment_thesis,
            investment_stage: startupDetails.investment_stage,
            cheque_size: startupDetails.cheque_size,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      res.status(200).json({ hasConnected: true });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
