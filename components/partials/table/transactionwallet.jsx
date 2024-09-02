'use client';

import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import GlobalFilter from '@/components/partials/table/GlobalFilter';

const COLUMNS = [
  {
    Header: 'Tools',
    accessor: 'product',
    Cell: ({ cell: { value } }) => {
      return (
        <span className='text-sm text-slate-600 dark:text-slate-300 capitalize font-medium'>
          {value || 'N/A'}
        </span>
      );
    },
  },
  {
    Header: 'Cost',
    accessor: 'price',
    Cell: ({ cell: { value } }) => {
      return (
        <span className='text-slate-500 dark:text-slate-400'>
          {value ? `$${value}` : 'N/A'}
        </span>
      );
    },
  },
  {
    Header: 'Payment Method',
    accessor: 'mode_of_payment',
    Cell: ({ row }) => {
      return (
        <span className='text-slate-500 dark:text-slate-400'>
          <span className='block text-slate-600 dark:text-slate-300'>
            {row?.original?.mode_of_payment || 'N/A'}
          </span>
          <span className='block text-slate-500 text-xs'>
            Trans ID: {row?.original?.transaction_id || 'N/A'}
          </span>
        </span>
      );
    },
  },
  {
    Header: 'Recharge',
    accessor: 'date_of_payment',
    Cell: ({ cell: { value } }) => {
      const date = value ? new Date(value).toLocaleDateString() : 'N/A';
      return <span className='text-slate-500 dark:text-slate-400'>{date}</span>;
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
          .eq('startup_id', profileId); // Fetch data for the specific profile

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
      initialState: {
        pageSize: 4, // Set page size to 4 entries per page
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
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <>
      <Card noborder>
        <div className='md:flex justify-between items-center mb-6'>
          <h4 className='card-title'>Tools and Cost</h4>
          <div className='flex items-center space-x-4'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search...'
              className='p-2 border border-gray-300 rounded'
            />
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
                  {headerGroups.map((headerGroup) => {
                    const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                      <tr key={key} {...restHeaderGroupProps}>
                        {headerGroup.headers.map((column) => {
                          const { key, ...restColumn } = column.getHeaderProps();
                          return (
                            <th
                              key={key}
                              {...restColumn}
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
                          );
                        })}
                      </tr>
                    );
                  })}
                </thead>
                <tbody
                  className='bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700'
                  {...getTableBodyProps()}
                >
                  {filteredData.length > 0 ? (
                    page.map((row) => {
                      prepareRow(row);
                      const { key, ...restRowProps } = row.getRowProps();
                      return (
                        <tr key={key} {...restRowProps}>
                          {row.cells.map((cell) => {
                            const { key, ...restCellProps } = cell.getCellProps();
                            return (
                              <td
                                key={key}
                                {...restCellProps}
                                className='table-td py-2'
                              >
                                {cell.render('Cell')}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        className='py-3 px-5 text-center text-gray-500 italic'
                      >
                        No payment details available for this profile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='py-3 flex items-center justify-between'>
          <div className='flex-1 flex items-center justify-between'>
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
        </div>
      </Card>
    </>
  );
};

export default TransactionsTable2;
