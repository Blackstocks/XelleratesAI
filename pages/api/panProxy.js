export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    const response = await fetch(
      'https://apisetu.gov.in/certificate/v3/pan/pancr',
      {
        method: 'POST',
        headers: {
          'x-api-key': 'IFA6bXScwchj5cb0ZU0NyVWNBGlw4mfb', // Replace with your actual API key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Error response from API:', data);
      return res.status(response.status).json(data);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Internal Server Error:', error);
    res
      .status(500)
      .json({
        message: 'Internal Server Error',
        error: error.message || error,
      });
  }
}
