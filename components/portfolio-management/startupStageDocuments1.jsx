// 'use client';

// import React, { useState, useEffect } from 'react';
// import { FaFileAlt, FaFolder, FaArrowLeft, FaTimes } from 'react-icons/fa';
// import { supabase } from '@/lib/supabaseclient';
// import Loading from '@/components/Loading'; // Ensure you have a Loading component

// const DocumentModal = ({ startupId, cardTitle, isOpen, handleCloseModal }) => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [hasDocuments, setHasDocuments] = useState(false);
//   const [currentPath, setCurrentPath] = useState('');
//   const [folderStack, setFolderStack] = useState([]);
//   const [selectedDocument, setSelectedDocument] = useState(null); // State to store selected document URL

//   useEffect(() => {
//     if (isOpen) {
//       fetchDocuments();
//     }
//   }, [isOpen, startupId, cardTitle]);

//   const fetchDocuments = async () => {
//     if (!startupId || !cardTitle) return;

//     setLoading(true);
//     setDocuments([]);
//     setCurrentPath('');

//     const { data: profileData, error: profileError } = await supabase
//       .from('company_profile')
//       .select('profile_id')
//       .eq('id', startupId)
//       .single();

//     if (profileError) {
//       console.error('Error fetching profile:', profileError.message);
//       setLoading(false);
//       return;
//     }

//     const sId = profileData?.profile_id;
//     if (!sId) {
//       console.error('No profile ID found for the given startup ID.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const path = `${sId}/${cardTitle}`;
//       const { data, error } = await supabase.storage.from('startup_stage_documents').list(path, { limit: 100 });

//       if (error) {
//         console.error('Error fetching documents:', error);
//         setDocuments([]);
//         setHasDocuments(false);
//       } else {
//         setDocuments(data || []);
//         setHasDocuments(data.length > 0);
//       }
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFolderClick = (folder) => {
//     setFolderStack([...folderStack, folder]);
//     setCurrentPath(folder);
//     fetchDocuments();
//   };

//   const handleFileClick = (fileUrl) => {
//     console.log(fileUrl);
//     setSelectedDocument(fileUrl); // Open the document viewer modal
//   };

//   const handleBackClick = () => {
//     const newStack = [...folderStack];
//     newStack.pop();
//     const newPath = newStack[newStack.length - 1] || '';
//     setFolderStack(newStack);
//     setCurrentPath(newPath);
//     fetchDocuments();
//   };

//   const renderDocuments = () => (
//     <div className="space-y-4">
//       {documents.map((item) => (
//         <div
//           key={item.name}
//           className="flex items-center space-x-3 p-2 border-b border-gray-200 cursor-pointer hover:bg-blue-50 rounded-md"
//           onClick={() => item.type === 'folder' ? handleFolderClick(item.name) : handleFileClick(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${startupId}/${cardTitle}/${item.name}`)}
//         >
//           {item.type === 'folder' ? (
//             <FaFolder className="text-blue-500" />
//           ) : (
//             <FaFileAlt className="text-blue-500" />
//           )}
//           <span className="text-sm font-medium text-gray-800">{item.name.replace(/_/g, ' ').toUpperCase()}</span>
//         </div>
//       ))}
//     </div>
//   );

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
//         <div className="flex items-center justify-between p-4 border-b border-gray-200">
//           <h2 className="text-lg font-semibold">Documents - {cardTitle.replace(/_/g, ' ').toUpperCase()}</h2>
//           <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
//             <FaTimes className="text-lg" />
//           </button>
//         </div>
//         <div className="p-4">
//           {loading ? (
//             <Loading />
//           ) : hasDocuments ? (
//             <>
//               {folderStack.length > 0 && (
//                 <button
//                   onClick={handleBackClick}
//                   className="flex items-center text-blue-500 hover:text-blue-700 mb-4"
//                 >
//                   <FaArrowLeft className="mr-2" />
//                   Back
//                 </button>
//               )}
//               {renderDocuments()}
//             </>
//           ) : (
//             <p className="text-center text-gray-500">No documents found.</p>
//           )}
//         </div>
//       </div>

//       {/* Document Viewer Modal */}
//       {selectedDocument && (
//         <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-75">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
//             <button
//               onClick={() => setSelectedDocument(null)}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <FaTimes size={24} />
//             </button>
//             <iframe
//               src={selectedDocument}
//               className="w-full h-96"
//               title="Document Viewer"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentModal;


'use client';

import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaFolder, FaArrowLeft, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseclient';
import Loading from '@/components/Loading'; // Ensure you have a Loading component

const DocumentModal = ({ startupId, cardTitle, isOpen, handleCloseModal }) => {
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


        const fetchedDocuments = await fetchFilesFromFolder(`${sId}/${cardTitle}/`);
        setNewDocuments(fetchedDocuments);
        setHasNewDocuments(fetchedDocuments.length > 0);

        console.log('new docs: ', fetchedDocuments);

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

    console.log('files: ', files);
  
    let allItems = [];
    let seriesDocuments = {};
  
    for (const file of files) {
      const docType = file.name
      const fullPath = `${path}/${file.name}/`.replace(/\/\/+/g, '/');
      console.log('full path: ', fullPath);
      seriesDocuments[file.name] = {};
      const { data: subFolderFiles, error } = await supabase.storage
        .from('startup_stage_documents')
        .list(fullPath, { limit: 1000, offset: 0 });

      seriesDocuments[file.name][docType] = subFolderFiles.map((subfile) => `${fullPath}${subfile.name}`);

      console.log("sub files: ", subFolderFiles);
      

      allItems = [...allItems, ...subFolderFiles];
    }
  
    return seriesDocuments;
  };
  
  const handleFileClick1 = (fileUrl) => {
    const constructedUrl = `https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${fileUrl}`;
    console.log('Constructed URL:', constructedUrl);
    setSelectedDocument(constructedUrl);
  };
  

  const handleBackClick = () => {
    const previousPath = folderStack.pop();
    setFolderStack(folderStack);
    setCurrentPath(previousPath || '');
    fetchDocuments();
  };

  const handleCloseDocumentViewer = () => {
    setSelectedDocument(null);
  };

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
                </div>
                <div className="flex flex-col space-y-2">

{Object.entries(newDocuments).map(([folderName, files]) => (
  <div key={folderName} className="cursor-pointer flex flex-col">
    {/* Folder name with a toggle */}
    <div onClick={() => toggleFolder(folderName)} className="flex items-center space-x-2">
      <FaFolder size={24} className="text-blue-500" />
      <span className="text-sm font-medium text-gray-700">{folderName.replace(/_/g, ' ').toUpperCase()}</span>
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
                  <span className="text-sm font-medium text-gray-700">{fileName.replace(/_/g, ' ')}</span>
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
