'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { FaTrashAlt, FaEye, FaUpload, FaTimes } from 'react-icons/fa';

const AddFiles = ({ isOpen, onClose, investorId, startupId }) => {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState(null); // State for file view modal
  const [confirmDelete, setConfirmDelete] = useState({ open: false, fileName: '' }); // State for delete confirmation

  useEffect(() => {
    if (isOpen) {
      fetchUploadedFiles();
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadSuccess(false); // Reset success message
  };

  // Fetch uploaded files from the bucket
  const fetchUploadedFiles = async () => {
    try {
      const path = `${investorId}/${startupId}/`;
      const { data, error } = await supabase.storage
        .from('investor_startup_documents')
        .list(path, { limit: 100 }); // Adjust limit as needed

      if (error) {
        console.error('Error fetching files:', error.message);
      } else {
        setUploadedFiles(data || []);
      }
    } catch (err) {
      console.error('Unexpected Error:', err.message);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setUploadSuccess(false);

    const filePath = `${investorId}/${startupId}/${file.name}`;
    
    // Upload file to Supabase bucket
    const { error: uploadError } = await supabase.storage
      .from('investor_startup_documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError.message);
    } else {
      console.log('File uploaded successfully.');
      setUploadSuccess(true);
      fetchUploadedFiles(); // Refresh uploaded files list
      setFile(null); // Clear the file input
    }

    setLoading(false);
  };

  // Handle file deletion
  const handleDelete = async (fileName) => {
    const filePath = `${investorId}/${startupId}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('investor_startup_documents')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error.message);
    } else {
      console.log('File deleted successfully.');
      fetchUploadedFiles(); // Refresh uploaded files list
      setConfirmDelete({ open: false, fileName: '' }); // Close confirmation
    }
  };

  // Open file view modal
  const handleViewFile = (filePath) => {
    setViewFileUrl(filePath);
  };

  // Confirm delete action
  const confirmDeleteFile = (fileName) => {
    setConfirmDelete({ open: true, fileName });
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
          <h2 className="text-2xl font-semibold mb-4">Manage Files</h2>

          <div className="flex items-center mb-4">
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:border-blue-500"
            />
            <button 
              onClick={handleUpload}
              className="flex items-center bg-blue-500 text-white px-4 py-2 ml-3 rounded-md hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              <FaUpload className="mr-2" />
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {uploadSuccess && (
            <p className="text-green-500 mt-2 text-sm">File uploaded successfully!</p>
          )}

          <h3 className="text-xl font-semibold mt-6 mb-2">Uploaded Files</h3>
          <div className="bg-gray-50 rounded-md shadow-sm max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File Name</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadedFiles.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-100">
                    <td className="px-4 py-2 text-sm text-gray-700">{file.name}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleViewFile(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/investor_startup_documents/${investorId}/${startupId}/${file.name}`)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => confirmDeleteFile(file.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* File View Modal */}
          {viewFileUrl && (
            <div className="fixed inset-0 flex items-center justify-center z-30 bg-black bg-opacity-75">
              <div className="bg-white p-4 rounded-md shadow-md max-w-2xl w-full relative">
                <button
                  onClick={() => setViewFileUrl(null)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                >
                  <FaTimes size={20} />
                </button>
                <iframe src={viewFileUrl} className="w-full h-[60vh]" title="View File" />
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {confirmDelete.open && (
            <div className="fixed inset-0 flex items-center justify-center z-30 bg-black bg-opacity-75">
              <div className="bg-white p-4 rounded-md shadow-md max-w-sm w-full relative">
                <p className="text-center">Are you sure you want to delete this file?</p>
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={() => handleDelete(confirmDelete.fileName)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                  >
                    Yes, Delete
                  </button>
                  <button 
                    onClick={() => setConfirmDelete({ open: false, fileName: '' })}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
                <button
                  onClick={() => setConfirmDelete({ open: false, fileName: '' })}
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default AddFiles;
