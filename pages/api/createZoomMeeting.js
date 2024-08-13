import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { timeSlot } = req.body;

  const token = await getZoomOAuthToken();
  if (!token) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch Zoom OAuth token' });
  }

  try {
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: 'Scheduled Meeting',
        type: 2, // Scheduled meeting
        start_time: new Date(timeSlot).toISOString(),
        duration: 60, // Duration in minutes
        timezone: 'UTC',
        settings: {
          join_before_host: true,
          participant_video: true,
          host_video: true,
          mute_upon_entry: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ meetingLink: response.data.join_url });
  } catch (error) {
    console.error(
      'Error creating Zoom meeting:',
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({
      message: 'Failed to create Zoom meeting',
      error: error.response ? error.response.data : error.message,
    });
  }
}

const getZoomOAuthToken = async () => {
  const tokenUrl =
    'https://zoom.us/oauth/token?grant_type=account_credentials&account_id=' +
    process.env.ZOOM_ACCOUNT_ID;

  const auth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(tokenUrl, null, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error(
      'Error fetching Zoom OAuth token:',
      error.response ? error.response.data : error.message
    );
    return null;
  }
};
