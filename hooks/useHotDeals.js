import { useState, useEffect } from 'react';

const useHotDeals = () => {
  const [hotDeals, setHotDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotDeals = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/hot-deals');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setHotDeals(data);
      } catch (error) {
        console.error('Error fetching hot deals:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotDeals();
  }, []);

  return { hotDeals, loading, error };
};

export default useHotDeals;
