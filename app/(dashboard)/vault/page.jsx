'use client';
import React, { useState, useEffect } from 'react';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/app/loading';
import { FaFolder, FaFileAlt } from 'react-icons/fa';
import Chatbot from '@/components/chatbot';
import StageDocumentUpload from '@/components/documents-vault/stageDocumentUpload';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify';

const Vault = () => {
  const {
    founderInformation = {},
    ctoInfo = {},
    companyDocuments = {},
    loading: userLoading,
    error,
    profile,
  } = useCompleteUserDetails();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [stages, setStages] = useState([]);
  const [documentsByStage, setDocumentsByStage] = useState({});
  const [selectedStage, setSelectedStage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSection, setLoadingSection] = useState('');

  const [openFolders, setOpenFolders] = useState({});
  const [folderContents, setFolderContents] = useState({});

  const toggleFolder = async (folderPath) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));

    if (!folderContents[folderPath]) {
      await fetchFolderContents(folderPath);
    }
  };

  const fetchFolderContents = async (folderPath) => {
    const { data, error } = await supabase.storage
      .from('startup_stage_documents')
      .list(folderPath);

    if (error) {
      console.error('Error fetching folder contents:', error);
      return;
    }

    setFolderContents(prev => ({
      ...prev,
      [folderPath]: data
    }));
  };

  // Function to fetch all files in a given folder
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
      const fullPath = `${path}${file.name}`;

      const { data: subFiles, error: subError } = await supabase.storage
        .from('startup_stage_documents')
        .list(fullPath, { limit: 1 });

      if (subError) {
        console.error(`Error checking if ${fullPath} is a folder:`, subError.message);
        continue;
      }

      if (subFiles.length > 0) {
        const subfolderFiles = await fetchFilesFromFolder(`${fullPath}/`);
        allFiles = [...allFiles, ...subfolderFiles];
      } else {
        allFiles.push(fullPath);
      }
    }

    return allFiles;
  };

  // Function to handle "Series Wise Documents"
  const fetchSeriesWiseDocuments = async (path) => {
    const { data: folders, error } = await supabase.storage
      .from('startup_stage_documents')
      .list(path, { limit: 1000, offset: 0 });

    if (error) {
      console.error(`Error fetching series wise folders from ${path}:`, error.message);
      return {};
    }

    let seriesDocuments = {};

    for (const folder of folders) {
      const fullPath = `${path}${folder.name}/`; // Ensure to include trailing slash
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

        seriesDocuments[folder.name][docType] = files.map(file => `${docPath}${file.name}`);
      }
    }

    console.log(seriesDocuments);

    return seriesDocuments;
  };

  // Fetch all documents
  const fetchDocuments = async () => {
    if (!profile?.id) return;

    try {
      setLoadingSection('all'); // Set loading for the entire process
      const documentsByStage = {
        "Company Info": {},
        "Series Wise Documents": {},
        "Approvals": {},
        "Information Rights": {},
      };

      const documentFolders = ['company_info', 'approvals', 'information_rights'];
      for (const folder of documentFolders) {
        const files = await fetchFilesFromFolder(`${profile.id}/${folder}/`);
        files.forEach((file) => {
          const pathParts = file.split('/');
          const folderType = pathParts[1]; 
          const subFolder = pathParts[2]; 

          const folderMap = {
            'company_info': 'Company Info',
            'approvals': 'Approvals',
            'information_rights': 'Information Rights'
          };

          const folderName = folderMap[folderType];

          if (folderName) {
            if (!documentsByStage[folderName][subFolder]) {
              documentsByStage[folderName][subFolder] = [];
            }

            documentsByStage[folderName][subFolder].push(file);
          }
        });
      }

      // Fetch "Series Wise Documents"
      const seriesWiseDocuments = await fetchSeriesWiseDocuments(`${profile.id}/series_wise/`);
      documentsByStage["Series Wise Documents"] = seriesWiseDocuments;

      setStages(Object.keys(documentsByStage)); 
      setDocumentsByStage(documentsByStage); 
      setLoadingSection(''); 
    } catch (error) {
      console.error('Error fetching documents:', error.message);
      setLoadingSection('');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [profile?.id]);

  const openModal = (documentUrl) => {
    setSelectedDocument(documentUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedDocument(null);
  };

  const handleUploadComplete = (newStage) => {
    setStages((prevStages) => [...new Set([...prevStages, newStage])]);
    fetchDocuments();
  };

  const handleDocumentUpload = () => {
    toast.success('Documents uploaded successfully');
    fetchDocuments();
  };

  const renderDocuments = (documents, requiredKeys) => (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {requiredKeys.length > 0 ? (
        requiredKeys.map((key) => (
          <div
            key={key}
            onClick={() => documents && documents[key] && openModal(documents[key])}
            className="cursor-pointer text-center"
          >
            <div
              className={`p-4 rounded-lg shadow-md ${
                documents && documents[key] ? 'bg-green-200 hover:bg-green-300' : 'bg-gray-200'
              }`}
            >
              <FaFileAlt
                size={40}
                className={`mx-auto mb-2 ${
                  documents && documents[key] ? 'text-green-500' : 'text-gray-500'
                }`}
              />
              <p className="text-sm truncate">{key.replace(/_/g, ' ')}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 col-span-4">Folder is empty</p>
      )}
    </div>
  );

  const renderSeriesDocuments = (seriesDocuments) => {
    const renderFolderContents = (series, docTypes) => {
      return Object.entries(docTypes).map(([docType, paths]) => {
        const folderPath = `${profile.id}/series_wise/${series}/${docType}/`;
        
        return (
          <div key={folderPath} className="ml-4">
            <div
              onClick={() => toggleFolder(folderPath)}
              className="cursor-pointer flex items-center space-x-2 mt-2"
            >
              <FaFolder size={24} className="text-blue-400" />
              <span className="text-md font-medium text-gray-600 capitalize">
                {docType.replace(/_/g, ' ')}
              </span>
            </div>
            {openFolders[folderPath] && (
              <div className="ml-4">
                {paths.map(path => {
                  const fileName = path.split('/').pop();
                  return (
                    <div
                      key={path}
                      onClick={() => openModal(`https://xgusxcqoddybgdkkndvn.supabase.co/storage/v1/object/public/startup_stage_documents/${path}`)}
                      className="cursor-pointer flex items-center space-x-2 mt-2 ml-4"
                    >
                      <FaFileAlt size={20} className="text-gray-600" />
                      <span className="text-sm">{fileName.replace(/_/g, ' ')}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      });
    };

    return (
      <div className="space-y-4">
        {seriesDocuments && Object.entries(seriesDocuments).map(([series, docTypes]) => (
  <div key={series}>
  <div
    onClick={() => toggleFolder(`${profile.id}/series_wise/${series}/`)}
    className="cursor-pointer flex items-center space-x-2 ml-4"
  >
    <FaFolder size={30} className="text-yellow-500" />
    <span className="text-xl font-semibold">{series}</span>
  </div>
  {openFolders[`${profile.id}/series_wise/${series}/`] && (
    <div className="ml-4">
      {renderFolderContents(series, docTypes)}
    </div>
  )}
</div>
))}

{!seriesDocuments && <p>Loading series documents...</p>}

      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Documents Vault</h2>
      {userLoading && <Loading />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!userLoading && !error && (
        <>
          <StageDocumentUpload
            startupId={profile?.id}
            companyName={profile?.company_name}
            onUploadComplete={handleUploadComplete}
            onDocumentUpload={handleDocumentUpload}
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
          />

          <div className="space-y-4 mt-6">
            {/* Constant Folders */}
            <div>
              <div
                onClick={() => toggleFolder('founderInformation')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <FaFolder size={40} className="text-yellow-500" />
                <span className="text-xl font-semibold">Founder Information</span>
              </div>
              {openFolders['founderInformation'] &&
                (loadingSection === 'founderInformation' ? (
                  <Loading />
                ) : (
                  renderDocuments(founderInformation, ['co_founder_agreement'])
                ))}
            </div>

            <div>
              <div
                onClick={() => toggleFolder('ctoInfo')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <FaFolder size={40} className="text-yellow-500" />
                <span className="text-xl font-semibold">CTO Information</span>
              </div>
              {openFolders['ctoInfo'] &&
                (loadingSection === 'ctoInfo' ? (
                  <Loading />
                ) : (
                  renderDocuments(ctoInfo, ['technology_roadmap'])
                ))}
            </div>

            <div>
              <div
                onClick={() => toggleFolder('companyDocuments')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <FaFolder size={40} className="text-yellow-500" />
                <span className="text-xl font-semibold">Company Documents</span>
              </div>
              {openFolders['companyDocuments'] &&
                (loadingSection === 'companyDocuments' ? (
                  <Loading />
                ) : (
                  renderDocuments(
                    companyDocuments,
                    Object.keys(companyDocuments).filter((key) => !['id', 'company_id', 'created_at'].includes(key))
                  )
                ))}
            </div>

            {/* Company Info, Approvals, and Information Rights */}
            {['Company Info', 'Approvals', 'Information Rights'].map((section) => (
              <div key={section}>
                <div
                  onClick={() => toggleFolder(section)}
                  className="cursor-pointer flex items-center space-x-2"
                >
                  <FaFolder size={40} className="text-yellow-500" />
                  <span className="text-xl font-semibold">{section}</span>
                </div>
                {openFolders[section] &&
                  (loadingSection === section ? (
                    <Loading />
                  ) : (
                    renderDocuments(documentsByStage[section], Object.keys(documentsByStage[section] || {}))
                  ))}
              </div>
            ))}

            {/* Series Wise Documents */}
            <div>
              <div
                onClick={() => toggleFolder('Series Wise Documents')}
                className="cursor-pointer flex items-center space-x-2"
              >
                <FaFolder size={40} className="text-yellow-500" />
                <span className="text-xl font-semibold">Series Wise Documents</span>
              </div>
              {openFolders['Series Wise Documents'] &&
                (loadingSection === 'Series Wise Documents' ? (
                  <Loading />
                ) : (
                  renderSeriesDocuments(documentsByStage['Series Wise Documents'])
                ))}
            </div>
          </div>
        </>
      )}

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 mt-10">
          <div
            className="fixed inset-0 bg-black opacity-75 z-40 mt-10"
            onClick={closeModal}
          ></div>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-3/5 h-4/5 p-6 relative z-50">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {selectedDocument && (
              <iframe
                src={selectedDocument}
                className="w-full h-full"
                title="Document Viewer"
              ></iframe>
            )}
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
};

export default Vault;