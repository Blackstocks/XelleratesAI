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
          'x-api-key': 'IFA6bXScwchj5cb0ZU0NyVWNBGlw4mfb',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.error('Received non-JSON response:', text);
      res.status(response.status).send(text);
    }
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
