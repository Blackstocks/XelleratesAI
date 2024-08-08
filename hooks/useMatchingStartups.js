import { useState, useEffect } from 'react';

const useMatchingStartups = (investorId) => {
  const [matchingStartups, setMatchingStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchMatchingStartups = async () => {
      try {
        const response = await fetch(
          `/api/matchStartups?investorId=${investorId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch matching startups');
        }

        const data = await response.json();
        setMatchingStartups(data.startups);
        setCount(data.count);
      } catch (error) {
        console.error('Error fetching matching startups:', error);
      } finally {
        setLoading(false);
      }
    };

    if (investorId) {
      fetchMatchingStartups();
    }
  }, [investorId]);

  return { matchingStartups, loading, count };
};

export default useMatchingStartups;
