'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from 'react-table';
import Card from '@/components/ui/Card';
import GlobalFilter from '@/components/GlobalFilter';
import Loading from '@/app/loading';
import Link from 'next/link';

const ScheduledMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/fetchEventData');
        if (!response.ok) throw new Error('Failed to fetch meetings');

        const data = await response.json();
        setMeetings(
          data.map((meeting) => ({
            ...meeting,
            meeting_date: new Date(meeting.date).toLocaleDateString(),
            meeting_time: new Date(meeting.date).toLocaleTimeString(),
          }))
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Sender Company',
        accessor: 'sender_company_name',
      },
      {
        Header: 'Receiver Name',
        accessor: 'receiver_name',
      },
      {
        Header: 'Details',
        accessor: 'details',
      },
      {
        Header: 'Meeting Date',
        accessor: 'meeting_date',
      },
      {
        Header: 'Meeting Time',
        accessor: 'meeting_time',
      },
      {
        Header: 'Meeting Link',
        accessor: 'zoom_link',
        Cell: ({ value }) => (
          <Link
            href={value}
            className='relative text-blue-500 hover:underline overflow-hidden group'
            target='_blank'
            rel='noopener noreferrer'
          >
            <span className='relative z-10'>Join Meeting</span>
            <span className='absolute bottom-0 left-0 w-0 h-[2px] bg-blue-300 transition-all duration-500 ease-out group-hover:w-full'></span>
          </Link>
        ),
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data: meetings,
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card>
      <div className='md:flex justify-between items-center mb-6'>
        <h4 className='card-title'>Scheduled Meetings</h4>
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      </div>
      <div className='overflow-x-auto -mx-6'>
        <div className='inline-block min-w-full align-middle'>
          <div className='overflow-hidden'>
            <table
              className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'
              {...getTableProps()}
            >
              <thead className='bg-slate-200 dark:bg-slate-700'>
                {headerGroups.map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    {...headerGroup.getHeaderGroupProps()}
                  >
                    {headerGroup.headers.map((column) => (
                      <th
                        key={column.id}
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
                    <tr key={row.id} {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td
                          key={cell.id}
                          {...cell.getCellProps()}
                          className='table-td'
                        >
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
      <div className='md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center'>
        <div className='flex items-center space-x-3 rtl:space-x-reverse'>
          <select
            className='form-control py-2 w-max'
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <span className='text-sm font-medium text-slate-600 dark:text-slate-300'>
            Page{' '}
            <span>
              {pageIndex + 1} of {pageOptions.length}
            </span>
          </span>
        </div>
        <ul className='flex items-center space-x-3 rtl:space-x-reverse flex-wrap'>
          <li className='text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
            <button
              className={`${
                !canPreviousPage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            >
              «
            </button>
          </li>
          <li className='text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
            <button
              className={`${
                !canPreviousPage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              Prev
            </button>
          </li>
          <li className='text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
            <button
              className={`${
                !canNextPage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => nextPage()}
              disabled={!canNextPage}
            >
              Next
            </button>
          </li>
          <li className='text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className={`${
                !canNextPage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              »
            </button>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default ScheduledMeetings;
