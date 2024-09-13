'use client';

import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFolder, FaFolderOpen, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading'; // Ensure you have a Loading component

const DocumentModal1 = ({ startupId, cardTitle, isOpen, handleCloseModal }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [folderStack, setFolderStack] = useState([]);

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
        <div key={item.name} className="flex items-center space-x-2 p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 rounded">
          {item.type === 'folder' ? (
            <FaFolder className="text-blue-500" />
          ) : (
            <FaFileAlt className="text-gray-700" />
          )}
          <span className="text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
            <FaArrowLeft className="text-lg" />
          </button>
          <h2 className="text-lg font-semibold">Documents - {cardTitle}</h2>
          <div></div>
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
            <p>No documents found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentModal1;
