import { useState, useEffect } from 'react';
import { fetchInvestorDocuments } from '@/lib/actions/investorActions';

const useFetchDocuments = (profileId) => {
  const [documents, setDocuments] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoaded(true);
      const result = await fetchInvestorDocuments(profileId);
      if (result.error) {
        setError(result.error);
        setDocuments([]);
      } else {
        setDocuments(Array.isArray(result) ? result : [result]);
      }
      setIsLoaded(false);
    };

    if (profileId) {
      fetchDocuments();
    }
  }, [profileId]);

  return { documents, isLoaded, error };
};

export default useFetchDocuments;
