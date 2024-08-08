import { createClient } from '@supabase/supabase-js';

const getUserDetails = async (supabaseToken) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabaseClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();
  if (userError) {
    console.error('Error fetching user:', userError.message);
    throw userError;
  }

  if (!user) {
    throw new Error('User not found');
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profileError) {
    console.error('Error fetching profile:', profileError.message);
    throw profileError;
  }

  let additionalDetails = {};
  if (profile.user_type === 'startup') {
    additionalDetails = await getStartupDetails(supabaseClient, profile?.id);
  } else if (profile.user_type === 'investor') {
    additionalDetails = await getInvestorDetails(supabaseClient, profile?.id);
  }

  return { user, profile, ...additionalDetails };
};

const getStartupDetails = async (supabaseClient, profileId) => {
  const { data: companyProfile, error: companyProfileError } =
    await supabaseClient
      .from('company_profile')
      .select('*')
      .eq('profile_id', profileId)
      .single();
  if (companyProfileError) {
    console.error(
      'Error fetching company profile:',
      companyProfileError.message
    );
    throw companyProfileError;
  }

  const companyId = companyProfile.id;

  const [
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
  ] = await Promise.all([
    fetchDetails(supabaseClient, 'business_details', companyId),
    fetchDetails(supabaseClient, 'founder_information', companyId),
    fetchDetails(supabaseClient, 'funding_information', companyId),
    fetchDetails(supabaseClient, 'CTO_info', companyId),
    fetchDetails(supabaseClient, 'company_documents', companyId),
  ]);

  return {
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
  };
};

const fetchDetails = async (supabaseClient, table, companyId) => {
  const { data, error } = await supabaseClient
    .from(table)
    .select('*')
    .eq('company_id', companyId);
  if (error) {
    console.error(`Error fetching ${table}:`, error.message);
    throw error;
  }
  return data;
};

const getInvestorDetails = async (supabaseClient, profileId) => {
  const { data: investorSignupData, error: investorSignupDataError } =
    await supabaseClient
      .from('investor_signup')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();
  if (investorSignupDataError) {
    console.error(
      'Error fetching investor signup:',
      investorSignupDataError.message
    );
    throw investorSignupDataError;
  }
  return { investorSignupData };
};

export default async function handler(req, res) {
  try {
    const supabaseToken = req.headers['supabase-token'];
    if (!supabaseToken) {
      throw new Error('Missing Supabase token');
    }

    const userDetails = await getUserDetails(supabaseToken);
    res.status(200).json(userDetails);
  } catch (error) {
    console.error('Error in API handler:', error.message);
    res.status(500).json({ error: error.message });
  }
}
