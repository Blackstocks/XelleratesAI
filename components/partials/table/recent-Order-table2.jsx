import React, { useMemo } from 'react';
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import useInvestorStartupMeets from '@/hooks/useInvestorStartupMeets'; // Import your custom hook

const COLUMNS = [
  {
    Header: 'Sender Company',
    accessor: 'sender_company_name',
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
      <a
        href={value}
        className='text-blue-500 hover:underline'
        target='_blank'
        rel='noopener noreferrer'
      >
        Join Meeting
      </a>
    ),
  },
];

const RecentOrderTable2 = ({ userId, startupId }) => {
  console.log(userId, startupId);
  const { meetings, loading, error } = useInvestorStartupMeets(
    userId,
    startupId
  );

  const columns = useMemo(() => COLUMNS, []);

  // Transform the meetings data outside of the render cycle to prevent unnecessary re-renders
  const transformedMeetings = useMemo(
    () =>
      meetings.map((meeting) => ({
        ...meeting,
        meeting_date: new Date(meeting.date).toLocaleDateString(),
        meeting_time: new Date(meeting.date).toLocaleTimeString(),
      })),
    [meetings]
  );

  const tableInstance = useTable(
    {
      columns,
      data: transformedMeetings,
      initialState: {
        pageSize: 3, // Show only 3 rows
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const { getTableProps, getTableBodyProps, page, prepareRow } = tableInstance;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div>
        <div className='overflow-x-auto -mx-6'>
          <h6 className='ml-6 mb-4'>Top Conversations</h6>
          <div className='inline-block min-w-full align-middle'>
            <div className='overflow-hidden'>
              <table
                className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'
                {...getTableProps()}
              >
                <tbody
                  className='bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700'
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
      </div>
    </>
  );
};

export default RecentOrderTable2;
