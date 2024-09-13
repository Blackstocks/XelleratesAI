'use client';

import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFolder, FaArrowLeft, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading'; // Ensure you have a Loading component

const DocumentModal = ({ startupId, investorId, cardTitle, isOpen, handleCloseModal }) => {
  const [documents, setDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [hasNewDocuments, setHasNewDocuments] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [folderStack, setFolderStack] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // State to store selected document URL
  const [showAddFolderModal, setShowAddFolderModal] = useState(false); // State to control Add Folder Modal
  const [showAddFileModal, setShowAddFileModal] = useState(false); // State to control Add File Modal
  const [newFolderName, setNewFolderName] = useState(''); // State for the new folder name
  const [fileToUpload, setFileToUpload] = useState(null); // State for the file to upload
  const [openFolders, setOpenFolders] = useState({}); // Tracks open/close state of folders
  const [selectedUploadFolder, setSelectedUploadFolder] = useState(null); // State to store the selected folder
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);


  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, startupId, cardTitle]);

  const toggleFolder = (folderName) => {
    setOpenFolders((prevState) => ({
      ...prevState,
      [folderName]: !prevState[folderName],
    }));
  };
  

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

      if (cardTitle === 'series_wise_documents') {
        const seriesWiseDocuments = await fetchSeriesWiseDocuments(`${sId}/series_wise/`);
        setDocuments(seriesWiseDocuments);
        setHasDocuments(Object.keys(seriesWiseDocuments).length > 0);

        const fetchedDocuments = await fetchFilesFromFolder(`${investorId}/${startupId}/`);
        setNewDocuments(fetchedDocuments);
        setHasNewDocuments(fetchedDocuments.length > 0);

        console.log('new docs: ', fetchedDocuments);
      } else {
        const path = `${sId}/${cardTitle}`;
        
        
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
      .from('investor_startup_stage_documents')
      .list(path, { limit: 1000, offset: 0 });
  
    if (error) {
      console.error(`Error fetching files from folder ${path}:`, error.message);
      return [];
    }

    console.log('files: ', files);
  
    let allItems = [];
    let seriesDocuments = {};
  
    for (const file of files) {
      const docType = file.name
      const fullPath = `${path}/${file.name}/`.replace(/\/\/+/g, '/');
      console.log('full path: ', fullPath);
      seriesDocuments[file.name] = {};
      const { data: subFolderFiles, error } = await supabase.storage
        .from('investor_startup_stage_documents')
        .list(fullPath, { limit: 1000, offset: 0 });

      seriesDocuments[file.name][docType] = subFolderFiles.map((subfile) => `${fullPath}${subfile.name}`);

      console.log("sub files: ", subFolderFiles);
      

      allItems = [...allItems, ...subFolderFiles];
    }
  
    return seriesDocuments;
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
  
      seriesDocuments[folder.name] = { subfolders: [] };
  
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
  
        seriesDocuments[folder.name].subfolders.push({
          name: docType,
          files: files.map((file) => `${docPath}${file.name}`),
        });
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
    const constructedUrl = `https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${fileUrl}`;
    console.log('Constructed URL:', constructedUrl);
    setSelectedDocument(constructedUrl);
  };
  const handleFileClick1 = (fileUrl) => {
    const constructedUrl = `https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/investor_startup_stage_documents/${fileUrl}`;
    console.log('Constructed URL:', constructedUrl);
    setSelectedDocument(constructedUrl);
  };
  

  const handleBackClick = () => {
    const previousPath = folderStack.pop();
    setFolderStack(folderStack);
    setCurrentPath(previousPath || '');
    fetchDocuments();
  };

  const handleAddFolder = async () => {
    if (!newFolderName) return;
  
    // Creating a path ending with '/' to ensure it is treated as a folder
    const newFolderPath = `${investorId}/${startupId}/${newFolderName}/temp`.replace(/\/\/+/g, '/');
    
    // Upload an empty file with a folder-like path
    const { error } = await supabase.storage
      .from('investor_startup_stage_documents')
      .upload(newFolderPath, new Blob(), {
        upsert: true,
      });
  
    if (error) {
      console.error('Error creating folder:', error.message);
    } else {
      console.log('Folder created:', newFolderPath);
      setShowAddFolderModal(false);
      fetchDocuments(); // Refresh the documents to reflect the new folder
    }
  };
  

  const handleAddFile = async () => {
    if (!fileToUpload || !selectedUploadFolder) return;
  
    const filePath = `${investorId}/${startupId}/${selectedUploadFolder}/${fileToUpload.name}`.replace(/\/\/+/g, '/');
    const { error } = await supabase.storage.from('investor_startup_stage_documents').upload(filePath, fileToUpload, {
      upsert: true, // Allows overwriting if the file already exists
    });
  
    if (error) {
      console.error('Error uploading file:', error.message);
    } else {
      console.log('File uploaded:', filePath);
      setShowAddFileModal(false);
      fetchDocuments(); // Refresh the documents to reflect the new file
    }
  };
  
  

  const handleCloseDocumentViewer = () => {
    setSelectedDocument(null);
  };


  const handleDeleteFile = (path) => {
    setFileToDelete(`${path}`);
    console.log('del path: ', path);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const filePath = `${fileToDelete}`;
    const { error } = await supabase.storage.from('investor_startup_stage_documents').remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error.message);
    } else {
      console.log('File deleted:', filePath);
      fetchDocuments(); // Refresh documents
    }

    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  const renderDocuments = () => (
    <div className="space-y-4">
      {documents
        .filter(item => item.name !== 'temp') // Filter out 'temp' files
        .map((item) => (
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
            {item.type === 'file' && (
              <button onClick={(e) => {
                e.stopPropagation(); // Prevents triggering file click
                handleDeleteFile(item.name);
              }} className="ml-auto text-red-500 hover:text-red-700">
                <FaTrash size={16} />
              </button>
            )}
          </div>
        ))}
    </div>
  );

  if (!isOpen) return null;

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
                  {Object.entries(documents).map(([folderName, { subfolders }]) => (
                    <div key={folderName}>
                      {/* Folder name and toggle */}
                      <div onClick={() => toggleFolder(folderName)} className="cursor-pointer flex flex-1">
                        <FaFolder size={24} className="text-blue-500" />
                        <p className="my-auto ml-2 text-sm font-medium text-gray-700 ">{folderName.replace(/_/g, ' ')}</p>
                        <hr className="my-2" />
                      </div>

                      {/* Render subfolders and files if the folder is open */}
                      {openFolders[folderName] && (
                        <div className="ml-6 mt-2">
                          {subfolders.map((subfolder) => (
                            <div key={subfolder.name}>
                              <div onClick={() => toggleFolder(`${folderName}/${subfolder.name}`)} className="cursor-pointer flex flex-1 mt-2">
                                <FaFolder size={20} className="text-blue-500 ml-4" />
                                <p className="my-auto ml-2 text-sm font-medium text-gray-700  ml-2">{subfolder.name.replace(/_/g, ' ')}</p>
                              </div>

                              {openFolders[`${folderName}/${subfolder.name}`] && (
                                <div className="ml-6 mt-2">
                                  {subfolder.files.map((path) => {
                                    const fileName = path.split('/').pop();
                                    return (
                                      <div key={path} onClick={() => handleFileClick(`${path}`)} className="cursor-pointer flex items-center space-x-2 mt-2 ml-8">
                                        <FaFileAlt size={16} className="text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700 ">{fileName.replace(/_/g, ' ')}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                


{Object.entries(newDocuments).map(([folderName, files]) => (
  <div key={folderName} className="cursor-pointer flex flex-col">
    {/* Folder name with a toggle */}
    <div onClick={() => toggleFolder(folderName)} className="flex items-center space-x-2">
      <FaFolder size={24} className="text-blue-500" />
      <span className="text-sm font-medium text-gray-700 ">{folderName.replace(/_/g, ' ')}</span>
    </div>

    {/* Check if the folder is open */}
    {openFolders[folderName] && (
      <div className="ml-6">
        {/* Iterate over keys in 'files' */}
        {Object.entries(files).map(([fileType, filePaths]) => (
          <div key={fileType} className="">
            {/* Now iterate over the file paths array */}
            {Array.isArray(filePaths) && filePaths.map((path) => {
              const fileName = path.split('/').pop(); // Extract file name
              return (
                <div key={path} onClick={() => handleFileClick1(`${path}`)} className="cursor-pointer flex items-center space-x-2 mt-2 ml-4">
                  <FaFileAlt size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 ">{fileName.replace(/_/g, ' ')}</span>
                  <button onClick={(e) => {
                e.stopPropagation(); // Prevents triggering file click
                handleDeleteFile(path);
              }} className="ml-auto text-red-500 hover:text-red-700 mr-0 right-4">
                <FaTrash size={16} />
              </button>
                </div>
                
              );
            })}
          </div>
        ))}
      </div>
    )}
  </div>
))}






                
                
                </div>
              </>
            )}
          </div>

          {showDeleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 bg-blur-sm">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative border-2 border-red-500 bg-blur-sm">
      <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <FaTimes size={20} />
      </button>
      <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
      <p>Are you sure you want to delete {fileToDelete}?</p>
      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={confirmDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
        <button
          onClick={() => setShowDeleteModal(false)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


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
      <h3 className="text-lg font-semibold mb-4">Select Folder to Upload File</h3>
      
      {/* Display folders from newDocuments */}
      <div className="mb-4">
        {Object.entries(newDocuments).map(([folderName]) => (
          <div key={folderName} className="cursor-pointer flex items-center space-x-2 mt-2" onClick={() => setSelectedUploadFolder(folderName)}>
            <FaFolder size={20} className="text-blue-500" />
            <span className={`text-sm font-medium text-gray-700  ${selectedUploadFolder === folderName ? 'font-bold' : ''}`}>
              {folderName.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* If a folder is selected, allow file upload */}
      {selectedUploadFolder && (
        <>
          <input
            type="file"
            className="w-full"
            onChange={(e) => setFileToUpload(e.target.files[0])}
          />
          <button
            onClick={handleAddFile}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload File to {selectedUploadFolder}
          </button>
        </>
      )}
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
