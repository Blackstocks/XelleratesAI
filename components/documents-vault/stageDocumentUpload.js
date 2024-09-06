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

  const handleStageChange = (event) => {
    setSelectedStage(event.target.value);
  };

  const handleFileChange = (event, documentType) => {
    const files = Array.from(event.target.files); // Convert FileList to Array
    if (['condition_precedent', 'condition_subsequent', 'closing_docs'].includes(documentType)) {
      setDocuments((prevDocuments) => ({
        ...prevDocuments,
        [documentType]: files, // Replace with new files
      }));
    } else {
      setDocuments({ ...documents, [documentType]: files[0] });
    }
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
    <div className="p-6 border rounded-lg shadow-md bg-white max-w-5xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center">Upload Documents</h3>
      <div className="flex justify-center mb-4">
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Stage</option>
          {['pre-seed', 'seed', 'series A', 'series B'].map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </div>

      {selectedStage && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-600">Company Info</th>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-600">Documents</th>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-600">Approvals</th>
                <th className="py-3 px-4 border-b text-left font-medium text-gray-600">Information Rights</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Company Info Documents */}
                <td className="py-2 px-4 border-b">
                  {['coi', 'aoa', 'moa', 'pitch_deck'].map((docType, index) => (
                    <div key={index} className="flex flex-col items-center mb-2">
                      <span className="text-gray-800">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, docType)}
                        className="border rounded p-1 w-36 focus:outline-none"
                      />
                    </div>
                  ))}
                </td>
                {/* Documents */}
                <td className="py-2 px-4 border-b">
                  {[
                    'termsheet',
                    'ddr',
                    'condition_precedent',
                    'closing_docs',
                    'condition_subsequent'
                  ].map((docType, index) => (
                    <div key={index} className="flex flex-col items-center mb-2">
                      <span className="text-gray-800">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, docType)}
                        className="border rounded p-1 w-36 focus:outline-none"
                        multiple={['condition_precedent', 'closing_docs', 'condition_subsequent'].includes(docType)}
                      />
                    </div>
                  ))}
                  <button
                    onClick={openTransactionModal}
                    className="text-blue-500 underline mt-2"
                  >
                    Transaction Documents
                  </button>
                </td>
                {/* Approvals */}
                <td className="py-2 px-4 border-b">
                  {['board_meeting', 'shareholder_meeting', 'abm'].map((docType, index) => (
                    <div key={index} className="flex flex-col items-center mb-2">
                      <span className="text-gray-800">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, docType)}
                        className="border rounded p-1 w-36 focus:outline-none"
                      />
                    </div>
                  ))}
                </td>
                {/* Information Rights */}
                <td className="py-2 px-4 border-b">
                  {['mis', 'audited_financials', 'unaudited_financials'].map((docType, index) => (
                    <div key={index} className="flex flex-col items-center mb-2">
                      <span className="text-gray-800">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, docType)}
                        className="border rounded p-1 w-36 focus:outline-none"
                      />
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </button>
          </div>
        </div>
      )}

      {/* Modal for Transaction Documents */}
      {showTransactionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-3/5 relative">
            <button
              onClick={closeTransactionModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              X
            </button>
            <h3 className="text-xl font-bold mb-4">Upload Transaction Documents</h3>
            {[
              'transaction_spa',
              'transaction_shd',
              'transaction_ssa',
              'transaction_mou',
              'transaction_nda',
              'transaction_safe_notes'
            ].map((docType) => (
              <div key={docType} className="flex items-center mb-2">
                <span className="flex-grow text-gray-800">{docType.replace(/_/g, ' ').toUpperCase()}</span>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, docType)}
                  className="border rounded p-1 w-36 focus:outline-none"
                />
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <button
                onClick={closeTransactionModal}
                className="bg-gray-200 text-gray-700 py-1 px-4 rounded mr-2 hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageDocumentUpload;
