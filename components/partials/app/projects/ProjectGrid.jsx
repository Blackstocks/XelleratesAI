import React from 'react';
import Card from '@/components/ui/Card';
import Dropdown from '@/components/ui/Dropdown';
import { Menu } from '@headlessui/react';
import Icon from '@/components/ui/Icon';
import { removeProject, updateProject } from './store';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

const ProjectGrid = ({ project }) => {
  const { company_name, company_logo, id } = project;
  const dispatch = useDispatch();
  const router = useRouter();

  const handleClick = (project) => {
    router.push(`/document-management/${project.id}`);
  };

  return (
    <Card>
      <header className='flex justify-between items-end'>
        <div className='flex space-x-4 items-center rtl:space-x-reverse'>
          <div className='flex-none'>
            <img
              src={company_logo}
              alt={`${company_name} logo`}
              className='h-10 w-10 rounded-md'
            />
          </div>
          <div className='font-medium text-base leading-6'>
            <div className='dark:text-slate-200 text-slate-900 max-w-[160px] truncate'>
              {company_name}
            </div>
          </div>
        </div>
        <div>
          <Dropdown
            classMenuItems=' w-[130px]'
            label={
              <span className='text-lg inline-flex flex-col items-center justify-center h-8 w-8 rounded-full bg-gray-500-f7 dark:bg-slate-900 dark:text-slate-400'>
                <Icon icon='heroicons-outline:dots-vertical' />
              </span>
            }
          >
            <div>
              <Menu.Item onClick={() => handleClick(project)}>
                <div
                  className='hover:bg-slate-900 dark:hover:bg-slate-600 dark:hover:bg-opacity-70 hover:text-white
                   w-full border-b border-b-gray-500 border-opacity-10   px-4 py-2 text-sm dark:text-slate-300  last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex  space-x-2 items-center
                     capitalize rtl:space-x-reverse'
                >
                  <span className='text-base'>
                    <Icon icon='heroicons:eye' />
                  </span>
                  <span>View</span>
                </div>
              </Menu.Item>
              <Menu.Item onClick={() => dispatch(updateProject(project))}>
                <div
                  className='hover:bg-slate-900 dark:hover:bg-slate-600 dark:hover:bg-opacity-70 hover:text-white
                   w-full border-b border-b-gray-500 border-opacity-10   px-4 py-2 text-sm dark:text-slate-300  last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex  space-x-2 items-center
                     capitalize rtl:space-x-reverse'
                >
                  <span className='text-base'>
                    <Icon icon='heroicons-outline:pencil-alt' />
                  </span>
                  <span>Edit</span>
                </div>
              </Menu.Item>
              <Menu.Item onClick={() => dispatch(removeProject(id))}>
                <div
                  className='hover:bg-slate-900 dark:hover:bg-slate-600 dark:hover:bg-opacity-70 hover:text-white
                   w-full border-b border-b-gray-500 border-opacity-10   px-4 py-2 text-sm dark:text-slate-300  last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex  space-x-2 items-center
                     capitalize rtl:space-x-reverse'
                >
                  <span className='text-base'>
                    <Icon icon='heroicons-outline:trash' />
                  </span>
                  <span>Delete</span>
                </div>
              </Menu.Item>
            </div>
          </Dropdown>
        </div>
      </header>
    </Card>
  );
};

export default ProjectGrid;
