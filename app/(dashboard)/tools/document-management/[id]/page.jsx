'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import useDocumentsForStartup from '@/hooks/useDocumentsForStartup';
import Link from 'next/link';
import { FaFileAlt, FaFolder, FaFolderOpen, FaArrowLeft } from 'react-icons/fa';
import DocumentSubmissionModal from '@/components/documentModal';
import StageDocumentUpload from '@/components/documents-vault/stageDocumentUpload';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify';


const DocumentPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [stages, setStages] = useState([]);
  const [documentsByStage, setDocumentsByStage] = useState({});
  const [openFolders, setOpenFolders] = useState({
    founder_information: false,
    CTO_info: false,
    company_documents: false,
  });
  const [openFolderStage, setOpenFolderStage] = useState(null);

  const fetchDocuments = async () => {
    if (!id) return;

    console.log('Startup id: ', id);

    const { data: profileData, error: profileError } = await supabase
      .from('company_profile')
      .select('profile_id')
      .eq('id', id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }

    const sId = profileData?.profile_id;

    if (!sId) {
      console.error('No profile ID found for the given startup ID.');
      return;
    }

    console.log('Startup Profile id: ', sId);

    const { data, error } = await supabase
      .from('company_stage_documents')
      .select('*')
      .eq('startup_id', sId);

    if (error) {
      console.error('Error fetching documents:', error.message);
    } else {
      const grouped = data.reduce((acc, doc) => {
        acc[doc.stage] = doc;
        return acc;
      }, {});

      setStages(Object.keys(grouped));
      setDocumentsByStage(grouped);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [id]);

  const { files, loading, error } = useDocumentsForStartup(id);

  if (loading) return <Loading />;

  if (error) return <p>Error loading documents: {error.message}</p>;

  if (!files || Object.keys(files).length === 0) {
    return <p>No documents found for this startup.</p>;
  }

  const toggleFolder = (folderName) => {
    setOpenFolders((prevState) => ({
      ...prevState,
      [folderName]: !prevState[folderName],
    }));
  };

  const toggleFolderStage = (folderName) => {
    setOpenFolderStage(openFolderStage === folderName ? null : folderName);
  };

  const renderDocumentList = (documents) => {
    const sortedDocuments = Object.entries(documents).sort(
      ([keyA, urlA], [keyB, urlB]) => {
        const isAvailableA = urlA && urlA.trim() !== '';
        const isAvailableB = urlB && urlB.trim() !== '';
        return isAvailableB - isAvailableA;
      }
    );

    return sortedDocuments.map(([key, url]) => {
      if (!['id', 'company_id', 'created_at'].includes(key)) {
        const isAvailable = url && url.trim() !== '';
        return (
          <div className="cursor-pointer text-center p-2" key={key}>
            <Link href={isAvailable ? url : '#'} passHref>
              <div
                className={`p-4 rounded-lg shadow-md ${
                  isAvailable ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-400'
                }`}
              >
                <FaFileAlt
                  size={40}
                  className={`mx-auto mb-2 ${
                    isAvailable ? 'text-green-500' : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-sm truncate ${
                    isAvailable ? '' : 'cursor-not-allowed'
                  }`}
                  onClick={(e) => !isAvailable && e.preventDefault()}
                >
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
            </Link>
          </div>
        );
      }
      return null;
    });
  };

  const renderStageDocuments = (documents) => (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {Object.entries(documents).map(([docType, filePathText]) => {
        if (!filePathText || ['id', 'startup_id', 'stage', 'created_at'].includes(docType)) return null;

        let filePaths;
        try {
          filePaths = JSON.parse(filePathText);
        } catch (error) {
          console.error('Error parsing file paths:', error.message);
          filePaths = [];
        }

        if (Array.isArray(filePaths)) {
          return filePaths.map((path, index) => (
            <div
              key={`${docType}-${index}`}
              onClick={() => openModal(path)}
              className="cursor-pointer text-center p-2"
            >
              <div className="p-4 rounded-lg shadow-md bg-green-200 hover:bg-green-300">
                <FaFileAlt size={40} className="mx-auto mb-2 text-green-500" />
                <p className="text-sm truncate">
                  {filePaths.length > 1
                    ? `${docType.replace(/_/g, ' ').toUpperCase()} ${index + 1}`
                    : `${docType.replace(/_/g, ' ').toUpperCase()}`}
                </p>
              </div>
            </div>
          ));
        } else {
          return (
            <div
              key={docType}
              onClick={() => openModal(filePathText)}
              className="cursor-pointer text-center p-2"
            >
              <div className="p-4 rounded-lg shadow-md bg-green-200 hover:bg-green-300">
                <FaFileAlt size={40} className="mx-auto mb-2 text-green-500" />
                <p className="text-sm truncate">{docType.replace(/_/g, ' ')}</p>
              </div>
            </div>
          );
        }
      })}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
        >
          <FaArrowLeft size={20} />
          <span>Back</span>
        </button>
        <DocumentSubmissionModal id={id} />
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center">Startup Documents</h2>

      {/* Founder Information Folder */}
      {['founder_information', 'CTO_info', 'company_documents'].map((folder) => (
        <div className="mb-4" key={folder}>
          <div
            className="cursor-pointer flex items-center space-x-2"
            onClick={() => toggleFolder(folder)}
          >
            {openFolders[folder] ? (
              <FaFolderOpen size={40} className="text-yellow-500" />
            ) : (
              <FaFolder size={40} className="text-yellow-500" />
            )}
            <span className="text-xl font-semibold capitalize">{folder.replace(/_/g, ' ')}</span>
          </div>
          {openFolders[folder] && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {files?.[folder] && renderDocumentList(files[folder])}
            </div>
          )}
        </div>
      ))}

      {/* Stage-wise Documents */}
      {stages.map((stage) => (
        <div key={stage} className="mb-4">
          <div
            onClick={() => toggleFolderStage(stage)}
            className="cursor-pointer flex items-center space-x-2"
          >
            {openFolderStage === stage ? (
              <FaFolderOpen size={40} className="text-yellow-500" />
            ) : (
              <FaFolder size={40} className="text-yellow-500" />
            )}
            <span className="text-xl font-semibold">{stage}</span>
          </div>
          {openFolderStage === stage &&
            renderStageDocuments(documentsByStage[stage] || {})}
        </div>
      ))}
    </div>
  );
};

export default DocumentPage;
