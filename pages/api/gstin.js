import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  const { gstin, user_id } = req.query; // Extract user_id from query parameters

  if (!gstin) {
    return res.status(400).json({ error: 'GSTIN is required' });
  }

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const response = await fetch(
      `https://apisetu.gov.in/gstn/v1/taxpayers/${gstin}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-APISETU-CLIENTID': process.env.APISETU_CLIENTID,
          'X-APISETU-APIKEY': process.env.APISETU_APIKEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check GSTIN status
    if (
      data.status.toLowerCase() === 'cancelled' ||
      data.status.toLowerCase() === 'expired'
    ) {
      return res.status(400).json({
        error: `GSTIN status is ${data.status}. Please enter a valid GSTIN.`,
      });
    }

    const convertDateToYMD = (dateString) => {
      if (!dateString) return null;
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    };

    const formattedRegistrationDate = convertDateToYMD(data.registrationDate);
    const formattedCancellationDate = data.cancellationDate
      ? convertDateToYMD(data.cancellationDate)
      : null;

    const { error } = await supabase.from('debt_gstin').insert({
      user_id: user_id, // Use the extracted user_id from query parameters
      gstin: data.gstin,
      legal_name: data.legalName,
      constitution: data.constitution,
      registration_date: formattedRegistrationDate || null,
      status: data.status,
      taxpayer_type: data.taxPayerType,
      center_jurisdiction: data.centerJurisdiction,
      state_jurisdiction: data.stateJurisdiction,
      cancellation_date: formattedCancellationDate || null,
      nature_business_activities: JSON.stringify(data.natureBusinessActivities),
    });

    if (error) {
      throw new Error('Failed to store GSTIN data');
    }

    res.status(200).json({ message: 'GSTIN data stored successfully' });
  } catch (error) {
    console.error('Error fetching GSTIN data:', error.message);
    res.status(500).json({ error: 'Failed to fetch GSTIN data' });
  }
}
