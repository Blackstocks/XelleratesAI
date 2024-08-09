import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch hot deals from the hot_deals table, including the rank
    const { data: hotDealsData, error: hotDealsError } = await supabase
      .from('hot_deals')
      .select('startup_id, rank');

    if (hotDealsError) throw hotDealsError;

    // Fetch details for each startup
    const promises = hotDealsData.map(async (deal) => {
      const { data: startupData, error: startupError } = await supabase
        .from('company_profile')
        .select('company_name, company_logo')
        .eq('id', deal.startup_id)
        .single();
      if (startupError) throw startupError;

      const { data: founderData, error: founderError } = await supabase
        .from('founder_information')
        .select('founder_name')
        .eq('company_id', deal.startup_id)
        .single();
      if (founderError) throw founderError;

      // Assign background color based on rank
      let bgColor;
      switch (deal.rank) {
        case 1:
          bgColor = 'before:bg-warning-500'; // Orange for the 1st rank
          break;
        case 2:
          bgColor = 'before:bg-info-500'; // Blue for the 2nd rank
          break;
        case 3:
          bgColor = 'before:bg-success-500'; // Green for the 3rd rank
          break;
        default:
          bgColor = 'before:bg-info-500'; // Default color
      }

      return {
        startup_id: deal.startup_id,
        companyName: startupData.company_name,
        companyLogo: startupData.company_logo,
        founderName: founderData.founder_name,
        rank: deal.rank, // Include the rank in the response
        bg: bgColor, // Include the background color in the response
      };
    });

    const hotDealsDetails = await Promise.all(promises);

    // Sort the details based on rank before returning them
    hotDealsDetails.sort((a, b) => a.rank - b.rank);

    res.status(200).json(hotDealsDetails);
  } catch (error) {
    console.error('Error fetching hot deals details:', error.message);
    res.status(500).json({ message: error.message });
  }
}
