'use client';
import React, { useState, useMemo } from 'react';
import Card from '@/components/ui/Card';
import {
  useTable,
  useSortBy,
  usePagination,
  useGlobalFilter,
} from 'react-table';
import GlobalFilter from '@/components/partials/table/GlobalFilter';
import { useDocumentContext } from '@/context/DocumentContext';
import Dropdown from '@/components/ui/Dropdown';
import Icon from '@/components/ui/Icon';
import { Menu } from '@headlessui/react';

const COLUMNS = [
  {
    Header: 'Document Type',
    accessor: 'document_type',
  },
  {
    Header: 'Date',
    accessor: 'created_at',
    Cell: ({ value }) => (
      <span className='text-slate-500 dark:text-slate-400'>
        {new Date(value).toLocaleDateString()}{' '}
        {new Date(value).toLocaleTimeString()}
      </span>
    ),
  },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: ({ value, row }) => (
      <span className='block w-full'>
        {value ? (
          <a
            href={row.original.document_link}
            target='_blank'
            rel='noopener noreferrer'
          >
            View Doc
          </a>
        ) : (
          'Not Provided'
        )}
      </span>
    ),
  },
  {
    Header: 'Request Document',
    accessor: 'request_document',
    Cell: () => (
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        Request
      </button>
    ),
  },
];

const filters = {
  documents: [
    'nda',
    'termsheet',
    'transaction_documents',
    'share_subscription_agreement',
    'share_holder_agreement',
    'share_purchase_agreement',
    'conditions_precedent_documents',
    'closing_documents',
    'cs_documents',
    'due_diligence_report',
  ],
  financials: [
    'mis_quarterly',
    'mis_annually',
    'balance_sheet',
    'pl_statement',
    'cashflow_statement',
    'audited_financials',
    'valuation_report',
  ],
  approvals: ['board_meetings', 'shareholders_meetings', 'board_resolutions'],
};

const PortfolioTable = () => {
  const { selectedDocuments } = useDocumentContext();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => {
    if (!selectedDocuments) return [];
    const documents = [];

    Object.keys(selectedDocuments).forEach((key) => {
      if (
        key !== 'id' &&
        key !== 'profile_id' &&
        key !== 'company_name' &&
        key !== 'company_logo' &&
        key !== 'created_at'
      ) {
        const document_type = key.replace(/_/g, ' ');
        const status = selectedDocuments[key] !== null;
        if (
          selectedFilter === 'all' ||
          filters[selectedFilter]?.includes(key)
        ) {
          documents.push({
            document_type,
            created_at: selectedDocuments.created_at,
            status,
            document_link: selectedDocuments[key],
            request_document: 'Request', // Adding this to match the new column
          });
        }
      }
    });

    return documents;
  }, [selectedDocuments, selectedFilter]);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
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

  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <Card noborder>
      <div className='md:flex justify-between items-center mb-6'>
        <h4 className='card-title'>All Documents</h4>
        <div className='flex items-center space-x-4'>
          <Dropdown
            classMenuItems='right-0 w-[200px] top-[110%]'
            label={
              <span className='text-xl text-center block w-full'>
                <Icon icon='heroicons-outline:filter' />
              </span>
            }
          >
            <div className='divide-y divide-slate-100 dark:divide-slate-800'>
              {['all', ...Object.keys(filters)].map((filter) => (
                <Menu.Item key={filter}>
                  <div
                    onClick={() => setSelectedFilter(filter)}
                    className={`hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50 w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center rtl:space-x-reverse ${
                      selectedFilter === filter
                        ? 'bg-slate-200 dark:bg-slate-700'
                        : ''
                    }`}
                  >
                    <span>
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </span>
                  </div>
                </Menu.Item>
              ))}
            </div>
          </Dropdown>
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
        </div>
      </div>
      <div className='overflow-x-auto -mx-6'>
        <div className='inline-block min-w-full align-middle'>
          <div className='overflow-hidden'>
            <table
              className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'
              {...getTableProps()}
            >
              <thead className='border-t border-slate-100 dark:border-slate-800'>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
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
                        <td {...cell.getCellProps()} className='table-td py-2'>
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
      <div className='py-3 flex items-center justify-between'>
        <span className='text-sm text-slate-700 dark:text-slate-200'>
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className='btn btn-light'
          >
            {'<<'}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className='btn btn-light'
          >
            {'<'}
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className='btn btn-light'
          >
            {'>'}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className='btn btn-light'
          >
            {'>>'}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioTable;
