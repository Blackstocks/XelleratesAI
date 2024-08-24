// pages/api/gstin.js
export default async function handler(req, res) {
  const { gstin } = req.query;
  console.log(gstin);

  if (!gstin) {
    return res.status(400).json({ error: 'GSTIN is required' });
  }

  try {
    const apiUrl = `https://apisetu.gov.in/gstn/v1/taxpayers/${gstin}`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-APISETU-CLIENTID': process.env.X_APISETU_CLIENTID,
        'X-APISETU-APIKEY': process.env.X_APISETU_APIKEY,
      },
    };

    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      throw new Error(`Failed to fetch GSTIN data: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data)
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching GSTIN data:', error.message);
    res.status(500).json({ error: 'Failed to fetch GSTIN data' });
  }
}
