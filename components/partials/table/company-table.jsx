'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import GlobalFilter from '@/components/partials/table/GlobalFilter';
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import { fetchInvestorDocuments } from '@/lib/actions/investorActions'; // Import your fetch function
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const COLUMNS = [
  {
    Header: 'Company Name',
    accessor: 'company_name',
    Cell: ({ row }) => {
      return (
        <span className='flex items-center'>
          <div className='flex-none'>
            <div className='w-8 h-8 rounded-[100%] ltr:mr-3 rtl:ml-3'>
              <img
                src={row.original.company_logo}
                alt={row.original.company_name}
                className='w-full h-full rounded-[100%] object-cover'
              />
            </div>
          </div>
          <div className='flex-1 text-start'>
            <h4 className='text-sm font-medium text-slate-600 whitespace-nowrap'>
              {row.original.company_name}
            </h4>
            <div className='text-xs font-normal text-slate-600 dark:text-slate-400'>
              {row.original.company_email}
            </div>
          </div>
        </span>
      );
    },
  },
  {
    Header: 'Sector',
    accessor: 'sector',
    Cell: ({ row }) => <span>{row.original.sector}</span>,
  },
  {
    Header: 'Return on Investment',
    accessor: 'roi',
    Cell: ({ row }) => (
      <div className='flex space-x-6 items-center rtl:space-x-reverse'>
        <span>{row.original.roi + '%'}</span>
        <span
          className={`text-xl ${
            row.original.roi > 100 ? 'text-success-500' : 'text-danger-500'
          }`}
        >
          {row.original.roi > 100 ? (
            <Icon icon='heroicons:arrow-trending-up' />
          ) : (
            <Icon icon='heroicons:arrow-trending-down' />
          )}
        </span>
      </div>
    ),
  },
];

const CompanyTable = () => {
  const [documents, setDocuments] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { profile } = useCompleteUserDetails();

  useEffect(() => {
    const fetchDocuments = async (profileId) => {
      const result = await fetchInvestorDocuments(profileId);
      if (!result.error) {
        setDocuments(result);
      } else {
        console.error('Error fetching documents:', result.error);
      }
    };
    if (profile?.id) {
      fetchDocuments(profile.id);
    }
  }, [profile]);

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => documents, [documents]);

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
    prepareRow,
    setGlobalFilter: setTableGlobalFilter,
  } = tableInstance;

  const { pageIndex } = state;

  const handleSearch = (value) => {
    setGlobalFilter(value);
    setTableGlobalFilter(value);
  };

  return (
    <>
      <div className='mb-4'>
        <GlobalFilter filter={globalFilter} setFilter={handleSearch} />
      </div>
      <div>
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
                  className={`${
                    pageIdx === pageIndex
                      ? 'bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal'
                  } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                  onClick={() => gotoPage(pageIdx)}
                >
                  {page + 1}
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

export default CompanyTable;
