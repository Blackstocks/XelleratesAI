import React, { useState, useMemo, useEffect } from 'react';
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import Icon from '@/components/ui/Icon';

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

const RecentOrderTable2 = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/fetchEventData');
        if (!response.ok) throw new Error('Failed to fetch meetings');

        const data = await response.json();
        const sortedMeetings = data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3)
          .map((meeting) => ({
            ...meeting,
            meeting_date: new Date(meeting.date).toLocaleDateString(),
            meeting_time: new Date(meeting.date).toLocaleTimeString(),
          }));

        setMeetings(sortedMeetings);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => meetings, [meetings]);

  const tableInstance = useTable(
    {
      columns,
      data,
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
          <h6 className='ml-6 mb-4'>Top Meetings</h6>
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
