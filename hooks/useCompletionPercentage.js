import { useState, useEffect } from 'react';

const useCompletionPercentage = ({
  profile,
  companyProfile,
  businessDetails,
  founderInformation,
  fundingInformation,
  ctoInfo,
  companyDocuments,
  investorSignup,
}) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletionPercentage = async () => {
      if (!profile) return;

      setLoading(true);

      try {
        const response = await fetch('/api/calculateCompletion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile,
            companyProfile,
            businessDetails,
            founderInformation,
            fundingInformation,
            ctoInfo,
            companyDocuments,
            investorSignup,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCompletionPercentage(data.completionPercentage);
        } else {
          console.error('Failed to calculate completion percentage');
        }
      } catch (error) {
        console.error('Failed to calculate completion percentage', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionPercentage();
  }, [
    profile,
    companyProfile,
    businessDetails,
    founderInformation,
    fundingInformation,
    ctoInfo,
    companyDocuments,
    investorSignup,
  ]);

  return { completionPercentage, loading };
};

export default useCompletionPercentage;
