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
import Loading from '@/components/Loading';
import FundraisingDashboard from '@/components/FundraisingDashboard';

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
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new.user_type === userType) {
            setUsers((prevUsers) => {
              const newUsers = [...prevUsers, payload.new].sort((a, b) =>
                b.status.localeCompare(a.status)
              );
              usersRef.current = newUsers;
              return newUsers;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
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
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'profiles' },
        (payload) => {
          setUsers((prevUsers) => {
            const filteredUsers = prevUsers.filter(
              (user) => user.id !== payload.old.id
            );
            usersRef.current = filteredUsers;
            return filteredUsers;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userType]);

  const approveUser = async (userId, userEmail, userName) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'approved' })
      .eq('id', userId);

    if (error) {
      console.error(error);
      toast.error('Error approving user');
    } else {
      toast.success('User approved successfully');
      const updatedUsers = usersRef.current
        .map((user) =>
          user.id === userId ? { ...user, status: 'approved' } : user
        )
        .sort((a, b) => b.status.localeCompare(a.status));
      setUsers(updatedUsers);
      usersRef.current = updatedUsers;

      try {
        const response = await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to: userEmail, name: userName }),
        });

        if (response.ok) {
          console.log('Approval email sent successfully');
        } else {
          const errorData = await response.json();
          console.error('Failed to send approval email:', errorData.error);
        }
      } catch (error) {
        console.error('Failed to send approval email:', error);
      }
    }
  };

  const disapproveUser = async (userId) => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      console.error(error);
      toast.error('Error disapproving user');
    } else {
      toast.success('User disapproved successfully');
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
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
          <>
            {row.original.status !== 'approved' ? (
              <button
                className='btn btn-primary'
                onClick={() =>
                  approveUser(
                    row.original.id,
                    row.original.email,
                    row.original.name
                  )
                }
              >
                Approve
              </button>
            ) : (
              <button className='btn btn-secondary' disabled>
                Approved
              </button>
            )}
            <button
              className='btn btn-danger ml-2'
              onClick={() => disapproveUser(row.original.id)}
            >
              Disapprove
            </button>
          </>
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
                <div>
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
                      <thead className='bg-slate-200 dark:bg-slate-700'>
                        {headerGroups.map((headerGroup) => {
                          const { key, ...headerGroupProps } =
                            headerGroup.getHeaderGroupProps();
                          return (
                            <tr key={headerGroupProps.key} {...headerGroupProps}>
                              {headerGroup.headers.map((column) => {
                                const { key, ...columnProps } =
                                  column.getHeaderProps(
                                    column.getSortByToggleProps()
                                  );
                                return (
                                  <th
                                    key={columnProps.key}
                                    {...columnProps}
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
                        className='bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700'
                        {...getTableBodyProps()}
                      >
                        {page.map((row) => {
                          prepareRow(row);
                          const { key, ...rowProps } = row.getRowProps();
                          return (
                            <tr key={rowProps.key} {...rowProps}>
                              {row.cells.map((cell) => {
                                const { key, ...cellProps } = cell.getCellProps();
                                return (
                                  <td
                                    key={cellProps.key}
                                    {...cellProps}
                                    className='table-td'
                                  >
                                    {cell.render('Cell')}
                                  </td>
                                );
                              })}
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
                            ? 'bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium'
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
