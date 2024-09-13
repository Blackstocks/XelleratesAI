'use client';

import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFolder, FaArrowLeft, FaPlus, FaTimes } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading'; // Ensure you have a Loading component

const DocumentModal = ({ startupId, investorId, cardTitle, isOpen, handleCloseModal }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [folderStack, setFolderStack] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // State to store selected document URL
  const [showAddFolderModal, setShowAddFolderModal] = useState(false); // State to control Add Folder Modal
  const [showAddFileModal, setShowAddFileModal] = useState(false); // State to control Add File Modal
  const [newFolderName, setNewFolderName] = useState(''); // State for the new folder name
  const [fileToUpload, setFileToUpload] = useState(null); // State for the file to upload

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
    setFolderStack([]);

    try {
      const sId = await getProfileId(startupId);

      if (!sId) {
        console.error('No profile ID found for the given startup ID.');
        setLoading(false);
        return;
      }

      if (cardTitle === 'series_wise') {
        const seriesWiseDocuments = await fetchSeriesWiseDocuments(`${sId}/series_wise/`);
        setDocuments(seriesWiseDocuments);
        setHasDocuments(Object.keys(seriesWiseDocuments).length > 0);
      } else {
        const path = `${sId}/${cardTitle}`;
        const fetchedDocuments = await fetchFilesFromFolder(path);
        setDocuments(fetchedDocuments);
        setHasDocuments(fetchedDocuments.length > 0);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileId = async (startupId) => {
    const { data: profileData, error: profileError } = await supabase
      .from('company_profile')
      .select('profile_id')
      .eq('id', startupId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return null;
    }

    return profileData?.profile_id || null;
  };

  const fetchFilesFromFolder = async (path) => {
    const { data: files, error } = await supabase.storage
      .from('startup_stage_documents')
      .list(path, { limit: 1000, offset: 0 });

    if (error) {
      console.error(`Error fetching files from folder ${path}:`, error.message);
      return [];
    }

    let allFiles = [];

    for (const file of files) {
      const fullPath = `${path}/${file.name}`;

      if (file.type === 'file') {
        allFiles.push(fullPath);
      } else if (file.type === 'folder') {
        const subFiles = await fetchFilesFromFolder(fullPath);
        allFiles = [...allFiles, ...subFiles];
      }
    }

    return allFiles;
  };

  const fetchSeriesWiseDocuments = async (path) => {
    const { data: folders, error } = await supabase.storage
      .from('startup_stage_documents')
      .list(path, { limit: 1000, offset: 0 });

    if (error) {
      console.error(`Error fetching series-wise folders from ${path}:`, error.message);
      return {};
    }

    let seriesDocuments = {};

    for (const folder of folders) {
      const fullPath = `${path}${folder.name}/`;
      const { data: subfolders, error: subfoldersError } = await supabase.storage
        .from('startup_stage_documents')
        .list(fullPath);

      if (subfoldersError) {
        console.error(`Error fetching files from ${fullPath}:`, subfoldersError.message);
        continue;
      }

      seriesDocuments[folder.name] = {};

      for (const subfolder of subfolders) {
        const docType = subfolder.name;
        const docPath = `${fullPath}${subfolder.name}/`;

        const { data: files, error: filesError } = await supabase.storage
          .from('startup_stage_documents')
          .list(docPath);

        if (filesError) {
          console.error(`Error fetching files from ${docPath}:`, filesError.message);
          continue;
        }

        seriesDocuments[folder.name][docType] = files.map((file) => `${docPath}${file.name}`);
      }
    }

    return seriesDocuments;
  };

  const handleFolderClick = (folderPath) => {
    setFolderStack([...folderStack, currentPath]);
    setCurrentPath(folderPath);
    fetchDocuments();
  };

  const handleFileClick = (fileUrl) => {
    setSelectedDocument(fileUrl);
  };

  const handleBackClick = () => {
    const previousPath = folderStack.pop();
    setFolderStack(folderStack);
    setCurrentPath(previousPath || '');
    fetchDocuments();
  };

  const handleAddFolder = async () => {
    if (!newFolderName) return;

    const newFolderPath = `${investorId}/${startupId}/${currentPath}/${newFolderName}`.replace(/\/\/+/g, '/');
    const { error } = await supabase.storage.from('investor_startup_stage_documents').upload(newFolderPath, '');

    if (error) {
      console.error('Error creating folder:', error.message);
    } else {
      console.log('Folder created:', newFolderPath);
      setShowAddFolderModal(false);
      fetchDocuments();
    }
  };

  const handleAddFile = async () => {
    if (!fileToUpload) return;

    const filePath = `${investorId}/${startupId}/${currentPath}/${fileToUpload.name}`.replace(/\/\/+/g, '/');
    const { error } = await supabase.storage.from('investor_startup_stage_documents').upload(filePath, fileToUpload);

    if (error) {
      console.error('Error uploading file:', error.message);
    } else {
      console.log('File uploaded:', filePath);
      setShowAddFileModal(false);
      fetchDocuments();
    }
  };

  const handleCloseDocumentViewer = () => {
    setSelectedDocument(null);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <FaTimes size={24} />
            </button>
            <h2 className="text-xl font-semibold mb-4">{cardTitle.replace(/_/g, ' ').toUpperCase()}</h2>
            {loading ? (
              <Loading />
            ) : (
              <>
                <div className="flex items-center mb-4">
                  {folderStack.length > 0 && (
                    <button onClick={handleBackClick} className="flex items-center text-blue-500 hover:text-blue-700">
                      <FaArrowLeft size={20} />
                      <span className="ml-2">Back</span>
                    </button>
                  )}
                  <button onClick={() => setShowAddFolderModal(true)} className="ml-4 flex items-center text-blue-500 hover:text-blue-700">
                    <FaPlus size={20} />
                    <span className="ml-2">Add Folder</span>
                  </button>
                  <button onClick={() => setShowAddFileModal(true)} className="ml-4 flex items-center text-blue-500 hover:text-blue-700">
                    <FaPlus size={20} />
                    <span className="ml-2">Add File</span>
                  </button>
                </div>
                <div className="flex flex-col space-y-2">
                  {Array.isArray(documents)
                    ? documents.map((path) => {
                        const fileName = path.split('/').pop();
                        return (
                          <div
                            key={path}
                            onClick={() => handleFileClick(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${path}`)}
                            className="cursor-pointer flex items-center space-x-2"
                          >
                            <FaFileAlt size={20} className="text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 capitalize">{fileName.replace(/_/g, ' ')}</span>
                          </div>
                        );
                      })
                    : Object.entries(documents).map(([folderName, files]) => (
                        <div key={folderName} className="cursor-pointer">
                          <FaFolder size={24} className="text-blue-500" />
                          <p className="mt-2 text-sm font-medium text-gray-700 capitalize">{folderName.replace(/_/g, ' ')}</p>
                          {Object.entries(files).map(([docType, docPaths]) => (
                            <div key={docType} className="ml-4">
                              {Array.isArray(docPaths) &&
                                docPaths.map((path) => {
                                  const fileName = path.split('/').pop();
                                  return (
                                    <div
                                      key={path}
                                      onClick={() => handleFileClick(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${path}`)}
                                      className="cursor-pointer flex items-center space-x-2 mt-2 ml-4"
                                    >
                                      <FaFileAlt size={20} className="text-blue-500" />
                                      <span className="text-sm font-medium text-gray-700 capitalize">{fileName.replace(/_/g, ' ')}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          ))}
                        </div>
                      ))}
                </div>
              </>
            )}
          </div>

          {/* Add Folder Modal */}
          {showAddFolderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
                <button onClick={() => setShowAddFolderModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
                <h3 className="text-lg font-semibold mb-4">Add New Folder</h3>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Folder Name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button
                  onClick={handleAddFolder}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Create Folder
                </button>
              </div>
            </div>
          )}

          {/* Add File Modal */}
          {showAddFileModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
                <button onClick={() => setShowAddFileModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                  <FaTimes size={20} />
                </button>
                <h3 className="text-lg font-semibold mb-4">Upload File</h3>
                <input
                  type="file"
                  className="w-full"
                  onChange={(e) => setFileToUpload(e.target.files[0])}
                />
                <button
                  onClick={handleAddFile}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Upload File
                </button>
              </div>
            </div>
          )}

          {/* Document Viewer Modal */}
          {selectedDocument && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-60">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
                <button onClick={handleCloseDocumentViewer} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                  <FaTimes size={24} />
                </button>
                <iframe src={selectedDocument} className="w-full h-96" title="Document Viewer" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DocumentModal;
