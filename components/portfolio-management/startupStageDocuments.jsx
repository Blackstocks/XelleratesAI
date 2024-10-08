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
    <ul className="overflow-y-auto max-h-60">
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
          return filePaths.map((path, index) => (
            <li
              key={`${docType}-${index}`}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
              onClick={() => handleDocumentClick(path)}
            >
              <FaFileAlt className="text-blue-500 mr-3" />
              <span className="text-sm">{filePaths.length > 1
                ? `${docType.replace(/_/g, ' ').toUpperCase()} ${index + 1}`
                : `${docType.replace(/_/g, ' ').toUpperCase()}`}
              </span>
            </li>
          ));
        } else {
          const clickable = Boolean(filePaths);
          return (
            <li
              key={docType}
              className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 ${clickable ? '' : 'opacity-50 cursor-not-allowed'}`}
              onClick={clickable ? () => handleDocumentClick(filePaths) : null}
            >
              <FaFileAlt className={`${clickable ? 'text-blue-500' : 'text-gray-400'} mr-3`} />
              <span className="text-sm">{docType.replace(/_/g, ' ').toUpperCase()}</span>
            </li>
          );
        }
      })}
    </ul>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
  <div
    className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative"
    style={{ height: '60vh', overflow: 'hidden' }} // Ensure the modal has fixed height and hidden overflow for outer container
  >
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

    <div className="overflow-y-auto h-[calc(60vh-120px)]"> {/* Make content scrollable */}
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
              className="cursor-pointer flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 shadow-sm transition-all duration-300"
            >
              {openFolderStage === stage ? (
                <FaFolderOpen size={20} className="text-blue-600" />
              ) : (
                <FaFolder size={20} className="text-blue-600" />
              )}
              <span className="text-lg font-semibold">{stage}</span>
            </div>
            {openFolderStage === stage && renderStageDocuments(documentsByStage[stage] || {})}
          </div>
        ))
      )}
    </div>
  </div>

  {isDocumentViewerOpen && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setDocumentViewerOpen(false)}
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
