'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useWidth from '@/hooks/useWidth';
import ProjectList from '@/components/partials/app/projects/ProjectList';
import GridLoading from '@/components/skeleton/Grid';
import TableLoading from '@/components/skeleton/Table';
import AddProject from '@/components/partials/app/projects/AddProject';
import { ToastContainer } from 'react-toastify';
import EditProject from '@/components/partials/app/projects/EditProject';
import Loading from '@/app/loading';
import useFetchDocuments from '@/hooks/useFetchDocuments';
import useUserDetails from '@/hooks/useUserDetails';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import ConnectedStartupsFilesGrid from '@/components/partials/app/projects/ConnectedStartupsFolder';
import useStartupFiles from '@/hooks/useStartupFiles';


const DocumentManagement = () => {
  const [filler, setFiller] = useState('grid');
  const { width, breakpoints } = useWidth();
  const { user } = useUserDetails();
  const { investorSignup } = useCompleteUserDetails();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { files: startups, loading: startupsLoading } = useStartupFiles(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStartups, setFilteredStartups] = useState([]);
  
  const dispatch = useDispatch();
  const { documents, isLoaded } = useFetchDocuments(user?.id);

  useEffect(() => {
    if (user) {
      setIsProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Filter startups by the search term
    if (startups) {
      if (searchTerm.trim() === '') {
        setFilteredStartups(startups);
      } else {
        const filtered = startups.filter((startup) =>
          startup.name && startup.name.toLowerCase().includes(searchTerm.toLowerCase()) // Ensure name is not undefined
        );
        setFilteredStartups(filtered);
      }
    }
  }, [searchTerm, startups]);

  if (isProfileLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className='flex flex-wrap justify-between items-center mb-4'>
        {/* Search Input */}
        {/* <div className="flex-grow md:flex-grow-0 md:w-1/3">
          <input
            type='text'
            placeholder='Search startup by name...'
            className='p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 w-full'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}

        <div className='flex justify-between items-center w-full md:w-auto'>
          {/* Other Buttons Here */}
        </div>
      </div>

      <div className='flex items-center justify-between mb-4'>
        <h4 className='font-medium lg:text-2xl text-xl capitalize text-slate-900'>
          Startup Documents
        </h4>
      </div>
      
      {isLoaded && filler === 'grid' && <GridLoading count={documents.length} />}
      {isLoaded && filler === 'list' && <TableLoading count={documents.length} />}

      {filler === 'grid' && (
        <div className='flex flex-col h-full gap-5'>
          <div className='flex-grow overflow-y-auto'>
            {startupsLoading ? (
              <Loading />
            ) : (
              <div className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
                {filteredStartups.map((startup) => (
                  <ConnectedStartupsFilesGrid
                    project={startup}
                    key={startup.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {filler === 'list' && !isLoaded && Array.isArray(documents) && (
        <div>
          <ProjectList projects={documents} />
        </div>
      )}

      <AddProject
        user={user}
        investorSignup={investorSignup}
        fetchDocuments={() => fetchDocuments(user?.id)}
      />
      <EditProject
        user={user}
        investorSignup={investorSignup}
        documents={documents}
      />
    </div>
  );
};

export default DocumentManagement;
