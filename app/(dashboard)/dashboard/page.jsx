'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';
import { useTable, useSortBy, useExpanded } from 'react-table';
import Loading from '@/app/loading';
import Card from '@/components/ui/Card';
import RecentOrderTable2 from '@/components/partials/table/recent-Order-table2';
import GroupChart3 from '@/components/partials/widget/chart/group-chart-3';
import GroupChartNew3 from '@/components/partials/widget/chart/group-chart-new3';
import Calculation from '@/components/partials/widget/chart/Calculation';
import Customer from '@/components/partials/widget/customer';
import HomeBredCurbs from '@/components/partials/HomeBredCurbs';
import Chatbot from '@/components/chatbot';
import { toast } from 'react-toastify';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';

const Portfolios = [
  { name: 'Portfolio Name', value: '' },
  // { name: 'Xellerates', value: '' },
  // { name: 'Conqr', value: '' },
  // { name: 'Adios', value: '' },
];

const RecentOrderTable = () => {
  const { fundingInformation, loading: completeUserDetailsLoading } =
    useCompleteUserDetails();

  const data = useMemo(
    () => fundingInformation?.cap_table || [],
    [fundingInformation]
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Designation',
        accessor: 'designation',
        Cell: ({ row, value }) => (
          <div className='flex items-center'>
            {row.canExpand ? (
              <span
                {...row.getToggleRowExpandedProps()}
                className='mr-2 cursor-pointer'
              >
                {row.isExpanded ? '▼' : '▶'}
              </span>
            ) : null}
            {value}
          </div>
        ),
      },
      {
        Header: 'First Name',
        accessor: 'firstName',
      },
      {
        Header: '% Shareholding',
        accessor: 'percentage',
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useExpanded
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  if (completeUserDetailsLoading) {
    return (
      <div className='overflow-x-auto'>
        <table
          {...getTableProps()}
          className='min-w-full bg-white divide-y divide-gray-200 animate-pulse'
        >
          <thead className='bg-gray-50'>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  >
                    <div className='h-4 bg-gray-200 rounded'></div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            {...getTableBodyProps()}
            className='bg-white divide-y divide-gray-200'
          >
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                  >
                    <div className='h-4 bg-gray-200 rounded'></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table
        {...getTableProps()}
        className='min-w-full bg-white divide-y divide-gray-200'
      >
        <thead className='bg-gray-50'>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' ▼' : ' ▲') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          {...getTableBodyProps()}
          className='bg-white divide-y divide-gray-200'
        >
          {rows.map((row) => {
            prepareRow(row);
            return (
              <React.Fragment key={row.id}>
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
                {row.isExpanded && row.subRows && row.subRows.length > 0
                  ? row.subRows.map((subRow) => {
                      prepareRow(subRow);
                      return (
                        <tr key={subRow.id} {...subRow.getRowProps()}>
                          {subRow.cells.map((cell) => (
                            <td
                              {...cell.getCellProps()}
                              className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10'
                            >
                              {cell.render('Cell')}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const { user, loading } = useUserDetails();
  const [companyName, setCompanyName] = useState('');
  const [unlockedCards, setUnlockedCards] = useState({
    topConversations: false,
    currentNumbers: false,
    capTable: false,
    topPerformingPortfolios: false,
    hotDeals: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTableViewChecked, setIsTableViewChecked] = useState(false);
  const [financialData, setFinancialData] = useState({});
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const {
    companyProfile,
    companyDocuments,
    loading: completeUserDetailsLoading,
  } = useCompleteUserDetails();
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const toastIdRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return; // Exit if user is not available

        // Retrieve unlocked cards from local storage if available
        const savedUnlockedCards = localStorage.getItem('unlockedCards');
        if (savedUnlockedCards) {
          const parsedUnlockedCards = JSON.parse(savedUnlockedCards);
          setUnlockedCards(parsedUnlockedCards);

          // Fetch financial data if 'currentNumbers' card is unlocked
          if (parsedUnlockedCards.currentNumbers && companyProfile) {
            await fetchFinancials(); // Fetch financial data if needed
          }
        } else {
          // If no local storage data, fetch the card unlock status from the database
          const { data: unlockData, error: unlockError } = await supabase
            .from('card_unlocks')
            .select('*')
            .eq('startup_id', user?.id)
            .single();

          if (unlockError) {
            console.error('Error fetching card unlock status:', unlockError);
          } else if (unlockData) {
            const unlockedStatus = {
              topConversations: unlockData.top_conversations, 
              currentNumbers: unlockData.current_numbers,
              capTable: unlockData.cap_table,
              topPerformingPortfolios: unlockData.top_performing_portfolios,
              hotDeals: unlockData.hot_deals,
            };
            setUnlockedCards(unlockedStatus);
            // Save to local storage
            localStorage.setItem('unlockedCards', JSON.stringify(unlockedStatus));

            // Fetch financial data if 'currentNumbers' card is unlocked
            if (unlockedStatus.currentNumbers && companyProfile) {
              await fetchFinancials();
            }
          }
        }

        // Fetch company name
        const { data: companyData, error: companyError } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', user?.id)
          .single();

        if (companyError) {
          console.error('Error fetching company name:', companyError);
        } else {
          setCompanyName(companyData.company_name);
        }

        setIsDataFetched(true); // Indicate that data fetching is complete
      } catch (error) {
        console.error('An unexpected error occurred:', error.message);
        toast.error('An unexpected error occurred while fetching data.');
      }
    };

    fetchData();
  }, [user, companyProfile]);

  const fetchFinancials = async () => {
    if (!companyProfile) {
      console.warn('Company profile is not available yet.');
      return;
    }

    try {
      setLoadingFinancials(true);
      if (!toast.isActive(toastIdRef.current)) {
        toastIdRef.current = toast.loading('Loading financial data...');
      }

      const company_id = companyProfile?.id;
      if (!companyDocuments?.mis) {
        toast.warn('Please upload MIS Report to see Financial Data');
      } else if (!companyDocuments.mis.endsWith('.xlsx')) {
        toast.warn('Please upload MIS Report in correct format to see Financial Data');
      } else {
        const response = await fetch('/api/apiDataExtraction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error:', errorData.error);
          toast.error(errorData.error || 'Failed to load financial data');
          return;
        }

        const data = await response.json();
        setFinancialData(data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error.message);
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingFinancials(false);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    }
  };



  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
  };



  const handleUnlockClick = async (cardName, user) => {
    if (user?.user_type === 'startup') {
      if (!user || completeUserDetailsLoading || !companyProfile) {
        toast.error('Please wait, loading data...');
        return;
      }
    }
    
  
    // Map card names to the correct database column names
    const cardNameMapping = {
      topConversations: 'top_conversations',
      currentNumbers: 'current_numbers',
      capTable: 'cap_table',
      topPerformingPortfolios: 'top_performing_portfolios',
      hotDeals: 'hot_deals',
    };
  
    const dbColumnName = cardNameMapping[cardName]; // Use the mapping to get the correct column name
  
    if (!dbColumnName) {
      console.error('Invalid card name:', cardName);
      toast.error('Invalid card name.');
      return;
    }
  
    try {
      // Fetch current wallet credits

      const updatedUnlockStatus = { ...unlockedCards, [cardName]: true };
      setUnlockedCards(updatedUnlockStatus);
      localStorage.setItem('unlockedCards', JSON.stringify(updatedUnlockStatus));

      
      const { data: walletCredits, error: creditError } = await supabase
        .from('wallet_credits')
        .select('*')
        .eq('startup_id', user?.id)
        .single();
  
      if (creditError) {
        console.error('Error fetching credits:', creditError);
        //toast.error('Failed to fetch wallet credits.');
        return;
      }
  
      let currentCredits = walletCredits?.credit_balance || 0;
  
      // Fetch unlock status for the startup
      const { data: unlockData, error: unlockError } = await supabase
        .from('card_unlocks')
        .select('*')
        .eq('startup_id', user?.id)
        .single();
  
      if (unlockError && unlockError.code !== 'PGRST116' && user?.user_type === 'startup') {
        console.error('Error fetching card unlock status:', unlockError);
        toast.error('Failed to fetch card unlock status.');
        return;
      }
  
      // Initialize unlock data if no entry exists
      let updatedUnlockData;
      if (!unlockData) {
        updatedUnlockData = {
          startup_id: user?.id,
          top_conversations: false,
          current_numbers: false,
          cap_table: false,
          top_performing_portfolios: true,
          hot_deals: true,
        };
  
        // Insert a new entry for this startup with default values
        const { error: insertError } = await supabase
          .from('card_unlocks')
          .insert([updatedUnlockData]);
  
        if (insertError) {
          console.error('Error initializing card unlock status:', insertError);
          toast.error('Failed to initialize card unlock status.');
          return;
        }
      } else {
        updatedUnlockData = unlockData;
      }
  
      // Check if the card is already unlocked
      if (updatedUnlockData[dbColumnName]) {
        toast.info('this feature is already unlocked.');
        setUnlockedCards((prevState) => ({ ...prevState, [cardName]: true }));
        return;
      }
  
      // If the card is not unlocked, deduct 1 credit and update the unlock status
      if (currentCredits >= 1) {
        const { error: updateError } = await supabase
          .from('wallet_credits')
          .update({ credit_balance: currentCredits - 1 })
          .eq('startup_id', user?.id);
  
        if (updateError) {
          console.error('Error deducting credits:', updateError);
          toast.error('Failed to deduct credits.');
          return;
        }
  
        // Update the unlock status for the card in the database
        updatedUnlockData[dbColumnName] = true;
        updatedUnlockData.created_at = new Date();
  
        const { error: updateError1 } = await supabase
          .from('card_unlocks')
          .update(updatedUnlockData)
          .eq('startup_id', user?.id);

        if (updateError1) {
          console.error('Error updating unlock status:', updateError1);
          toast.error('Failed to update unlock status.');
          return;
        }
          
        toast.success('1 credit has been deducted to unlock this feature.');
      } else {
        toast.error('Not enough credits to unlock this feature.');
        return;
      }
  
      if (cardName === 'currentNumbers') {
        await fetchFinancials();
      }
  
      setUnlockedCards((prevState) => ({ ...prevState, [cardName]: true }));
    } catch (error) {
      console.error('Error in handleUnlockClick:', error.message);
      toast.error('An unexpected error occurred while unlocking the card.');
    }
  };
  

  
  



  const monthNames = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  };

  const renderFinancialData = () => {
    // Extract data for the selected quarter
    const revenueData = financialData.revenue?.[selectedQuarter] || [];
    const expenseData = financialData.expense?.[selectedQuarter] || [];
    const profitData = financialData.profit?.[selectedQuarter] || [];

    // console.log('Revenue Data:', revenueData);
    // console.log('Expense Data:', expenseData);
    // console.log('Profit Data:', profitData);

    return (
      <ul className='divide-y divide-slate-100 dark:divide-slate-700'>
        {['revenue', 'expense', 'profit'].map((type) => {
          let typeData = [];
          if (type === 'revenue') {
            typeData = revenueData;
          } else if (type === 'expense') {
            typeData = expenseData;
          } else if (type === 'profit') {
            typeData = profitData;
          }
          return (
            <li key={type} className='py-2'>
              <div className='text-lg font-semibold capitalize'>{type}</div>
              {typeData.length > 0 ? (
                typeData.map((item, i) => (
                  <div key={i} className='flex justify-between'>
                    <span>{monthNames[item.month] || `${item.month}`}</span>
                    <span>{item.value}</span>
                  </div>
                ))
              ) : (
                <div>No {type} data available for this quarter</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const handleCheckboxChange = (e) => {
    setIsTableViewChecked(e.target.checked);
    setIsModalOpen(e.target.checked);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsTableViewChecked(false);
  };

  const renderLockedCard = (title, content, cardName, user) => (
    <Card>
      <div className='relative'>
        {!unlockedCards[cardName] && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10 text-xl font-semibold text-slate-700 bg-opacity-50'>
            {user?.user_type === 'startup' ? (
              <div>
                {isDataFetched && !companyProfile ? (
                  <span style={{ textAlign: 'center' }}>
                    Please fill startup profile to unlock this feature
                  </span>
                ) : (
                  <>
                    {/* <span>Unlock through credits</span> */}
                    <button
                      onClick={() => handleUnlockClick(cardName, user)}
                      className='mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'
                    >
                      Unlock
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                {/* <span>Unlock through credits</span> */}
                <button
                  onClick={() => handleUnlockClick(cardName)}
                  className='mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'
                >
                  Unlock
                </button>
              </div>
            )}
          </div>
        )}
        <div className={`${unlockedCards[cardName] ? '' : 'blur'}`}>
          {content}
        </div>
      </div>
    </Card>
  );

  if (loading || completeUserDetailsLoading) {
    return <Loading />;
  }

  return (
    <div className='w-full'>
      <div className={`${isModalOpen ? 'blur-background' : ''}`}>
        {user?.user_type === 'startup' && (
          <div>
            <HomeBredCurbs
              title='Crm'
              companyName={companyName}
              userType={user.user_type}
            />
            <div className='space-y-5'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
                <div className='lg:col-span-8 col-span-12 space-y-5'>
                  <Card>
                    <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4'>
                      <GroupChart3
                        startupId={companyProfile?.id}
                        userId={user?.id}
                      />
                    </div>
                  </Card>
                  {renderLockedCard(
                    'Top Conversations',
                    <div className='col-span-12'>
                      <RecentOrderTable2
                        companyProfileId={companyProfile?.id}
                        userId={user?.id}
                        userType={user?.user_type}
                      />
                    </div>,
                    'topConversations',
                    user
                  )}
                </div>
                <div className='lg:col-span-4 col-span-12 space-y-5'>
                  {renderLockedCard(
                    'Current Numbers',
                    <div>
                      <div className='flex flex-col md:flex-row justify-between items-center mb-4'>
                        <span>Select Time Frame:</span>
                        <select
                          value={selectedQuarter}
                          onChange={handleQuarterChange}
                          className='border p-2 rounded mt-2 md:mt-0'
                        >
                          {['Q1', 'Q2', 'Q3', 'Q4', 'Yearly'].map((quarter) => (
                            <option key={quarter} value={quarter}>
                              {quarter}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        {loadingFinancials ? (
                          <div className='py-4 text-center'>
                            Loading financial data...
                          </div>
                        ) : (
                          renderFinancialData()
                        )}
                      </div>
                    </div>,
                    'currentNumbers',
                    user
                  )}

                  {renderLockedCard(
                    'Cap Table',
                    <div>
                      <div className='flex justify-between items-center'>
                        <div className='text-lg font-semibold'>Cap Table</div>
                        <label className='flex items-center'>
                          <input
                            type='checkbox'
                            className='form-checkbox'
                            checked={isTableViewChecked}
                            onChange={handleCheckboxChange}
                          />
                          <span className='ml-2'>Table View</span>
                        </label>
                      </div>
                      <div className='legend-ring3'>
                        <Calculation />
                      </div>
                    </div>,
                    'capTable',
                    user
                  )}
                </div>
              </div>
              <Chatbot />
            </div>
          </div>
        )}
        {user?.user_type === 'investor' && (
          <div>
            <HomeBredCurbs
              title='Crm'
              companyName={companyName}
              userType={user.user_type}
            />
            <div className='space-y-5'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
                <div className='lg:col-span-8 col-span-12 space-y-5'>
                  <Card>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                      <GroupChartNew3 user={user} />
                    </div>
                  </Card>
                </div>
                <div className='lg:col-span-4 col-span-12 space-y-5'>
                  {renderLockedCard(
                    'Top Performing Portfolios',
                    <ul className='divide-y divide-slate-100 dark:divide-slate-700'>
                      {Portfolios.map((item, i) => (
                        <li
                          key={i}
                          className='first:text-xs text-sm first:text-slate-600 text-slate-600 dark:text-slate-300 py-2 first:uppercase'
                        >
                          <div className='flex justify-between'>
                            <span>{item.name}</span>
                            <span>{item.value}</span>
                          </div>
                        </li>
                      ))}
                    </ul>,
                    'topPerformingPortfolios',
                    user
                  )}
                </div>
              </div>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-5'>
                <div className='lg:col-span-8 col-span-12 space-y-5'>
                  {renderLockedCard(
                    'Top Conversations',
                    <div className='col-span-12'>
                      <RecentOrderTable2
                        startupId={companyProfile?.id}
                        userId={user?.id}
                        userType={user?.user_type}
                      />
                    </div>,
                    'topConversations',
                    user
                  )}
                </div>
                <div className='lg:col-span-4 col-span-12 space-y-5'>
                  {renderLockedCard(
                    'Hot Deals',
                    <div>
                      <Customer investorId={user?.id} />
                    </div>,
                    'hotDeals',
                    user
                  )}
                </div>
              </div>
              <Chatbot />
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .blur {
          filter: blur(8px);
        }
        .blur-background {
          filter: blur(8px);
        }
      `}</style>

      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-lg overflow-hidden w-full md:w-3/4 lg:w-1/2 h-3/4'>
            <div className='p-4 flex justify-end'>
              <button
                className='text-gray-500 hover:text-gray-700'
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            <div className='p-4 overflow-y-auto h-full'>
              <h2 className='text-xl font-semibold mb-4'>
                Cap Table (Table View)
              </h2>
              <RecentOrderTable />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
