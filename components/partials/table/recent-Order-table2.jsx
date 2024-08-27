'use client';

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import useInvestorStartupMeets from '@/hooks/useInvestorStartupMeets'; // Adjust the path as needed

const COLUMNS = [
  {
    Header: '',
    accessor: 'startup_logo',
    Cell: (row) => {
      return (
        <span className='flex items-center'>
          <div className='flex-none'>
            <div className='w-8 h-8 rounded-[100%] ltr:mr-3 rtl:ml-3'>
              <img
                src={row?.cell?.value}
                alt=''
                className='w-full h-full rounded-[100%] object-cover'
              />
            </div>
          </div>
          <div className='flex-1 text-start'>
            <h4 className='text-sm font-medium text-slate-600 whitespace-nowrap'>
              {row.row.original.startup_name}
            </h4>
            <div className='text-xs font-normal text-slate-600 dark:text-slate-400'>
              {row.row.original.startup_linkedin_profile}
            </div>
          </div>
        </span>
      );
    },
  },
  {
    Header: 'Founder',
    accessor: 'startup_founder',
  },
  {
    Header: 'Date',
    accessor: 'date',
    Cell: (row) => {
      return <span>{new Date(row?.cell?.value).toLocaleDateString()}</span>;
    },
  },
  {
    Header: 'Zoom Link',
    accessor: 'zoom_link',
    Cell: (row) => {
      return (
        <a
          href={row?.cell?.value}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500'
        >
          Join Meeting
        </a>
      );
    },
  },
];

const RecentOrderTable2 = ({ userId, companyProfileId }) => {
  const { meetings, loading, error } = useInvestorStartupMeets(
    userId,
    companyProfileId
  );

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => meetings, [meetings]);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 6,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { pageIndex, pageSize } = state;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div>
        <h6>Top Conversations</h6>
        <div className='overflow-x-auto -mx-6'>
          <div className='inline-block min-w-full align-middle'>
            <div className='overflow-hidden'>
              <table
                className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'
                {...getTableProps()}
              >
                <thead className='bg-slate-200 dark:bg-slate-700'>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          scope='col'
                          className='table-th'
                        >
                          {column.render('Header')}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' 🔽'
                                : ' 🔼'
                              : ''}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  className='bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700'
                  {...getTableBodyProps()}
                >
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className='table-td'>
                            {cell.render('Cell')}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='md:flex md:space-y-0 space-y-5 justify-center mt-6 items-center'>
          <ul className='flex items-center space-x-3 rtl:space-x-reverse'>
            <li className='text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
              <button
                className={`${
                  !canPreviousPage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <Icon icon='heroicons-outline:chevron-left' />
              </button>
            </li>
            {pageOptions.map((page, pageIdx) => (
              <li key={pageIdx + 'sss'}>
                <button
                  href='#'
                  aria-current='page'
                  className={` ${
                    pageIdx === pageIndex
                      ? 'bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium '
                      : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal '
                  } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                  onClick={() => gotoPage(pageIdx)}
                >
                  {pageIdx + 1}
                </button>
              </li>
            ))}
            <li className='text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
              <button
                className={`${
                  !canNextPage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                <Icon icon='heroicons-outline:chevron-right' />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default RecentOrderTable2;
