import { supabase } from '@/lib/supabaseclient';
export default async function handler(req, res) {
  const supabaseToken = req.headers['supabasetoken'];

  // console.log('supabaseToken', supabaseToken);

  if (!supabaseToken) {
    return res.status(400).json({ error: 'Authorization token is required' });
  }

  try {
    // Fetch the user details using the token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(supabaseToken);

    if (authError) throw authError;

    // Fetch investor sectors
    const { data: investorData, error: investorError } = await supabase
      .from('investor_signup')
      .select('sectors')
      .eq('profile_id', user?.id)
      .single();

    if (investorError) throw investorError;

    const investorSectors = investorData.sectors;
    // console.log(investorSectors);

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
    const matchingStartups = startupData.filter((startup) => {
      if (!startup.industry_sector) {
        console.warn(
          `Startup ${
            startup.company_name || startup.id
          } has no industry sector defined.`
        );
        return false;
      }

      // Convert industry_sector to an array if it's not already one
      const industrySectors = Array.isArray(startup.industry_sector)
        ? startup.industry_sector
        : [startup.industry_sector];

      // Check if any sector from investorSectors matches the startup's industry_sector
      return industrySectors.some((sector) => investorSectors.includes(sector));
    });

    res.status(200).json({
      count: matchingStartups.length,
      startups: matchingStartups,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
