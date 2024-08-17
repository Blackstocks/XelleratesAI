'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { FaFileAlt } from 'react-icons/fa';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/app/loading';

const DocumentList = () => {
  const searchParams = useSearchParams();
  const folderName = searchParams.get('folderName'); // Capture folder name from the dynamic route

  const {
    founderInformation = {},
    ctoInfo = {},
    companyDocuments = {},
    loading,
    error,
  } = useCompleteUserDetails();

  // Map the folderName to the correct documents object
  const documents = {
    founderInformation,
    ctoInfo,
    companyDocuments,
  }[folderName] || {};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {folderName ? folderName.replace(/([A-Z])/g, ' $1').trim() : 'Documents'}
      </h2>
      {loading && <Loading />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(documents).map(([key, documentUrl]) => (
            <div
              key={key}
              onClick={() => window.open(documentUrl, '_blank')}
              className="cursor-pointer text-center"
            >
              <div className="bg-gray-200 p-4 rounded-lg shadow-md hover:bg-gray-300">
                <FaFileAlt size={40} className="mx-auto mb-2" />
                <p className="text-sm truncate">{key}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;
