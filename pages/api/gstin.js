// Next.js API route to fetch GSTIN details
export default async function handler(req, res) {
  const { gstin } = req.query;

  if (!gstin) {
    console.error('GSTIN is missing in the request');
    return res.status(400).json({ error: 'GSTIN is required' });
  }

  // Function to fetch data with retry mechanism
  const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        console.error(`Attempt ${i + 1} failed: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.error(`Attempt ${i + 1} error: ${error.message}`);
      }
    }
    throw new Error('Failed after multiple attempts');
  };

  try {
    console.log(`Fetching data for GSTIN: ${gstin}`);

    const apiUrl = `https://apisetu.gov.in/gstn/v1/taxpayers/${gstin}`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-APISETU-CLIENTID': process.env.X_APISETU_CLIENTID,
        'X-APISETU-APIKEY': process.env.X_APISETU_APIKEY
      }
    };

    const data = await fetchWithRetry(apiUrl, options);
    console.log('API Response:', data);

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in handler:', error.message);
    res.status(500).json({ error: 'Failed to fetch GSTIN data' });
  }
}
