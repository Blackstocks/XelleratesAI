export default async function handler(req, res) {
  const { gstin } = req.query;

  if (!gstin) {
    return res.status(400).json({ error: 'GSTIN is required' });
  }

  try {
    const response = await fetch(`https://apisetu.gov.in/gstn/v1/taxpayers/${gstin}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-APISETU-CLIENTID': process.env.X_APISETU_CLIENTID,
        'X-APISETU-APIKEY': process.env.X_APISETU_APIKEY
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching GSTIN data:', error.message);
    res.status(500).json({ error: 'Failed to fetch GSTIN data' });
  }
}
