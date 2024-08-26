export default async function handler(req, res) {
  const { gstin } = req.query;

  if (!gstin) {
    return res.status(400).json({ error: 'GSTIN is required' });
  }

  try {
    const response = await fetch('https://api.invincibleocean.com/invincible/gstAdvanceSearchV2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'clientId': process.env.INVINCIBLE_OCEAN_CLIENT_ID,
        'secretKey': process.env.INVINCIBLE_OCEAN_SECRET_KEY,
      },
      body: JSON.stringify({ gstin }),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Error: ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching GSTIN data:', error.message);
    return res.status(500).json({ error: 'Failed to fetch GSTIN data' });
  }
}
