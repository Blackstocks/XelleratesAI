'use client';

import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Card from '@/components/ui/Card';
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';

const COLUMNS = [
  {
    Header: 'Tools',
    accessor: 'product',
    Cell: ({ cell: { value } }) => (
      <span className='text-sm font-medium text-gray-800 dark:text-gray-100'>
        {value || 'N/A'}
      </span>
    ),
  },
  {
    Header: 'Cost',
    accessor: 'price',
    Cell: ({ cell: { value } }) => (
      <span className='text-sm text-gray-600 dark:text-gray-400'>
        {value ? `$${value}` : 'N/A'}
      </span>
    ),
  },
  {
    Header: 'Payment Method',
    accessor: 'mode_of_payment',
    Cell: ({ row }) => (
      <span className='text-sm text-gray-600 dark:text-gray-400'>
        <span className='block font-medium text-gray-800 dark:text-gray-100'>
          {row?.original?.mode_of_payment || 'N/A'}
        </span>
        <span className='block text-xs text-gray-500 dark:text-gray-400'>
          Trans ID: {row?.original?.transaction_id || 'N/A'}
        </span>
      </span>
    ),
  },
  {
    Header: 'Recharge',
    accessor: 'date_of_payment',
    Cell: ({ cell: { value } }) => {
      const date = value ? new Date(value).toLocaleDateString() : 'N/A';
      return <span className='text-sm text-gray-600 dark:text-gray-400'>{date}</span>;
    },
  },
];

const TransactionsTable2 = ({ profileId }) => {
  const [walletPayments, setWalletPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchWalletPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('wallet_payments')
          .select('*')
          .eq('startup_id', profileId);

        if (error) {
          console.error('Error fetching wallet payments:', error.message);
        } else {
          setWalletPayments(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching wallet payments:', error.message);
      }
    };

    if (profileId) {
      fetchWalletPayments();
    }
  }, [profileId]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return walletPayments;
    return walletPayments.filter((item) =>
      item.product.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [walletPayments, searchQuery]);

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => filteredData, [filteredData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 5 },
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
  } = tableInstance;

  const { globalFilter, pageIndex } = state;

  return (
    <Card className='bg-gray-50 dark:bg-slate-800 shadow-md rounded-lg'>
      <div className='flex justify-between items-center mb-4'>
        <h4 className='text-lg font-semibold text-gray-800 dark:text-white'>Tools and Cost</h4>
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search...'
          className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>
      <div className='overflow-x-auto'>
        <table
          className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'
          {...getTableProps()}
        >
          <thead className='bg-gray-200 dark:bg-slate-700'>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300`}
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            className={'bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700'}
            {...getTableBodyProps()}
          >
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className='hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200'
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className='px-4 py-3 text-sm text-gray-800 dark:text-gray-300'
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
            {page.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className='py-4 text-center text-gray-500 italic'
                >
                  No payment details available for this profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='py-4 flex items-center justify-between'>
        <span className='text-sm text-gray-600 dark:text-gray-300'>
          Page {pageIndex + 1} of {pageOptions.length}
        </span>
        <div className='flex space-x-2'>
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className='px-3 py-1 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {'<<'}
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className='px-3 py-1 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {'<'}
          </button>
          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className='px-3 py-1 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {'>'}
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className='px-3 py-1 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {'>>'}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TransactionsTable2;
