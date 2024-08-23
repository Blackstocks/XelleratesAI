import axios from 'axios';

const getCollegeType = async (collegeName) => {
  try {
    const response = await axios.post('/api/getCollegeTier', { collegeName }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
};

export default getCollegeType;
