import axios from 'axios';

const generateCompetitorAnalysis = async (companyName, shortDescription, targetAudience, uspMoat) => {
  try {
    const response = await axios.post('/api/getCompetitorAnalysis', { companyName, shortDescription, targetAudience, uspMoat }, {
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

export default generateCompetitorAnalysis;
