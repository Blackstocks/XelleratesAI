'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import useWidth from '@/hooks/useWidth';
import Button from '@/components/ui/Button';
import ProjectGrid from '@/components/partials/app/projects/ProjectGrid';
import ProjectList from '@/components/partials/app/projects/ProjectList';
import GridLoading from '@/components/skeleton/Grid';
import TableLoading from '@/components/skeleton/Table';
import { toggleAddModal } from '@/components/partials/app/projects/store';
import AddProject from '@/components/partials/app/projects/AddProject';
import { ToastContainer } from 'react-toastify';
import EditProject from '@/components/partials/app/projects/EditProject';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import Loading from '@/components/Loading';
import useFetchDocuments from '@/hooks/useFetchDocuments';

const DocumentManagement = () => {
  const [filler, setFiller] = useState('grid');
  const { width, breakpoints } = useWidth();
  const { profile } = useCompleteUserDetails();
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const dispatch = useDispatch();

  const { documents, isLoaded, error } = useFetchDocuments(profile?.id);

  React.useEffect(() => {
    if (profile) {
      setIsProfileLoading(false);
    }
  }, [profile]);

  if (isProfileLoading) {
    return <Loading />;
  }

  return (
    <div>
      <ToastContainer />
      <div className='flex flex-wrap justify-between items-center mb-4'>
        <h4 className='font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4'>
          Document Management
        </h4>
        <div
          className={`${
            width < breakpoints.md ? 'space-x-rb' : ''
          } md:flex md:space-x-4 md:justify-end items-center rtl:space-x-reverse`}
        >
          <Button
            icon='heroicons:list-bullet'
            text='List view'
            disabled={isLoaded}
            className={`${
              filler === 'list'
                ? 'bg-slate-900 dark:bg-slate-700  text-white'
                : ' bg-white dark:bg-slate-800 dark:text-slate-300'
            }   h-min text-sm font-normal`}
            iconClass=' text-lg'
            onClick={() => setFiller('list')}
          />
          <Button
            icon='heroicons-outline:view-grid'
            text='Grid view'
            disabled={isLoaded}
            className={`${
              filler === 'grid'
                ? 'bg-slate-900 dark:bg-slate-700 text-white'
                : ' bg-white dark:bg-slate-800 dark:text-slate-300'
            }   h-min text-sm font-normal`}
            iconClass=' text-lg'
            onClick={() => setFiller('grid')}
          />

          <Button
            icon='heroicons-outline:plus'
            text='Add Documents'
            className='btn-dark dark:bg-slate-800  h-min text-sm font-normal'
            iconClass=' text-lg'
            onClick={() => dispatch(toggleAddModal(true))}
          />
        </div>
      </div>
      {isLoaded && filler === 'grid' && (
        <GridLoading count={documents.length} />
      )}
      {isLoaded && filler === 'list' && (
        <TableLoading count={documents.length} />
      )}

      {filler === 'grid' && !isLoaded && Array.isArray(documents) && (
        <div className='grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5'>
          {documents.map((document) => (
            <ProjectGrid project={document} key={document.id} />
          ))}
        </div>
      )}
      {filler === 'list' && !isLoaded && Array.isArray(documents) && (
        <div>
          <ProjectList projects={documents} />
        </div>
      )}

      <AddProject fetchDocuments={() => fetchDocuments(profile.id)} />
      <EditProject documents={documents} />
    </div>
  );
};

export default DocumentManagement;
