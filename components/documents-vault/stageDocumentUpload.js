import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

const StageDocumentUpload = ({ startupId, companyName, onUploadComplete, onDocumentUpload, selectedStage, setSelectedStage  }) => {
  const [uploading, setUploading] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [documents, setDocuments] = useState({
    coi: null,
    aoa: null,
    moa: null,
    pitch_deck: null,
    termsheet: null,
    ddr: null,
    transaction_spa: null,
    transaction_shd: null,
    transaction_ssa: null,
    transaction_mou: null,
    transaction_nda: null,
    transaction_safe_notes: null,
    condition_precedent: [],
    closing_docs: [],
    condition_subsequent: [],
    board_meeting: null,
    shareholder_meeting: null,
    abm: null,
    mis: null,
    audited_financials: null,
    unaudited_financials: null,
  });
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleStageChange = (event) => {
    setSelectedStage(event.target.value);
  };

  const handleFileChange = (event, documentType) => {
    const files = Array.from(event.target.files); // Convert FileList to Array
  
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [documentType]: ['condition_precedent', 'condition_subsequent', 'closing_docs'].includes(documentType)
        ? files // Store multiple files
        : files[0], // Store single file
    }));
  };
  

  const handleUpload = async () => {
    setUploading(true);

    // Helper function to delete existing files before uploading new ones
    const deleteExistingFile = async (docType) => {
      const prefixPath = `${startupId}/${selectedStage}/${docType}/`;
      const { data: existingFiles, error } = await supabase.storage
        .from('startup_stage_documents')
        .list(prefixPath);

      if (error) {
        console.error('Error listing files:', error.message);
        return;
      }

      if (existingFiles && existingFiles.length > 0) {
        const pathsToDelete = existingFiles.map((file) => `${prefixPath}${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('startup_stage_documents')
          .remove(pathsToDelete);
        if (deleteError) {
          console.error('Error deleting files:', deleteError.message);
        }
      }
    };

    const uploadPromises = Object.keys(documents).map(async (docType) => {
      const doc = documents[docType];
      if (doc) {
        // Delete existing files before uploading new ones
        await deleteExistingFile(docType);

        if (Array.isArray(doc)) {
          // Handle multiple file uploads
          const multipleUploadPromises = doc.map(async (file) => {
            const filePath = `${startupId}/${selectedStage}/${docType}/${file.name}`;
            const { error: uploadError } = await supabase.storage
              .from('startup_stage_documents')
              .upload(filePath, file, { upsert: true });

            if (uploadError) {
              console.error(`Error uploading ${docType}:`, uploadError.message);
              return { success: false, docType };
            }

            return { success: true, docType, filePath };
          });
          return Promise.all(multipleUploadPromises);
        } else {
          const filePath = `${startupId}/${selectedStage}/${docType}/${doc.name}`;
          const { error: uploadError } = await supabase.storage
            .from('startup_stage_documents')
            .upload(filePath, doc, { upsert: true });

          if (uploadError) {
            console.error(`Error uploading ${docType}:`, uploadError.message);
            return { success: false, docType };
          }

          return { success: true, docType, filePath };
        }
      }
      return { success: true, docType, filePath: null };
    });

    const results = await Promise.all(uploadPromises.flat());

    // Construct file data to insert or update in the database
    const fileData = results.reduce((acc, result) => {
        // If the result is an array, iterate over each item
        if (Array.isArray(result)) {
          result.forEach((item) => {
            if (item.success && item.filePath) {
              if (!acc[item.docType]) {
                // Initialize as an array if it does not exist
                acc[item.docType] = [];
              }
              acc[item.docType].push(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${item.filePath}`);
            }
          });
        } else if (result.success && result.filePath) {
          // Handle single object cases
          if (Array.isArray(acc[result.docType])) {
            acc[result.docType].push(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${result.filePath}`);
          } else {
            acc[result.docType] = [`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${result.filePath}`];
          }
        }
        return acc;
      }, {});

    console.log("results data: ", results);
    console.log("file data: ", fileData);

    const { data, error: upsertError } = await supabase
      .from('company_stage_documents')
      .upsert(
        {
          startup_id: startupId,
          stage: selectedStage,
          ...fileData,
        },
        { onConflict: ['startup_id', 'stage'] }
      );

      if (!upsertError) {
        onUploadComplete(selectedStage); // Notify Vault component of the new stage upload
        onDocumentUpload(); // Notify Vault component to handle additional changes like toast and collapse
        setSelectedStage(''); // Reset the dropdown after upload
      }
  
      setUploading(false);
  };

  const openTransactionModal = () => setShowTransactionModal(true);
  const closeTransactionModal = () => setShowTransactionModal(false);

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white max-w-5xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload Documents</h3>
      <div className="flex justify-center mb-6 w-2/12 m-auto">
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="text-sm text-center m-auto border p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm w-72"
        >
          <option value="" className="text-gray-500">Select Stage</option>
          {['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'IPO'].map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      {selectedStage && (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 gap-6">
            {/* Company Info */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Company Info</h4>
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
                {['coi', 'aoa', 'moa', 'pitch_deck'].map((docType, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                    <div className="flex items-center">
                      {documents[docType] && (
                        <span className="text-sm text-gray-500 mx-4 text-right">
                          {Array.isArray(documents[docType])
                            ? documents[docType].map((file) => file.name).join(', ')
                            : documents[docType].name}
                        </span>
                      )}
                      <label className="flex items-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a3 3 0 00-3 3v2H3a1 1 0 000 2h2v8a1 1 0 001 1h8a1 1 0 001-1v-8h2a1 1 0 100-2h-2V5a3 3 0 00-3-3H8zm1 7V5a1 1 0 012 0v4h3l-4 4-4-4h3z"/>
                        </svg>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, docType)}
                          className="hidden"
                        />
                      </label>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Documents</h4>
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
                {['termsheet', 'ddr', 'condition_precedent', 'closing_docs', 'condition_subsequent'].map((docType, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                    <div className="flex items-center">
                      {documents[docType] && (
                        <span className="text-sm text-gray-500 mx-4 text-right">
                          {Array.isArray(documents[docType])
                            ? documents[docType].map((file) => file.name).join(', ')
                            : documents[docType].name}
                        </span>
                      )}
                      <label className="flex items-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a3 3 0 00-3 3v2H3a1 1 0 000 2h2v8a1 1 0 001 1h8a1 1 0 001-1v-8h2a1 1 0 100-2h-2V5a3 3 0 00-3-3H8zm1 7V5a1 1 0 012 0v4h3l-4 4-4-4h3z"/>
                        </svg>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, docType)}
                          className="hidden"
                          multiple={['condition_precedent', 'closing_docs', 'condition_subsequent'].includes(docType)}
                        />
                      </label>
                    </div>
                  </div>
                  
                ))}
                <div className="flex justify-between items-center mb-2"  onClick={openTransactionModal}>
                <span className="text-sm text-gray-700">
                  TRANSACTION DOCUMENTS
                  </span>
                <label className="flex items-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a3 3 0 00-3 3v2H3a1 1 0 000 2h2v8a1 1 0 001 1h8a1 1 0 001-1v-8h2a1 1 0 100-2h-2V5a3 3 0 00-3-3H8zm1 7V5a1 1 0 012 0v4h3l-4 4-4-4h3z"/>
                        </svg>
                      </label>
                </div>
               
              </div>
            </div>

            {/* Approvals */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Approvals</h4>
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
                {['board_meeting', 'shareholder_meeting', 'abm'].map((docType, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                    <div className="flex items-center">
                      {documents[docType] && (
                        <span className="text-sm text-gray-500 mx-4 text-right">
                          {Array.isArray(documents[docType])
                            ? documents[docType].map((file) => file.name).join(', ')
                            : documents[docType].name}
                        </span>
                      )}
                      <label className="flex items-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a3 3 0 00-3 3v2H3a1 1 0 000 2h2v8a1 1 0 001 1h8a1 1 0 001-1v-8h2a1 1 0 100-2h-2V5a3 3 0 00-3-3H8zm1 7V5a1 1 0 012 0v4h3l-4 4-4-4h3z"/>
                        </svg>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, docType)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Information Rights */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Information Rights</h4>
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
                {['mis', 'audited_financials', 'unaudited_financials'].map((docType, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                    <div className="flex items-center">
                      {documents[docType] && (
                        <span className="text-sm text-gray-500 mx-4 text-right">
                          {Array.isArray(documents[docType])
                            ? documents[docType].map((file) => file.name).join(', ')
                            : documents[docType].name}
                        </span>
                      )}
                      <label className="flex items-center cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a3 3 0 00-3 3v2H3a1 1 0 000 2h2v8a1 1 0 001 1h8a1 1 0 001-1v-8h2a1 1 0 100-2h-2V5a3 3 0 00-3-3H8zm1 7V5a1 1 0 012 0v4h3l-4 4-4-4h3z"/>
                        </svg>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, docType)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal for Transaction Documents */}
          {showTransactionModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-3/5 relative">
                {/* Close button */}
                <button
                  onClick={closeTransactionModal}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                >
                  X
                </button>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  Upload Transaction Documents
                </h3>
                {/* List of transaction document types */}
                {['transaction_spa', 'transaction_shd', 'transaction_ssa', 'transaction_mou', 'transaction_nda', 'transaction_safe_notes'].map((docType) => (
                  <div key={docType} className="flex justify-between items-center mb-4">
                    <span className="flex-grow text-sm text-gray-700">
                      {docType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {documents[docType] && (
                                  <span className="text-sm text-gray-500 mx-4 text-right">
                                    {Array.isArray(documents[docType])
                                      ? documents[docType].map((file) => file.name).join(', ')
                                      : documents[docType].name}
                                  </span>
                                )}
                    <label className="flex items-center cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-500 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 2a3 3 0 00-3 3v2H3a1 1 0 000 2h2v8a1 1 0 001 1h8a1 1 0 001-1v-8h2a1 1 0 100-2h-2V5a3 3 0 00-3-3H8zm1 7V5a1 1 0 012 0v4h3l-4 4-4-4h3z" />
                      </svg>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, docType)}
                        className="hidden"
                      />
                    </label>
                  </div>
                ))}
                {/* Close modal button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={closeTransactionModal}
                    className="bg-gray-200 text-gray-700 py-2 px-6 rounded hover:bg-gray-300 transition duration-200 ease-in-out"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}


          <div className="flex justify-center mt-8">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out shadow-md"
            >
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </button>
          </div>
        </div>
      )}
    </div>


  );
};

export default StageDocumentUpload;
