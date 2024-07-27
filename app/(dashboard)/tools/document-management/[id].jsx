import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { fetchInvestorDocuments } from '@/lib/actions/investorActions';
import Loading from '@/components/Loading';

const DocumentPage = () => {
  const router = useRouter();
  const { id: profileId } = router.query;
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profileId) {
      fetchDocuments(profileId);
    }
  }, [profileId]);

  const fetchDocuments = async (profileId) => {
    const result = await fetchInvestorDocuments(profileId);
    if (result.error) {
      setError(result.error);
    } else {
      setDocuments(result);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (documents.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      {documents.map((document) => (
        <div key={document.id} style={{ marginBottom: '20px' }}>
          <h2>{document.company_name}</h2>
          <img
            src={document.company_logo}
            alt={`${document.company_name} logo`}
            style={{ width: '100px' }}
          />
          <p>NDA: {document.nda || 'N/A'}</p>
          {/* Render other document details here */}
        </div>
      ))}
    </div>
  );
};

export default DocumentPage;
