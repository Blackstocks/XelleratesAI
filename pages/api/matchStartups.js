import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  const { investorId } = req.query;

  if (!investorId) {
    return res.status(400).json({ error: 'Investor ID is required' });
  }

  try {
    // Fetch investor sectors
    const { data: investorData, error: investorError } = await supabase
      .from('investor_signup')
      .select('sector')
      .eq('id', investorId)
      .single();

    if (investorError) throw investorError;

    const investorSectors = investorData.sector;

    // Fetch startups
    const { data: startupData, error: startupError } = await supabase.from(
      'company_profile'
    ).select(`
        id,
        company_name,
        industry_sector
      `);

    if (startupError) throw startupError;

    // Filter startups based on matching sectors
    const matchingStartups = startupData.filter((startup) =>
      startup.industry_sector.some((sector) => investorSectors.includes(sector))
    );

    res.status(200).json({
      count: matchingStartups.length,
      startups: matchingStartups,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
