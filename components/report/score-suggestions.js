import axios from 'axios';

const scoreSuggestions = async (shortDescription, targetAudience, uspMoat, technologyRoadmap, tractionDetails) => {
  try {
    const response = await axios.post('/api/getScoreSuggestions', { shortDescription, targetAudience, uspMoat, technologyRoadmap, tractionDetails });
    const suggestions = response.data;

    return JSON.stringify(suggestions, null, 2);
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
};

export default scoreSuggestions;

