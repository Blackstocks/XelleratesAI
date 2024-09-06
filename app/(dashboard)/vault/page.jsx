'use client';
import React, { useState, useEffect } from 'react';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/app/loading';
import { FaFolder, FaFileAlt } from 'react-icons/fa';
import Chatbot from '@/components/chatbot';
import StageDocumentUpload from '@/components/documents-vault/stageDocumentUpload';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify'; 

const Vault = () => {
  const {
    founderInformation = {},
    ctoInfo = {},
    companyDocuments = {},
    loading,
    error,
    profile,
  } = useCompleteUserDetails();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openFolder, setOpenFolder] = useState(null);
  const [stages, setStages] = useState([]);
  const [documentsByStage, setDocumentsByStage] = useState({});
  const [selectedStage, setSelectedStage] = useState(''); // State to control the dropdown

  // Fetch documents from the database
  const fetchDocuments = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('company_stage_documents')
      .select('*')
      .eq('startup_id', profile.id);

    if (error) {
      console.error('Error fetching documents:', error.message);
    } else {
      const grouped = data.reduce((acc, doc) => {
        acc[doc.stage] = doc; // Store documents by stage
        return acc;
      }, {});

      setStages(Object.keys(grouped)); // Set unique stages
      setDocumentsByStage(grouped); // Group documents by stage
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [profile?.id]);

  const openModal = (documentUrl) => {
    setSelectedDocument(documentUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDocument(null);
  };

  const handleUploadComplete = (newStage) => {
    setStages((prevStages) => [...new Set([...prevStages, newStage])]);
    setOpenFolder(null); // Collapse the table by closing any open folder
    setSelectedStage(''); // Reset the dropdown to "Select Stage"
    fetchDocuments(); // Re-fetch documents to update state after new uploads
  };

  // New callback to handle changes after document upload
  const handleDocumentUpload = () => {
    setOpenFolder(null); // Collapse the table
    setSelectedStage(''); // Reset the dropdown to "Select Stage"
    toast.success('Documents uploaded successfully'); // Show success toast
  };

  const toggleFolder = (folderName) => {
    setOpenFolder(openFolder === folderName ? null : folderName);
  };

  // Render the uploaded documents in the folders
  const renderDocuments = (documents, requiredKeys) => (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {requiredKeys.map((key) => (
        <div
          key={key}
          onClick={() => documents && documents[key] && openModal(documents[key])}
          className="cursor-pointer text-center"
        >
          <div
            className={`p-4 rounded-lg shadow-md ${
              documents && documents[key] ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-200'
            }`}
          >
            <FaFileAlt
              size={40}
              className={`mx-auto mb-2 ${
                documents && documents[key] ? 'text-green-500' : 'text-gray-500'
              }`}
            />
            <p className="text-sm truncate">{key.replace(/_/g, ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // Render documents grouped by stages in folders
  const renderStageDocuments = (documents) => (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {Object.entries(documents).map(([docType, filePathText]) => {
        if (!filePathText || ['id', 'startup_id', 'stage', 'created_at'].includes(docType)) return null;
  
        let filePaths;
        try {
          // Parse the text as JSON to get the array of file paths
          filePaths = JSON.parse(filePathText);
        } catch (error) {
          console.error('Error parsing file paths:', error.message);
          filePaths = []; // Default to an empty array if parsing fails
        }
  
        if (Array.isArray(filePaths)) {
          // Handle cases where the file paths are parsed into an array
          return filePaths.map((path, index) => (
            <div
              key={`${docType}-${index}`}
              onClick={() => openModal(path)}
              className="cursor-pointer text-center"
            >
              <div className="p-4 rounded-lg shadow-md bg-green-200 hover:bg-green-300">
                <FaFileAlt size={40} className="mx-auto mb-2 text-green-500" />
                <p className="text-sm truncate">{   filePaths.length > 1 ?   `${docType.replace(/_/g, ' ').toUpperCase()} ${index + 1}` :`${docType.replace(/_/g, ' ').toUpperCase()}` }</p>
              </div>
            </div>
          ));
        } else {
          // Handle single file path cases (if any)
          return (
            <div
              key={docType}
              onClick={() => openModal(filePathText)}
              className="cursor-pointer text-center"
            >
              <div className="p-4 rounded-lg shadow-md bg-green-200 hover:bg-green-300">
                <FaFileAlt size={40} className="mx-auto mb-2 text-green-500" />
                <p className="text-sm truncate">{docType.replace(/_/g, ' ')}</p>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
  

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Documents Vault</h2>
      {loading && <Loading />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <StageDocumentUpload
            startupId={profile?.id}
            companyName={profile?.company_name}
            onUploadComplete={handleUploadComplete}
        onDocumentUpload={handleDocumentUpload} // Pass the new callback to handle upload changes
        selectedStage={selectedStage} // Pass the dropdown state to control it
        setSelectedStage={setSelectedStage}
          />

          <div className="space-y-4 mt-6">
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
                renderDocuments(
                  companyDocuments,
                  Object.keys(companyDocuments).filter((key) => !['id', 'company_id', 'created_at'].includes(key))
                )}
            </div>

            {stages.map((stage) => (
              <div key={stage}>
                <div
                  onClick={() => toggleFolder(stage)}
                  className="cursor-pointer flex items-center space-x-2"
                >
                  <FaFolder size={40} className="text-yellow-500" />
                  <span className="text-xl font-semibold">{stage}</span>
                </div>
                {openFolder === stage &&
                  renderStageDocuments(documentsByStage[stage] || {})}
              </div>
            ))}
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
