// 'use client';

// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { supabase } from '@/lib/supabaseclient';
// import { toast } from 'react-toastify';
// import {
//   useTable,
//   useGlobalFilter,
//   useSortBy,
//   usePagination,
// } from 'react-table';
// import GlobalFilter from '@/components/GlobalFilter';
// import Card from '@/components/ui/Card';
// import Icon from '@/components/ui/Icon';
// import useUserDetails from '@/hooks/useUserDetails';
// import Loading from '@/app/loading';
// import FundraisingDashboard from '@/components/FundraisingDashboard';

// const HotDeals = ({ userType = 'startup' }) => {
//   const [companies, setCompanies] = useState([]);
//   const [hotDeals, setHotDeals] = useState([]);
//   const companiesRef = useRef(companies);
//   const { user, loading } = useUserDetails();
//   const role = user?.role;

//   const fetchCompanies = async () => {
//     const { data, error } = await supabase
//       .from('company_profile')
//       .select('id, company_name, profile_id');

//     if (error) {
//       console.error(error);
//     } else if (data) {
//       // Fetch the company logos for the associated profile_ids
//       const profileIds = data.map((company) => company.profile_id);
//       const { data: profilesData, error: profilesError } = await supabase
//         .from('profiles')
//         .select('id, company_logo')
//         .in('id', profileIds);

//       if (profilesError) {
//         console.error(profilesError);
//       } else if (profilesData) {
//         const companiesWithLogos = data.map((company) => {
//           const profile = profilesData.find(
//             (profile) => profile.id === company.profile_id
//           );
//           return {
//             ...company,
//             company_logo: profile ? profile.company_logo : null,
//           };
//         });
//         setCompanies(companiesWithLogos);
//       }
//     }
//   };

//   const fetchHotDeals = async () => {
//     const { data, error } = await supabase
//       .from('hot_deals')
//       .select('startup_id');

//     if (error) {
//       console.error(error);
//     } else if (data) {
//       setHotDeals(data);
//     }
//   };

//   useEffect(() => {
//     fetchCompanies();
//     fetchHotDeals();

//     const subscription = supabase
//       .channel('public:company_profile')
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'company_profile' },
//         (payload) => {
//           if (payload.new.company_type === userType) {
//             setCompanies((prevCompanies) => {
//               const newCompanies = [...prevCompanies, payload.new].sort(
//                 (a, b) => b.company_name.localeCompare(a.company_name)
//               );
//               companiesRef.current = newCompanies;
//               return newCompanies;
//             });
//           }
//         }
//       )
//       .on(
//         'postgres_changes',
//         { event: 'UPDATE', schema: 'public', table: 'company_profile' },
//         (payload) => {
//           if (payload.new.company_type === userType) {
//             setCompanies((prevCompanies) => {
//               const updatedCompanies = prevCompanies
//                 .map((company) =>
//                   company.id === payload.new.id ? payload.new : company
//                 )
//                 .sort((a, b) => b.company_name.localeCompare(a.company_name));
//               companiesRef.current = updatedCompanies;
//               return updatedCompanies;
//             });
//           }
//         }
//       )
//       .on(
//         'postgres_changes',
//         { event: 'DELETE', schema: 'public', table: 'company_profile' },
//         (payload) => {
//           setCompanies((prevCompanies) => {
//             const filteredCompanies = prevCompanies.filter(
//               (company) => company.id !== payload.old.id
//             );
//             companiesRef.current = filteredCompanies;
//             return filteredCompanies;
//           });
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(subscription);
//     };
//   }, [userType]);

//   const addStartupToHotDeals = async (companyId, name, profileId) => {
//     try {
//       // Fetch current hot deals to determine the next rank
//       const { data: currentHotDeals, error: fetchError } = await supabase
//         .from('hot_deals')
//         .select('id')
//         .order('rank', { ascending: true });

//       if (fetchError) {
//         console.error('Error fetching hot deals:', fetchError);
//         toast.error('Error fetching current hot deals');
//         return;
//       }

//       // Determine the rank for the new entry
//       const nextRank = currentHotDeals.length + 1;

//       // Insert the new company into hot_deals with the determined rank
//       const { error } = await supabase.from('hot_deals').upsert({
//         startup_id: companyId,
//         name,
//         profile_id: profileId, // Add the profile_id here
//         rank: nextRank, // Assign the rank based on the current count
//       });

//       if (error) {
//         console.error('Error adding company to hot_deals:', error);
//         toast.error('Error adding company to hot deals');
//       } else {
//         toast.success(
//           `Company ${name} added to hot deals at position ${nextRank}.`
//         );
//         fetchHotDeals(); // Refresh the hot deals list
//       }
//     } catch (error) {
//       console.error('Unexpected error:', error);
//       toast.error('Unexpected error occurred');
//     }
//   };

//   const removeStartupFromHotDeals = async (companyId) => {
//     const { error } = await supabase
//       .from('hot_deals')
//       .delete()
//       .eq('startup_id', companyId);

//     if (error) {
//       console.error('Error removing company from hot_deals:', error);
//       toast.error('Error removing company from hot_deals');
//     } else {
//       toast.success('Company removed from hot_deals.');
//       fetchHotDeals();
//     }
//   };

//   const columns = useMemo(
//     () => [
//       {
//         Header: 'ID',
//         accessor: 'id',
//       },
//       {
//         Header: 'Company Name',
//         accessor: 'company_name',
//       },
//       // {
//       //   Header: 'Company Logo',
//       //   accessor: 'company_logo',
//       //   Cell: ({ value }) =>
//       //     value ? (
//       //       <img
//       //         src={value}
//       //         alt='Company Logo'
//       //         style={{ width: '50px', height: '50px' }}
//       //       />
//       //     ) : (
//       //       'No Logo'
//       //     ),
//       // },
//         Header: 'Actions',
//         Cell: ({ row }) => {
//           const isHotDeal = hotDeals.some(
//             (deal) => deal.startup_id === row.original.id
//           );
//           return (
//             <>
//               {isHotDeal ? (
//                 <button
//                   className='btn btn-secondary'
//                   onClick={() => removeStartupFromHotDeals(row.original.id)}
//                 >
//                   Remove from Hot Deals
//                 </button>
//               ) : (
//                 <button
//                   className='btn btn-primary'
//                   onClick={() =>
//                     addStartupToHotDeals(
//                       row.original.id,
//                       row.original.company_name,
//                       row.original.profile_id // Pass the profile_id when adding to hot deals
//                     )
//                   }
//                 >
//                   Add to Hot Deals
//                 </button>
//               )}
//             </>
//           );
//         },
//       },
//     ],
//     [hotDeals]
//   );

//   const tableInstance = useTable(
//     {
//       columns,
//       data: companies,
//     },
//     useGlobalFilter,
//     useSortBy,
//     usePagination
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     page,
//     nextPage,
//     previousPage,
//     canNextPage,
//     canPreviousPage,
//     pageOptions,
//     state,
//     gotoPage,
//     pageCount,
//     setPageSize,
//     setGlobalFilter,
//     prepareRow,
//   } = tableInstance;

//   const { globalFilter, pageIndex, pageSize } = state;

//   const sortedCompanies = useMemo(() => {
//     const hotDealIds = hotDeals.map((deal) => deal.startup_id);
//     return [
//       ...companies.filter((company) => hotDealIds.includes(company.id)),
//       ...companies.filter((company) => !hotDealIds.includes(company.id)),
//     ];
//   }, [companies, hotDeals]);

//   if (loading) {
//     return <Loading />;
//   }

//   return (
//     <>
//       {role === 'super_admin' ? (
//         <>
//           {userType === 'fundraising' ? (
//             <FundraisingDashboard />
//           ) : (
//             <Card>
//               <div className='md:flex justify-between items-center mb-6'>
//                 <h4 className='card-title'>Hot Deals Dashboard</h4>
//                 <div>
//                   <GlobalFilter
//                     filter={globalFilter}
//                     setFilter={setGlobalFilter}
//                   />
//                 </div>
//               </div>
//               <div className='overflow-x-auto -mx-6'>
//                 <div className='inline-block min-w-full align-middle'>
//                   <div className='overflow-hidden'>
//                     <table
//                       className='min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700'
//                       {...getTableProps()}
//                     >
//                       <thead className='bg-slate-200 dark:bg-slate-700'>
//                         {headerGroups.map((headerGroup) => {
//                           const { key, ...headerGroupProps } =
//                             headerGroup.getHeaderGroupProps();
//                           return (
//                             <tr
//                               key={headerGroupProps.key}
//                               {...headerGroupProps}
//                             >
//                               {headerGroup.headers.map((column) => {
//                                 const { key, ...columnProps } =
//                                   column.getHeaderProps(
//                                     column.getSortByToggleProps()
//                                   );
//                                 return (
//                                   <th
//                                     key={columnProps.key}
//                                     {...columnProps}
//                                     className='table-th'
//                                   >
//                                     {column.render('Header')}
//                                     <span>
//                                       {column.isSorted
//                                         ? column.isSortedDesc
//                                           ? ' 🔽'
//                                           : ' 🔼'
//                                         : ''}
//                                     </span>
//                                   </th>
//                                 );
//                               })}
//                             </tr>
//                           );
//                         })}
//                       </thead>
//                       <tbody
//                         className='bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700'
//                         {...getTableBodyProps()}
//                       >
//                         {page.map((row) => {
//                           prepareRow(row);
//                           const { key, ...rowProps } = row.getRowProps();
//                           return (
//                             <tr key={rowProps.key} {...rowProps}>
//                               {row.cells.map((cell) => {
//                                 const { key, ...cellProps } =
//                                   cell.getCellProps();
//                                 return (
//                                   <td
//                                     key={cellProps.key}
//                                     {...cellProps}
//                                     className='table-td'
//                                   >
//                                     {cell.render('Cell')}
//                                   </td>
//                                 );
//                               })}
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//               <div className='md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center'>
//                 <div className='flex items-center space-x-3 rtl:space-x-reverse'>
//                   <select
//                     className='form-control py-2 w-max'
//                     value={pageSize}
//                     onChange={(e) => setPageSize(Number(e.target.value))}
//                   >
//                     {[10, 25, 50].map((size) => (
//                       <option key={size} value={size}>
//                         Show {size}
//                       </option>
//                     ))}
//                   </select>
//                   <span className='text-sm font-medium text-slate-600 dark:text-slate-300'>
//                     Page{' '}
//                     <span>
//                       {pageIndex + 1} of {pageOptions.length}
//                     </span>
//                   </span>
//                 </div>
//                 <ul className='flex items-center space-x-3 rtl:space-x-reverse flex-wrap'>
//                   <li className='text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
//                     <button
//                       className={`${
//                         !canPreviousPage ? 'opacity-50 cursor-not-allowed' : ''
//                       }`}
//                       onClick={() => gotoPage(0)}
//                       disabled={!canPreviousPage}
//                     >
//                       <Icon icon='heroicons:chevron-double-left-solid' />
//                     </button>
//                   </li>
//                   <li className='text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
//                     <button
//                       className={`${
//                         !canPreviousPage ? 'opacity-50 cursor-not-allowed' : ''
//                       }`}
//                       onClick={() => previousPage()}
//                       disabled={!canPreviousPage}
//                     >
//                       Prev
//                     </button>
//                   </li>
//                   {pageOptions.map((pageIdx) => (
//                     <li key={pageIdx}>
//                       <button
//                         className={`${
//                           pageIdx === pageIndex
//                             ? 'bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium'
//                             : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal'
//                         } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
//                         onClick={() => gotoPage(pageIdx)}
//                       >
//                         {pageIdx + 1}
//                       </button>
//                     </li>
//                   ))}
//                   <li className='text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
//                     <button
//                       className={`${
//                         !canNextPage ? 'opacity-50 cursor-not-allowed' : ''
//                       }`}
//                       onClick={() => nextPage()}
//                       disabled={!canNextPage}
//                     >
//                       Next
//                     </button>
//                   </li>
//                   <li className='text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180'>
//                     <button
//                       onClick={() => gotoPage(pageCount - 1)}
//                       disabled={!canNextPage}
//                       className={`${
//                         !canNextPage ? 'opacity-50 cursor-not-allowed' : ''
//                       }`}
//                     >
//                       <Icon icon='heroicons:chevron-double-right-solid' />
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             </Card>
//           )}
//         </>
//       ) : (
//         <Card>
//           <h4 className='card-title'>Admin Dashboard</h4>
//           <p className='text-red-600'>
//             You do not have permission to access this page
//           </p>
//         </Card>
//       )}
//     </>
//   );
// };

// export default HotDeals;

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';
import HotdealsViewStartups from '@/components/HotdealsViewStartups';
import HotdealsAssignStartups from '@/components/HotdealsAssignStartups';

const HotDeals = () => {
  const [connectedInvestors, setConnectedInvestors] = useState([]);
  const [filteredInvestors, setFilteredInvestors] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const fetchConnectedInvestors = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'investor');
        if (error) throw error;

        setConnectedInvestors(data);
        setFilteredInvestors(data);

        const types = [...new Set(data.map((investor) => investor.user_type))];
        setUniqueTypes(types);
      } catch (error) {
        console.error('Error fetching connected investors:', error.message);
        setErrorMessage(
          'Failed to fetch connected investors. Please try again later.'
        );
      }
    };

    fetchConnectedInvestors();
  }, []);

  const openAssignModal = (investor) => {
    setSelectedInvestor(investor);
    setShowAssignModal(true);
  };

  const openViewModal = (investor) => {
    setSelectedInvestor(investor);
    setShowViewModal(true);
  };

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = connectedInvestors.filter((investor) => {
      return (
        investor?.name?.toLowerCase()?.includes(searchTerm) ||
        investor?.email?.toLowerCase()?.includes(searchTerm) ||
        investor?.mobile?.toLowerCase()?.includes(searchTerm)
      );
    });

    setFilteredInvestors(filtered);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);

    const filtered = connectedInvestors.filter((investor) => {
      const matchesType =
        !event.target.value || investor.user_type === event.target.value;
      const matchesSearch =
        investor.name.toLowerCase().includes(searchTerm) ||
        investor.email.toLowerCase().includes(searchTerm) ||
        investor.mobile.toLowerCase().includes(searchTerm);

      return matchesType && matchesSearch;
    });

    setFilteredInvestors(filtered);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-3xl font-bold'>Hot Deals</h1>
        <input
          type='text'
          value={searchTerm}
          onChange={handleSearch}
          placeholder='Search'
          className='py-2 px-4 rounded border border-gray-300'
          style={{ maxWidth: '300px' }}
        />
      </div>

      {errorMessage && (
        <div className='bg-red-500 text-white p-2 mb-4 rounded'>
          {errorMessage}
        </div>
      )}

      <div className='mb-4'>
        <select
          value={selectedType}
          onChange={handleTypeChange}
          className='py-2 px-4 rounded border-gray-300'
        >
          <option value=''>All Types</option>
          {uniqueTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <table className='min-w-full bg-white border border-gray-300'>
        <thead>
          <tr>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Investor Name
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Email
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Mobile
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Rank
            </th>
            <th className='py-4 px-4 border-b border-gray-300 text-left'>
              Rank Startups
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredInvestors.map((investor, index) => (
            <tr
              key={investor.id}
              className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
            >
              <td className='py-2 px-4 border-b border-gray-300'>
                {investor.name}
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                {investor.email}
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                {investor.mobile}
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                <button
                  onClick={() => openAssignModal(investor)}
                  className='py-1 px-2 bg-blue-500 text-white rounded'
                >
                  Assign Startups
                </button>
              </td>
              <td className='py-2 px-4 border-b border-gray-300'>
                <button
                  onClick={() => openViewModal(investor)}
                  className='py-1 px-2 bg-green-500 text-white rounded'
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAssignModal && (
        <HotdealsAssignStartups
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          profileId={selectedInvestor ? selectedInvestor?.id : null}
        />
      )}

      {showViewModal && (
        <HotdealsViewStartups
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          investorId={selectedInvestor ? selectedInvestor?.id : null}
        />
      )}
    </div>
  );
};

export default HotDeals;
