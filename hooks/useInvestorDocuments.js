import { useState, useEffect } from 'react';
import { fetchInvestorDocuments } from '@/lib/actions/investorActions';

const useInvestorDocuments = (documentId) => {
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // flag to track component mounting status

    const getDocuments = async () => {
      setLoading(true);
      try {
        const result = await fetchInvestorDocuments(profileId);
        if (isMounted) {
          if (result.error) {
            setError(result.error);
          } else {
            setDocuments(result);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getDocuments();

    return () => {
      isMounted = false; // cleanup flag to avoid state updates if unmounted
    };
  }, [documentId]);

  return { documents, loading, error };
};

export default useInvestorDocuments;
