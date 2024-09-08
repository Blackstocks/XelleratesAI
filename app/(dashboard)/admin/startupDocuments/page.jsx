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
import useStartupsRawApproved from '@/hooks/useStartupsId';

const DocumentManagement = () => {
  const [filler, setFiller] = useState('grid');
  const { width, breakpoints } = useWidth();
  const { user } = useUserDetails();
  const { investorSignup } = useCompleteUserDetails();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { files: startups, loading: startupsLoading } = useStartupsRawApproved();
  console.log("startups fetched: ", startups);
  
  const dispatch = useDispatch();
  const { documents, isLoaded } = useFetchDocuments(user?.id);

  useEffect(() => {
    if (user) {
      setIsProfileLoading(false);
    }
  }, [user]);

  if (isProfileLoading) {
    return <Loading />;
  }

  return (
    <div>
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
                {startups.map((startup) => (
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
