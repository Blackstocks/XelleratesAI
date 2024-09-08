'use client';

import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFolder, FaFolderOpen, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading'; // Ensure you have a Loading component

const DocumentModal = ({ startupId, allowedDocumentTypes, isOpen, handleCloseModal }) => {
  const [stages, setStages] = useState([]);
  const [documentsByStage, setDocumentsByStage] = useState({});
  const [openFolderStage, setOpenFolderStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null); // State to store selected document URL
  const [isDocumentViewerOpen, setDocumentViewerOpen] = useState(false); // State to control the document viewer modal

  const stageOrder = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'IPO'];

  const fetchDocuments = async () => {
    if (!startupId) return;

    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from('company_profile')
      .select('profile_id')
      .eq('id', startupId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      setLoading(false);
      return;
    }

    const sId = profileData?.profile_id;
    if (!sId) {
      console.error('No profile ID found for the given startup ID.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('company_stage_documents')
      .select('*')
      .eq('startup_id', sId);

    if (error) {
      console.error('Error fetching documents:', error.message);
    } else {
      const grouped = data.reduce((acc, doc) => {
        acc[doc.stage] = doc;
        return acc;
      }, {});

      const sortedStages = Object.keys(grouped).sort(
        (a, b) => stageOrder.indexOf(a) - stageOrder.indexOf(b)
      );

      setStages(sortedStages);
      setDocumentsByStage(grouped);

      const hasAllowedDocuments = Object.values(grouped).some((documents) =>
        Object.keys(documents).some(
          (docType) =>
            allowedDocumentTypes.includes(docType) &&
            !['id', 'startup_id', 'stage', 'created_at'].includes(docType)
        )
      );

      setHasDocuments(hasAllowedDocuments);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [startupId]);

  const toggleFolderStage = (folderName) => {
    setOpenFolderStage(openFolderStage === folderName ? null : folderName);
  };

  const handleDocumentClick = (path) => {
    if (path) {
      setSelectedDocument(path);
      setDocumentViewerOpen(true); // Open the document viewer modal
    }
  };

  const renderStageDocuments = (documents) => (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {Object.entries(documents).map(([docType, filePathText]) => {
        if (
          !allowedDocumentTypes.includes(docType) ||
          ['id', 'startup_id', 'stage', 'created_at'].includes(docType)
        )
          return null;

        let filePaths;
        try {
          filePaths = JSON.parse(filePathText);
        } catch (error) {
          console.error('Error parsing file paths:', error.message);
          filePaths = [];
        }

        if (Array.isArray(filePaths)) {
          console.log(filePaths);
          return filePaths.map((path, index) => (
            <div
              key={`${docType}-${index}`}
              className={`text-center p-2 ${path ? 'cursor-pointer' : 'cursor-not-allowed'}`} // Conditionally set the cursor style
              onClick={path ? () => handleDocumentClick(path) : null} // Only set onClick if path exists
            >
              <div className={`p-4 rounded-lg shadow-md ${path ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-200'}`}>
                <FaFileAlt size={40} className={`mx-auto mb-2 ${path ? 'text-green-500' : 'text-gray-500'}`} />
                <p className="text-sm truncate">
                  {filePaths.length > 1
                    ? `${docType.replace(/_/g, ' ').toUpperCase()} ${index + 1}`
                    : `${docType.replace(/_/g, ' ').toUpperCase()}`}
                </p>
              </div>
            </div>
          ));
        } else {
          const clickable = Boolean(filePaths); // Check if there is a valid file path
          return (
            <div
              key={docType}
              className={`text-center p-2 ${clickable ? 'cursor-pointer' : 'cursor-not-allowed'}`} // Conditionally set the cursor style
              onClick={clickable ? () => handleDocumentClick(filePaths) : null} // Only set onClick if file path is present
            >
              <div className={`p-4 rounded-lg shadow-md ${clickable ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-200'}`}>
                <FaFileAlt size={40} className={`mx-auto mb-2 ${clickable ? 'text-green-500' : 'text-gray-500'}`} />
                <p className="text-sm truncate">{docType.replace(/_/g, ' ').toUpperCase()}</p>
              </div>
            </div>
          );
        }
      })}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={handleCloseModal}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="mb-4 flex justify-between">
          <button
            onClick={handleCloseModal}
            className="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
          >
            <FaArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-center">Startup Documents</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading />
          </div>
        ) : !hasDocuments ? (
          <div className="text-center text-gray-500">No documents present</div>
        ) : (
          stages.map((stage) => (
            <div key={stage} className="mb-4">
              <div
                onClick={() => toggleFolderStage(stage)}
                className="cursor-pointer flex items-center space-x-2"
              >
                {openFolderStage === stage ? (
                  <FaFolderOpen size={40} className="text-yellow-500" />
                ) : (
                  <FaFolder size={40} className="text-yellow-500" />
                )}
                <span className="text-xl font-semibold">{stage}</span>
              </div>
              {openFolderStage === stage &&
                renderStageDocuments(documentsByStage[stage] || {})}
            </div>
          ))
        )}
      </div>

      {/* Second Modal for Viewing Document */}
      {isDocumentViewerOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setDocumentViewerOpen(false)} // Close the second modal
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">View Document</h2>
            <iframe
              src={selectedDocument}
              title="Document Viewer"
              className="w-full h-[60vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentModal;
