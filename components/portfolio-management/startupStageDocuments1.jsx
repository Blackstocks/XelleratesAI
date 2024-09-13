'use client';

import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFolder, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading'; // Ensure you have a Loading component

const DocumentModal = ({ startupId, cardTitle, isOpen, handleCloseModal }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [folderStack, setFolderStack] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // State to store selected document URL

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, startupId, cardTitle]);

  const fetchDocuments = async () => {
    if (!startupId || !cardTitle) return;

    setLoading(true);
    setDocuments([]);
    setCurrentPath('');

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

    try {
      const path = `${sId}/${cardTitle}`;
      const { data, error } = await supabase.storage.from('startup_stage_documents').list(path, { limit: 100 });

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
        setHasDocuments(false);
      } else {
        setDocuments(data || []);
        setHasDocuments(data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    setFolderStack([...folderStack, folder]);
    setCurrentPath(folder);
    fetchDocuments();
  };

  const handleFileClick = (fileUrl) => {
    setSelectedDocument(fileUrl); // Open the document viewer modal
  };

  const handleBackClick = () => {
    const newStack = [...folderStack];
    newStack.pop();
    const newPath = newStack[newStack.length - 1] || '';
    setFolderStack(newStack);
    setCurrentPath(newPath);
    fetchDocuments();
  };

  const renderDocuments = () => (
    <div className="space-y-4">
      {documents.map((item) => (
        <div
          key={item.name}
          className="flex items-center space-x-3 p-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 rounded-md"
          onClick={() => item.type === 'folder' ? handleFolderClick(item.name) : handleFileClick(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${currentPath}/${item.name}`)}
        >
          {item.type === 'folder' ? (
            <FaFolder className="text-blue-500" />
          ) : (
            <FaFileAlt className="text-blue-500" />
          )}
          <span className="text-sm font-medium text-gray-800">{item.name.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Documents - {cardTitle.replace(/_/g, ' ').toUpperCase()}</h2>
          <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-lg" />
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <Loading />
          ) : hasDocuments ? (
            <>
              {folderStack.length > 0 && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
                >
                  <FaArrowLeft className="mr-2" />
                  Back
                </button>
              )}
              {renderDocuments()}
            </>
          ) : (
            <p className="text-center text-gray-500">No documents found.</p>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
            <button
              onClick={() => setSelectedDocument(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={24} />
            </button>
            <iframe
              src={selectedDocument}
              className="w-full h-96"
              title="Document Viewer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentModal;
