import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseclient';

const StageDocumentUpload = ({ startupId, onUploadComplete, onDocumentUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDocType, setDeleteDocType] = useState('');
  const [filesInFolder, setFilesInFolder] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState('');
  const [documents, setDocuments] = useState({
    // Company Info
    coi: null,
    aoa: null,
    moa: null,
    pitchdeck: null,

    // Approvals
    board_meeting: null,
    share_holder_meeting: null,
    avm: null,

    // Information Rights
    mis: null,
    audited_financials: null,
    unaudited_financials: null,

    // Series Wise Documents
    termsheet: [],
    cap_table: [],
    due_diligence: [],
    transaction_docs: [],
    condition_pre: [],
    closing_docs: [],
    condition_subseq: [],
  });

  const companyInfoDocuments = new Set(['coi', 'aoa', 'moa', 'pitchdeck']);
  const approvalsDocuments = new Set(['board_meeting', 'share_holder_meeting', 'avm']);
  const informationRightsDocuments = new Set(['mis', 'audited_financials', 'unaudited_financials']);
  const seriesWiseDocuments = new Set([
    'termsheet',
    'cap_table',
    'due_diligence',
    'transaction_docs',
    'condition_pre',
    'closing_docs',
    'condition_subseq',
  ]);
  const multipleFileDocuments = new Set([
    'termsheet',
    'cap_table',
    'due_diligence',
    'transaction_docs',
    'condition_pre',
    'closing_docs',
    'condition_subseq',
  ]);

  const handleFileChange = (event, documentType) => {
    const files = Array.from(event.target.files);
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [documentType]: multipleFileDocuments.has(documentType) ? files : files[0],
    }));
  };

  const getFilePath = (docType, fileName) => {
    if (companyInfoDocuments.has(docType)) {
      return `${startupId}/company_info/${docType}/${fileName}`;
    } else if (approvalsDocuments.has(docType)) {
      return `${startupId}/approvals/${docType}/${fileName}`;
    } else if (informationRightsDocuments.has(docType)) {
      return `${startupId}/information_rights/${docType}/${fileName}`;
    } else if (seriesWiseDocuments.has(docType)) {
      return `${startupId}/series_wise/${selectedSeries}/${docType}/${fileName}`;
    } else {
      return `${startupId}/others/${docType}/${fileName}`;
    }
  };

  const handleUpload = async () => {
    setUploading(true);

    const uploadPromises = Object.keys(documents).map(async (docType) => {
      const doc = documents[docType];
      if (doc) {
        if (Array.isArray(doc)) {
          // Multiple files
          const multipleUploadPromises = doc.map(async (file) => {
            const filePath = getFilePath(docType, file.name);
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
          // Single file
          const filePath = getFilePath(docType, doc.name);
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

    // Process results to prepare fileData for upsert
    const fileData = {};
    results.forEach((result) => {
      if (Array.isArray(result)) {
        result.forEach((item) => {
          if (item.success && item.filePath) {
            if (!fileData[item.docType]) {
              fileData[item.docType] = [];
            }
            fileData[item.docType].push(item.filePath);
          }
        });
      } else if (result.success && result.filePath) {
        fileData[result.docType] = result.filePath;
      }
    });

    // Upsert into database (adjust the table and columns as necessary)
    const { data, error: upsertError } = await supabase
      .from('company_stage_documents')
      .upsert(
        {
          startup_id: startupId,
          series: selectedSeries,
          ...fileData,
        },
        { onConflict: ['startup_id', 'series'] }
      );

    if (!upsertError) {
      onUploadComplete(selectedSeries);
      onDocumentUpload();
      setSelectedSeries('');
      setShowUploadModal(false);
    }

    setUploading(false);
  };

  const handleDeleteFile = async (documentType) => {
    const isMultiple = multipleFileDocuments.has(documentType);
    let path = '';

    if (companyInfoDocuments.has(documentType)) {
      path = `${startupId}/company_info/${documentType}/`;
    } else if (approvalsDocuments.has(documentType)) {
      path = `${startupId}/approvals/${documentType}/`;
    } else if (informationRightsDocuments.has(documentType)) {
      path = `${startupId}/information_rights/${documentType}/`;
    } else if (seriesWiseDocuments.has(documentType)) {
      if (!selectedSeries) {
        alert('Please select a series to delete documents from.');
        return;
      }
      path = `${startupId}/series_wise/${selectedSeries}/${documentType}/`;
    }

    const { data: files, error } = await supabase.storage
      .from('startup_stage_documents')
      .list(path);

    if (error) {
      console.error('Error listing files:', error.message);
      return;
    }

    if (files && files.length > 0) {
      if (isMultiple) {
        setFilesInFolder(files);
        setDeleteDocType(documentType);
        setShowDeleteModal(true);
      } else {
        const confirmDelete = window.confirm(
          `Do you want to delete the ${documentType.replace(/_/g, ' ').toUpperCase()} document?`
        );
        if (!confirmDelete) return;

        const pathsToDelete = files.map((file) => `${path}${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('startup_stage_documents')
          .remove(pathsToDelete);

        if (deleteError) {
          console.error('Error deleting files:', deleteError.message);
          return;
        }

        setDocuments((prevDocuments) => ({
          ...prevDocuments,
          [documentType]: null,
        }));
      }
    }
  };

  const handleDeleteSelectedFiles = async (selectedFiles) => {
    let path = '';

    if (companyInfoDocuments.has(deleteDocType)) {
      path = `${startupId}/company_info/${deleteDocType}/`;
    } else if (approvalsDocuments.has(deleteDocType)) {
      path = `${startupId}/approvals/${deleteDocType}/`;
    } else if (informationRightsDocuments.has(deleteDocType)) {
      path = `${startupId}/information_rights/${deleteDocType}/`;
    } else if (seriesWiseDocuments.has(deleteDocType)) {
      path = `${startupId}/series_wise/${selectedSeries}/${deleteDocType}/`;
    }

    const pathsToDelete = selectedFiles.map((fileName) => `${path}${fileName}`);
    const { error: deleteError } = await supabase.storage
      .from('startup_stage_documents')
      .remove(pathsToDelete);

    if (deleteError) {
      console.error('Error deleting files:', deleteError.message);
      return;
    }

    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [deleteDocType]: prevDocuments[deleteDocType].filter(
        (file) => !selectedFiles.includes(file.name)
      ),
    }));

    setShowDeleteModal(false);
    setFilesInFolder([]);
    setDeleteDocType('');
  };

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white max-w-5xl mx-auto">
  {/* Upload Documents Button */}
  <div className="flex justify-center mb-6">
    <button
      onClick={openUploadModal}
      className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none"
    >
      Upload Documents
    </button>
  </div>

  {/* Upload Modal */}
  {showUploadModal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div className="bg-white p-8 rounded-lg shadow-lg w-3/5 relative max-h-[60vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={closeUploadModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          X
        </button>
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Upload Documents</h3>

        {/* Company Info Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Company Info</h4>
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
            {Array.from(companyInfoDocuments).map((docType) => (
              <div key={docType} className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">{docType.toUpperCase()}</span>
                <label className="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 hover:text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v16h16V4M12 12v4m0 0h-4m4 0h4M8 8l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, docType)}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Approvals Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Approvals</h4>
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
            {Array.from(approvalsDocuments).map((docType) => (
              <div key={docType} className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">{docType.toUpperCase().replace(/_/g, ' ')}</span>
                <label className="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 hover:text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v16h16V4M12 12v4m0 0h-4m4 0h4M8 8l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, docType)}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Information Rights Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Information Rights</h4>
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
            {Array.from(informationRightsDocuments).map((docType) => (
              <div key={docType} className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">{docType.toUpperCase().replace(/_/g, ' ')}</span>
                <label className="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 hover:text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v16h16V4M12 12v4m0 0h-4m4 0h4M8 8l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, docType)}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Series Wise Documents Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-700">Series Wise Documents</h4>
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="text-sm border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            >
              <option value="" className="text-gray-500">
                Select Series
              </option>
              {['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'IPO'].map(
                (series) => (
                  <option key={series} value={series}>
                    {series}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-md">
            {Array.from(seriesWiseDocuments).map((docType) => (
              <div key={docType} className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">{docType.toUpperCase().replace(/_/g, ' ')}</span>
                <label className="cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 hover:text-blue-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v16h16V4M12 12v4m0 0h-4m4 0h4M8 8l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, docType)}
                    className="hidden"
                    disabled={!selectedSeries}
                    multiple
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Upload button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedSeries}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            {uploading ? 'Uploading...' : 'Upload Documents'}
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default StageDocumentUpload;
