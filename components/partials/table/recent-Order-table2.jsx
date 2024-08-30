'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { useTable, useRowSelect, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import useInvestorStartupMeets from '@/hooks/useInvestorStartupMeets'; // Adjust the path as needed
import { supabase } from '@/lib/supabaseclient';

// Define INVESTOR_COLUMNS
const INVESTOR_COLUMNS = [
  // Define the columns as needed
  {
    Header: 'Investor Name',
    accessor: 'investor_logo',
    Cell: (row) => {
      return (
        <span className='flex items-center'>
          <div className='flex-none'>
            <div className='w-8 h-8 rounded-[100%] ltr:mr-3 rtl:ml-3'>
              <img
                src={row?.cell?.value}
                alt=''
                className='w-full h-full rounded-[100%] object-contain'
              />
            </div>
          </div>
          <div className='flex-1 text-start'>
            <h4 className='text-sm font-medium text-slate-600 whitespace-nowrap'>
              {row.row.original.investor_name}
            </h4>
            <div className='text-xs font-normal text-slate-600 dark:text-slate-400'>
              {row.row.original.investor_type}
            </div>
          </div>
        </span>
      );
    },
  },
  {
    Header: 'Company',
    accessor: 'investor_company',
  },
  {
    Header: 'Sector',
    accessor: 'investor_sectors',
    Cell: (row) => {
      const sectorArray = JSON.parse(row.row.original.investor_sectors || '[]');
      const sectorLabels = sectorArray.join(', ');
      return <span>{sectorLabels}</span>;
    },
  },
  {
    Header: 'LinkedIn',
    accessor: 'investor_linkedin_profile',
    Cell: ({ value }) => {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          LinkedIn Profile
        </a>
      );
    },
  },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: ({ row }) => {
      return (
        <span className='text-sm font-medium text-slate-600'>
          {row.original.status}
        </span>
      );
    },
  }
];

// Define STARTUP_COLUMNS
const STARTUP_COLUMNS = [
  // Define the columns as needed
  {
    Header: 'Startup Name',
    accessor: 'startup_logo',
    Cell: (row) => {
      return (
        <span className='flex items-center'>
          <div className='flex-none'>
            <div className='w-8 h-8 rounded-[100%] ltr:mr-3 rtl:ml-3'>
              <img
                src={row?.cell?.value}
                alt=''
                className='w-full h-full rounded-[100%] object-contain'
              />
            </div>
          </div>
          <div className='flex-1 text-start'>
            <h4 className='text-sm font-medium text-slate-600 whitespace-nowrap'>
              {row.row.original.startup_name}
            </h4>
            <div className='text-xs font-normal text-slate-600 dark:text-slate-400'>
              {JSON.parse(row.row.original.startup_country || '{}').label}
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
    Header: 'Sector',
    accessor: 'startup_industry',
  },
  {
    Header: 'LinkedIn',
    accessor: 'startup_linkedin_profile',
    Cell: ({ value }) => {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          LinkedIn Profile
        </a>
      );
    },
  },
  {
    Header: 'Status',
    accessor: 'status',
    Cell: ({ row }) => {
      return (
        <span className='text-sm font-medium text-slate-600'>
          {row.original.status}
        </span>
      );
    },
  }
];

const RecentOrderTable2 = ({ userId, companyProfileId, userType }) => {
  const [statusMap, setStatusMap] = useState({}); // State to store status for each entry
  const [errorMap, setErrorMap] = useState({}); // State to store errors for each entry
  const { meetings, loading: meetingsLoading, error: meetingsError } = useInvestorStartupMeets(userId, companyProfileId);

  // Function to fetch status for a specific entry
  const fetchStatusForEntry = async (investorId, startupId) => {
    if (!investorId || !startupId) {
      console.error('Investor ID or Startup ID is undefined');
      return;
    }

    console.log("User ID:", userId);
    console.log("Inv ID:", investorId);
    console.log("Startup ID:", startupId);
  
    try {
      let statusData = [];
      let error = null;
  
      if (userType === 'investor') {
        // Investor flow: Match both startupId and investorId with the investor_startup_assignments table
        const { data, error: investorError } = await supabase
          .from('investor_startup_assignments')
          .select('status, startup_id')
          .eq('investor_id', investorId)
          .eq('startup_id', startupId);  // Match both investor and startup IDs
  
        statusData = data;
        console.log("New startup status data:", statusData);
        error = investorError;
        
      } else {
        // Startup flow: Fetch new IDs and then fetch status
        const { data: startupData, error: startupError } = await supabase
          .from('connected_startup_equity')
          .select('id')
          .eq('user_id', userId)
          .single();

          console.log("New startup ID:", startupData.id);
  
        if (startupError || !startupData) {
          console.error('Error fetching connected startup ID:', startupError);
          setErrorMap((prev) => ({ ...prev, [startupId]: startupError?.message || 'No connected startup found' }));
          return;
        }
  
        const { data: investorData, error: investorError } = await supabase
          .from('investor_signup')
          .select('id')
          .eq('profile_id', investorId)
          .single();
        
          console.log("New investor ID:", investorData.id);
        if (investorError || !investorData) {
          console.error('Error fetching connected investor ID:', investorError);
          setErrorMap((prev) => ({ ...prev, [startupId]: investorError?.message || 'No connected investor found' }));
          return;
        }
  
        const newStartupId = startupData.id;
        const newInvestorId = investorData.id;
  
        const { data: dealflowData, error: dealflowError } = await supabase
          .from('assigned_dealflow')
          .select('status, startup_id')
          .eq('startup_id', newStartupId)
          .eq('investor_id', newInvestorId);
  
        statusData = dealflowData[0];
        error = dealflowError;
        console.log("New startup status data:", statusData);
      }
  
      if (error) {
        console.error('Error fetching status data:', error);
        setErrorMap((prev) => ({ ...prev, [startupId]: error.message })); // Store error for specific entry
      } else {
        // Find the entry where startup_id matches the provided startupId
        const matchingEntry = statusData;
  
        // Define a mapping for status values
        const statusMapping = {
          moving_forward: 'Moving Forward',
          evaluated: 'Evaluated',
          meeting_done: 'Meeting Done',
          curated_deal: 'Curated Deal',
          NULL: 'Curated Deal',
        };
  
        // Update the logic to map status values correctly
        if (matchingEntry) {
          if (userType === 'investor'){
            console.log("matching entry status", matchingEntry.status);
            setStatusMap((prev) => ({
              ...prev,
              [startupId]: statusMapping[matchingEntry.status] || 'Curated Deal'  // Use the mapping for the status
            }));}

            else{
              {setStatusMap((prev) => ({
                ...prev,
                [startupId]: matchingEntry.status || 'Curated Deal'  // Use the mapping for the status
              }));}
            }

          
        } else {
          setStatusMap((prev) => ({
            ...prev,
            [startupId]: 'Not Found'  // Handle case where no matching entry is found
          }));
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching status:', err);
      setErrorMap((prev) => ({ ...prev, [startupId]: 'Error fetching status' }));
    }
  };
  

  // Fetch status data for each row when the component mounts or when data changes
  useEffect(() => {
    if (meetings) {
      meetings.forEach((meeting) => {
        fetchStatusForEntry(meeting.receiver_id, meeting.sender_id);
      });
    }
  }, [meetings]);

  // Memoized columns and data
  const columns = useMemo(() => (userType === 'investor' ? STARTUP_COLUMNS : INVESTOR_COLUMNS), [userType]);
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

  if (meetingsLoading) {
    return <div>Loading...</div>; // Display loading indicator
  }

  if (meetingsError) {
    return <div>Error: {meetingsError.message}</div>; // Display error message
  }

  return (
    <>
      <div>
        <h6>Top Conversations</h6>
        <div className='overflow-x-auto -mx-6 mt-4'>
          <div className='inline-block min-w-full align-middle'>
            <div className='overflow-hidden'>
              <table className='min-w-full divide-y divide-slate-100 border-b dark:divide-slate-700' {...getTableProps()}>
                <thead className='bg-slate-50 dark:bg-slate-700'>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className='table-th py-3 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400'
                        >
                          {column.render('Header')}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className='bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700' {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} className='border-t'>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className='py-3 px-2 text-sm text-slate-600 dark:text-slate-300'>
                            {cell.column.id === 'status' ? (
                              statusMap[row.original.sender_id] ? (
                                <span className='text-sm font-medium text-slate-600'>
                                  {statusMap[row.original.sender_id]} {/* Render fetched status */}
                                </span>
                              ) : errorMap[row.original.sender_id] ? (
                                <span className='text-sm text-red-500'>
                                  {errorMap[row.original.sender_id]} {/* Render error if fetching failed */}
                                </span>
                              ) : (
                                <span>Loading...</span> 
                              )
                            ) : (
                              cell.render('Cell')
                            )}
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
                className={`${!canPreviousPage ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <Icon icon='heroicons-outline:chevron-left' />
              </button>
            </li>
            {pageOptions.map((page, pageIdx) => (
              <li key={pageIdx + 'sss'}>
                <button
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
                className={`${!canNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
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
