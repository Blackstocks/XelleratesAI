import React from 'react';
import Card from '@/components/ui/Card';

import { useRouter } from 'next/navigation';

const ConnectedStartupsFilesGrid = ({ project }) => {
  // Assuming project contains a 'profiles' object that has 'company_logo'
  const { company_name, profiles, id } = project;
  const company_logo = profiles?.company_logo;
  const router = useRouter();

  console.log("project: ", project);

  const handleClick = () => {
    router.push(`/tools/document-management/${id}`);
  };

  return (
    <Card>
      <header
        className='flex justify-between items-center cursor-pointer'
        onClick={handleClick}
      >
        <div className='flex space-x-4 items-center rtl:space-x-reverse'>
          <div className='flex-none '>
            {company_logo ? (
              <img
                src={company_logo}
                className='h-16 w-16 rounded-md object-cover'
                alt={`${company_name} logo`}
              />
            ) : (
              <div className='h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center'>
                <span className='text-gray-500 text-sm'>No Logo</span>
              </div>
            )}
          </div>
          <div className='font-medium text-base leading-6'>
            <div className='dark:text-slate-200 text-slate-900 max-w-[160px] truncate'>
              {company_name}
            </div>
          </div>
        </div>
        <div>
          {/* <Dropdown
            classMenuItems='w-[130px]'
            label={
              <span className='text-lg inline-flex flex-col items-center justify-center h-8 w-8 rounded-full bg-gray-500-f7 dark:bg-slate-950 dark:text-slate-400'>
                <Icon icon='heroicons-outline:dots-vertical' />
              </span>
            }
          >
            <div>
              <Menu.Item>
                <div
                  className='hover:bg-slate-950 dark:hover:bg-slate-600 dark:hover:bg-opacity-70 hover:text-white
                   w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm dark:text-slate-300 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center capitalize rtl:space-x-reverse'
                >
                  <span className='text-base'>
                    <Icon icon='heroicons:eye' />
                  </span>
                  <span>View</span>
                </div>
              </Menu.Item>
              Uncomment these if needed in the future
              <Menu.Item onClick={() => dispatch(updateProject(project))}>
                <div
                  className='hover:bg-slate-950 dark:hover:bg-slate-600 dark:hover:bg-opacity-70 hover:text-white
                   w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm dark:text-slate-300 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center capitalize rtl:space-x-reverse'
                >
                  <span className='text-base'>
                    <Icon icon='heroicons-outline:pencil-alt' />
                  </span>
                  <span>Edit</span>
                </div>
              </Menu.Item>
              <Menu.Item onClick={() => dispatch(removeProject(id))}>
                <div
                  className='hover:bg-slate-950 dark:hover:bg-slate-600 dark:hover:bg-opacity-70 hover:text-white
                   w-full px-4 py-2 text-sm dark:text-slate-300 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center capitalize rtl:space-x-reverse'
                >
                  <span className='text-base'>
                    <Icon icon='heroicons-outline:trash' />
                  </span>
                  <span>Delete</span>
                </div>
              </Menu.Item>
             
            </div>
          </Dropdown> */}
        </div>
      </header>
    </Card>
  );
};

export default ConnectedStartupsFilesGrid;
