'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Ensure correct import path based on Next.js 14.2.5 setup
import Loading from '@/app/loading';
import useDocumentsForStartup from '@/hooks/useDocumentsForStartup';
import Link from 'next/link';
import { FaFileAlt, FaFolder, FaFolderOpen, FaArrowLeft } from 'react-icons/fa';
import DocumentSubmissionModal from '@/components/documentModal';

const DocumentPage = () => {
  const { id } = useParams(); // Extract the `id` from the URL parameters
  const router = useRouter(); // Use Next.js router for navigation

  if (!id) return <p>No startup ID provided.</p>;

  const { files, loading, error } = useDocumentsForStartup(id);
  console.log('files', files);

  const [openFolders, setOpenFolders] = useState({
    founder_information: false,
    CTO_info: false,
    company_documents: false, // This can be set to true by default if you want it open
  });

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

  const renderDocumentList = (documents) => {
    const sortedDocuments = Object.entries(documents).sort(
      ([keyA, urlA], [keyB, urlB]) => {
        const isAvailableA = urlA && urlA.trim() !== '';
        const isAvailableB = urlB && urlB.trim() !== '';
        return isAvailableB - isAvailableA; // Sort: available (1) comes before unavailable (0)
      }
    );

    return sortedDocuments.map(([key, url]) => {
      if (!['id', 'company_id', 'created_at'].includes(key)) {
        const isAvailable = url && url.trim() !== ''; // Check if the document has a value
        return (
          <div className='cursor-pointer text-center' key={key}>
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
                  onClick={(e) => !isAvailable && e.preventDefault()} // Prevent click if no URL
                >
                  {key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
            </Link>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className='p-6'>
      {/* Back Button */}
      <div className='mb-4 flex justify-between'>
        <button
          onClick={() => router.back()}
          className='flex items-center space-x-2 text-blue-500 hover:text-blue-700'
        >
          <FaArrowLeft size={20} />
          <span>Back</span>
        </button>
        <DocumentSubmissionModal id={id} />
      </div>

      <h2 className='text-2xl font-bold mb-4 text-center'>Startup Documents</h2>
      {/* Founder Information Folder */}
      <div className='mb-4'>
        <div
          className='cursor-pointer flex items-center space-x-2'
          onClick={() => toggleFolder('founder_information')}
        >
          {openFolders.founder_information ? (
            <FaFolderOpen size={40} className='text-yellow-500' />
          ) : (
            <FaFolder size={40} className='text-yellow-500' />
          )}
          <span className='text-xl font-semibold'>Founder Information</span>
        </div>
        {openFolders.founder_information && (
          <div className='grid grid-cols-4 gap-4 mt-4'>
            {files?.founder_information &&
              renderDocumentList(files.founder_information)}
          </div>
        )}
      </div>
      {/* CTO Information Folder */}
      <div className='mb-4'>
        <div
          className='cursor-pointer flex items-center space-x-2'
          onClick={() => toggleFolder('CTO_info')}
        >
          {openFolders.CTO_info ? (
            <FaFolderOpen size={40} className='text-yellow-500' />
          ) : (
            <FaFolder size={40} className='text-yellow-500' />
          )}
          <span className='text-xl font-semibold'>CTO Information</span>
        </div>
        {openFolders.CTO_info && (
          <div className='grid grid-cols-4 gap-4 mt-4'>
            {files?.CTO_info && renderDocumentList(files.CTO_info)}
          </div>
        )}
      </div>
      {/* Company Documents Folder */}
      <div className='mb-4'>
        <div
          className='cursor-pointer flex items-center space-x-2'
          onClick={() => toggleFolder('company_documents')}
        >
          {openFolders.company_documents ? (
            <FaFolderOpen size={40} className='text-yellow-500' />
          ) : (
            <FaFolder size={40} className='text-yellow-500' />
          )}
          <span className='text-xl font-semibold'>Company Documents</span>
        </div>
        {openFolders.company_documents && (
          <div className='grid grid-cols-4 gap-4 mt-4'>
            {files?.company_documents &&
              renderDocumentList(files.company_documents[0])}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPage;
