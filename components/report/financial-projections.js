import axios from 'axios';

const generateFinancialResponse = async (fileUrl) => {
  try {
    const response = await axios.post('/api/getFinancialProjectionsNew', fileUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // Return the JSON object directly
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
};

export default generateFinancialResponse;