import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch hot deals from the hot_deals table, including the rank
    const { data: hotDealsData, error: hotDealsError } = await supabase
      .from('hot_deals')
      .select('startup_id, rank, profile_id');

    if (hotDealsError) throw hotDealsError;

    // Fetch details for each startup
    const promises = hotDealsData.map(async (deal) => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('company_logo')
          .eq('id', deal.profile_id)
          .single();
        if (profileError) throw profileError;

        const { data: startupData, error: startupError } = await supabase
          .from('company_profile')
          .select('company_name')
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
        const bgColor = getBgColorByRank(deal.rank);

        return {
          startup_id: deal.startup_id,
          companyName: startupData.company_name,
          companyLogo: profileData.company_logo,
          founderName: founderData.founder_name,
          rank: deal.rank, // Include the rank in the response
          bg: bgColor, // Include the background color in the response
        };
      } catch (error) {
        console.error(
          `Error processing deal for startup_id ${deal.startup_id}:`,
          error.message
        );
        return null; // Returning null for failed entries, you can decide how to handle this
      }
    });

    const hotDealsDetails = (await Promise.all(promises)).filter(Boolean); // Filter out any null values

    // Sort the details based on rank before returning them
    hotDealsDetails.sort((a, b) => a.rank - b.rank);

    res.status(200).json(hotDealsDetails);
  } catch (error) {
    console.error('Error fetching hot deals details:', error.message);
    res.status(500).json({ message: error.message });
  }
}

// Helper function to determine background color based on rank
function getBgColorByRank(rank) {
  switch (rank) {
    case 1:
      return 'before:bg-warning-500'; // Orange for the 1st rank
    case 2:
      return 'before:bg-info-500'; // Blue for the 2nd rank
    case 3:
      return 'before:bg-success-500'; // Green for the 3rd rank
    default:
      return 'before:bg-info-500'; // Default color
  }
}
