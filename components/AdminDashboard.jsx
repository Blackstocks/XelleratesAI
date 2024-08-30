import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { toast } from 'react-toastify';
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from 'react-table';
import GlobalFilter from '@/components/GlobalFilter';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import useUserDetails from '@/hooks/useUserDetails';
import Loading from '@/app/loading';
import FundraisingDashboard from '@/components/FundraisingDashboard';
import Link from 'next/link';

// Reusable Action Button Component
const ActionButton = ({ label, onClick, disabled, className }) => (
  <button className={className} onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

const AdminDashboard = ({ userType }) => {
  const [users, setUsers] = useState([]);
  const usersRef = useRef(users);
  const { user, loading } = useUserDetails();
  const role = user?.role;

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', userType);

    if (error) {
      console.error(error);
    } else {
      const sortedData = data.sort((a, b) => b.status.localeCompare(a.status));
      setUsers(sortedData);
      usersRef.current = sortedData;
    }
  };

  useEffect(() => {
    fetchUsers();

    const subscription = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { schema: 'public', table: 'profiles' },
        (payload) => {
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            if (payload.new.user_type === userType) {
              setUsers((prevUsers) => {
                const updatedUsers = prevUsers
                  .map((user) =>
                    user.id === payload.new.id ? payload.new : user
                  )
                  .sort((a, b) => b.status.localeCompare(a.status));
                usersRef.current = updatedUsers;
                return updatedUsers;
              });
            }
          }
          if (payload.eventType === 'DELETE') {
            setUsers((prevUsers) => {
              const filteredUsers = prevUsers.filter(
                (user) => user.id !== payload.old.id
              );
              usersRef.current = filteredUsers;
              return filteredUsers;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userType]);

  const handleUserApproval = async (userId, userEmail, userName) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', userId);

    if (error) {
      console.error(error);
      toast.error('Error approving user');
    } else {
      toast.success('User approved successfully');
      updateUserStatus(userId, 'approved');
      sendApprovalEmail(userEmail, userName);
    }
  };

  const updateUserStatus = (userId, status) => {
    const updatedUsers = usersRef.current
      .map((user) => (user.id === userId ? { ...user, status } : user))
      .sort((a, b) => b.status.localeCompare(a.status));
    setUsers(updatedUsers);
    usersRef.current = updatedUsers;
  };

  const sendApprovalEmail = async (userEmail, userName) => {
    try {
      const response = await fetch('/api/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userEmail, name: userName }),
      });

      if (response.ok) {
        console.log('Approval email sent successfully');
      } else {
        console.error('Failed to send approval email:', await response.json());
      }
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'LinkedIn',
        accessor: 'linkedin_profile',
        Cell: ({ value }) => (
          <Link
            href={value}
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: 'blue' }}
          >
            {value.length > 20 ? `${value.substring(0, 20)}...` : value}
          </Link>
        ),
      },
      {
        Header: 'Email',
        accessor: 'email',
        Cell: ({ value }) => <Link href={`mailto:${value}`}>{value}</Link>,
      },
      {
        Header: 'Phone',
        accessor: 'mobile',
        Cell: ({ value }) => <Link href={`tel:${value}`}>{value}</Link>,
      },
      {
        Header: 'Role',
        accessor: 'role',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span
            className={value === 'approved' ? 'text-green-600' : 'text-red-600'}
          >
            {value}
          </span>
        ),
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <ActionButton
            label={row.original.status !== 'approved' ? 'Approve' : 'Approved'}
            onClick={() =>
              row.original.status !== 'approved' &&
              handleUserApproval(
                row.original.id,
                row.original.email,
                row.original.name
              )
            }
            disabled={row.original.status === 'approved'}
            className={
              row.original.status === 'approved'
                ? 'btn btn-secondary'
                : 'btn btn-primary'
            }
          />
        ),
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data: users,
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

  return (
    <>
      {role === 'super_admin' ? (
        <>
          {userType === 'fundraising' ? (
            <FundraisingDashboard />
          ) : (
            <Card>
              <div className='md:flex justify-between items-center mb-6'>
                <h4 className='card-title'>Admin Dashboard</h4>
                <GlobalFilter
                  filter={globalFilter}
                  setFilter={setGlobalFilter}
                />
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
                    Page {pageIndex + 1} of {pageOptions.length}
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
                      <Icon icon='heroicons:chevron-double-left-solid' />
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
                  {pageOptions.map((pageIdx) => (
                    <li key={pageIdx}>
                      <button
                        className={`${
                          pageIdx === pageIndex
                            ? 'bg-slate-950 dark:bg-slate-600 dark:text-slate-200 text-white font-medium'
                            : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal'
                        } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                        onClick={() => gotoPage(pageIdx)}
                      >
                        {pageIdx + 1}
                      </button>
                    </li>
                  ))}
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
                      <Icon icon='heroicons:chevron-double-right-solid' />
                    </button>
                  </li>
                </ul>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <h4 className='card-title'>Admin Dashboard</h4>
          <p className='text-red-600'>
            You do not have permission to access this page
          </p>
        </Card>
      )}
    </>
  );
};

export default AdminDashboard;
