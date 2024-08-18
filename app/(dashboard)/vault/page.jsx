'use client';
import React, { useState } from 'react';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/app/loading';
import { FaFolder, FaFileAlt } from 'react-icons/fa';
import Chatbot from '@/components/chatbot';

const Vault = () => {
  const {
    founderInformation = {},
    ctoInfo = {},
    companyDocuments = {},
    loading,
    error,
  } = useCompleteUserDetails();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openFolder, setOpenFolder] = useState(null); // Track which folder is open

  const openModal = (documentUrl) => {
    setSelectedDocument(documentUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDocument(null);
  };

  const toggleFolder = (folderName) => {
    setOpenFolder(openFolder === folderName ? null : folderName);
  };

  const renderDocuments = (documents, requiredKeys) => (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {requiredKeys.map((key) => (
        <div
          key={key}
          onClick={() => documents && documents[key] && openModal(documents[key])} // Add documents check here
          className="cursor-pointer text-center"
        >
          <div
            className={`p-4 rounded-lg shadow-md ${
              documents && documents[key] ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-200' // Add documents check here
            }`}
          >
            <FaFileAlt
              size={40}
              className={`mx-auto mb-2 ${
                documents && documents[key] ? 'text-green-500' : 'text-gray-500' // Add documents check here
              }`}
            />
            <p className="text-sm truncate">{key.replace(/_/g, ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Documents Vault</h2>
      {loading && <Loading />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="space-y-4">
            <div>
              <div
                onClick={() => toggleFolder('founderInformation')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <FaFolder size={40} className="text-yellow-500" />
                <span className="text-xl font-semibold">Founder Information</span>
              </div>
              {openFolder === 'founderInformation' &&
                renderDocuments(founderInformation, ['co_founder_agreement'])}
            </div>

            <div>
              <div
                onClick={() => toggleFolder('ctoInfo')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <FaFolder size={40} className="text-yellow-500" />
                <span className="text-xl font-semibold">CTO Information</span>
              </div>
              {openFolder === 'ctoInfo' &&
                renderDocuments(ctoInfo, ['technology_roadmap'])}
            </div>

            <div>
              <div
                onClick={() => toggleFolder('companyDocuments')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <FaFolder size={40} className="text-yellow-500" />
                <span className="text-xl font-semibold">Company Documents</span>
              </div>
              {openFolder === 'companyDocuments' &&
                renderDocuments(companyDocuments, Object.keys(companyDocuments).filter(key => !['id', 'company_id', 'created_at'].includes(key)))}
            </div>
          </div>
        </>
      )}

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 mt-10">
          <div
            className="fixed inset-0 bg-black opacity-75 z-40 mt-10"
            onClick={closeModal}
          ></div>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-3/5 h-4/5 p-6 relative z-50">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {selectedDocument && (
              <iframe
                src={selectedDocument}
                className="w-full h-full"
                title="Document Viewer"
              ></iframe>
            )}
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
};

export default Vault;
