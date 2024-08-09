'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseclient';
import useUserDetails from '@/hooks/useUserDetails';
import { useTable, useSortBy, useExpanded } from 'react-table';
import Loading from '@/components/Loading';
import Card from '@/components/ui/Card';
import RecentOrderTable2 from "@/components/partials/table/recent-Order-table2";
import GroupChart3 from '@/components/partials/widget/chart/group-chart-3';
import GroupChartNew3 from '@/components/partials/widget/chart/group-chart-new3';
import Calculation from '@/components/partials/widget/chart/Calculation';
import Customer from '@/components/partials/widget/customer';
import HomeBredCurbs from '@/components/partials/HomeBredCurbs';
import Chatbot from '@/components/chatbot';

//
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';


// const {
//   companyProfile,
//   businessDetails,
//   founderInformation,
//   fundingInformation,
//   ctoInfo,
//   companyDocuments,
// } = useCompleteUserDetails();


//
// const financials = [
//   { name: 'Financials', value: '' },
//   { name: 'Revenue', value: '$120,000' },
//   { name: 'Expenses', value: '$70,000' },
//   { name: 'Profit/Loss', value: '$50,000' },
// ];


const Portfolios = [
  { name: 'Portfolio Name', value: '' },
  { name: 'Xellerates', value: '' },
  { name: 'Conqr', value: '' },
  { name: 'Adios', value: '' },
];

const data = [
  {
    name: "Founder",
    shareHolding: "53.5%",
    totalShares: "76,740,000",
    subRows: [
      {
        name: "Sameer Mehta",
        shareHolding: "26.8%",
        totalShares: "38,370,000",
      },
      {
        name: "Aman Gupta",
        shareHolding: "26.8%",
        totalShares: "38,370,000",
      },
    ],
  },
  {
    name: "Fund",
    shareHolding: "45.5%",
    totalShares: "65,269,291",
    subRows: [
      {
        name: "Warburg Pincus",
        shareHolding: "38.3%",
        totalShares: "54,850,232",
      },
      {
        name: "Fireside Ventures",
        shareHolding: "3.6%",
        totalShares: "5,100,000",
      },
      {
        name: "Qualcomm Ventures",
        shareHolding: "2.5%",
        totalShares: "3,524,000",
      },
      {
        name: "Malabar Investments",
        shareHolding: "0.9%",
        totalShares: "1,331,559",
      },
      {
        name: "Innowen Capital",
        shareHolding: "0.3%",
        totalShares: "463,500",
      },
    ],
  },
  {
    name: "Enterprise",
    shareHolding: "-",
    totalShares: "-",
    subRows: [
      { name: "Neo Markets Services", shareHolding: "-", totalShares: "6,370" },
      { name: "Amplify Capitals", shareHolding: "-", totalShares: "5,020" },
      { name: "Altius Investech", shareHolding: "-", totalShares: "1,200" },
      { name: "3ADeal", shareHolding: "-", totalShares: "50" },
    ],
  },
  {
    name: "Other People",
    shareHolding: "0.2%",
    totalShares: "363,000",
  },
  {
    name: "ESOP",
    shareHolding: "0.7%",
    totalShares: "1,005,200",
  },
  {
    name: "Other Investors",
    shareHolding: "< 0.1%",
    totalShares: "13,430",
  },
  {
    name: "Total",
    shareHolding: "100.0%",
    totalShares: "143,397,291",
  },
];

const COLUMNS = [
  {
    Header: "Name",
    accessor: "name",
    Cell: ({ row, value }) => (
      <div className="flex items-center">
        {row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps()}
            className="mr-2 cursor-pointer"
          >
            {row.isExpanded ? "▼" : "▶"}
          </span>
        ) : null}
        {value}
      </div>
    ),
  },
  {
    Header: "% Share holding",
    accessor: "shareHolding",
  },
  {
    Header: "Total Outstanding Shares",
    accessor: "totalShares",
  },
];

const RecentOrderTable = () => {
  const columns = useMemo(() => COLUMNS, []);
  const dataMemo = useMemo(() => data, []);

  const tableInstance = useTable(
    {
      columns,
      data: dataMemo,
    },
    useSortBy,
    useExpanded
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div className="overflow-x-auto">
      <table {...getTableProps()} className="min-w-full bg-white divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " ▼"
                        : " ▲"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {rows.map((row) => {
            prepareRow(row);
            return (
              <React.Fragment key={row.id}>
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
                {row.isExpanded && row.subRows && row.subRows.length > 0 ? (
                  row.subRows.map((subRow, i) => {
                    prepareRow(subRow);
                    return (
                      <tr key={subRow.id} {...subRow.getRowProps()}>
                        {subRow.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10"
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const { user, details, loading } = useUserDetails();
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
  //
  const [financials, setFinancials] = useState([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching company name:', error);
        } else {
          setCompanyName(data.company_name);
        }
      }
    };

    fetchCompanyName();
  }, [user]);

  //
  const { companyDocuments } = useCompleteUserDetails();

  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [financialData, setFinancialData] = useState({});

  const fetchFinancials = async () => {
    try {
      setLoadingFinancials(true);
      console.log('Company Name:', companyName);
  
      // Fetch company ID from Supabase
      const { data: companyData, error: companyError } = await supabase
        .from('company_profile')
        .select('id')
        .eq('company_name', companyName)
        .single();
  
      if (companyError || !companyData) {
        throw new Error('Failed to fetch company ID');
      }
  
      const company_id = companyData.id;
      console.log('Company ID:', company_id);
  
      if (!company_id) {
        throw new Error('Company ID is not available');
      }
  
      // API request to extract financial data
      const response = await fetch('/api/apiDataExtraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id }),
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        console.error('Response status text:', response.statusText);
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Financial Data:', data);
  
      // Update financialData state
      setFinancialData(data);
    } catch (error) {
      console.error('Error fetching financial data:', error.message);
    } finally {
      setLoadingFinancials(false);
    }
  };
  
  
  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
  };

  const handleUnlockClick = (cardName) => {
    if (cardName === 'currentNumbers') {
      fetchFinancials(); // Fetch financials only for 'currentNumbers'
    }
    setUnlockedCards((prevState) => ({ ...prevState, [cardName]: true }));
  };


  const monthNames = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December"
  };
  


  const renderFinancialData = () => {
    // Extract data for the selected quarter
    const revenueData = financialData.revenue?.[selectedQuarter] || [];
    const expenseData = financialData.expense?.[selectedQuarter] || [];
    const profitData = financialData.profit?.[selectedQuarter] || [];

    console.log("Revenue Data:", revenueData);
    console.log("Expense Data:", expenseData);
    console.log("Profit Data:", profitData);
    
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




  // const renderFinancialData = () => {

  //   const revenueData = financialData.revenue?.[selectedQuarter] || [];
  //   const expenseData = financialData.expense?.[selectedQuarter] || [];
  //   const profitData = financialData.profit?.[selectedQuarter] || [];
  
    
  
  //   return (
  //     <ul className='divide-y divide-slate-100 dark:divide-slate-700'>
  //       {['revenue', 'expense', 'profit'].map((type) => {
  //         let typeData = [];
  //         if (type === 'revenue') {
  //           typeData = revenueData;
  //         } else if (type === 'expense') {
  //           typeData = expenseData;
  //         } else if (type === 'profit') {
  //           typeData = profitData;
  //         }
  
  //         // Handle yearly data
  //         if (selectedQuarter === 'yearly') {
  //           typeData = typeData.yearly || [];
  //         } else {
  //           typeData = typeData[selectedQuarter] || [];
  //         }
  
  //         return (
  //           <li key={type} className='py-2'>
  //             <div className='text-lg font-semibold capitalize'>{type}</div>
  //             {typeData.length > 0 ? (
  //               typeData.map((item, i) => (
  //                 <div key={i} className='flex justify-between'>
  //                   <span>{monthNames[item.month] || `Month ${item.month}`}</span>
  //                   <span>{item.value}</span>
  //                 </div>
  //               ))
  //             ) : (
  //               <div>No {type} data available for this quarter</div>
  //             )}
  //           </li>
  //         );
  //       })}
  //     </ul>
  //   );
  // };
  
  
  
  
  

  //

  

  const handleCheckboxChange = (e) => {
    setIsTableViewChecked(e.target.checked);
    setIsModalOpen(e.target.checked);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsTableViewChecked(false);
  };

  const renderLockedCard = (title, content, cardName) => (
    <Card>
      <div className='relative'>
        {!unlockedCards[cardName] && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10 text-xl font-semibold text-slate-700 bg-opacity-50'>
            <span>Unlock through credits</span>
            <button
              onClick={() => handleUnlockClick(cardName)}
              className='mt-2 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700'
            >
              Unlock
            </button>
          </div>
        )}
        <div className={`${unlockedCards[cardName] ? '' : 'blur'}`}>
          {content}
        </div>
      </div>
    </Card>
  );

  if (loading) {
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
              <div className='grid grid-cols-12 gap-5'>
                <div className='lg:col-span-8 col-span-12 space-y-5'>
                  <Card>
                    <div className='grid grid-cols-3 gap-4'>
                      <GroupChart3 />
                    </div>
                  </Card>
                  {renderLockedCard(
                    'Top Conversations',
                    <div className='xl:col-span-6 col-span-12'>
                      <RecentOrderTable2 />
                    </div>,
                    'topConversations'
                  )}
                </div>
                <div className='lg:col-span-4 col-span-12 space-y-5'>

                {renderLockedCard(
  'Current Numbers',
  <div>
    <div className='flex justify-between items-center mb-4'>
      <span>Select Time Frame:</span>
      <select
        value={selectedQuarter}
        onChange={handleQuarterChange}
        className='border p-2 rounded'
      >
        {["Q1", "Q2", "Q3", "Q4", "Yearly"].map((quarter) => (
          <option key={quarter} value={quarter}>
            {quarter}
          </option>
        ))}
      </select>
    </div>
    {loadingFinancials ? (
      <div className='py-4 text-center'>Loading...</div>
    ) : (
      renderFinancialData()
    )}
  </div>,
  'currentNumbers'
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
                    'capTable'
                  )}
                </div>
              </div>
              <Chatbot />
            </div>
          </div>
        )}
        {user?.user_type === 'investor' && (
          <div>
            <div>
              <HomeBredCurbs
                title='Crm'
                companyName={companyName}
                userType={user.user_type}
              />
              <div className='space-y-5'>
                <div className='grid grid-cols-12 gap-5'>
                  <div className='lg:col-span-8 col-span-12 space-y-5'>
                    <Card>
                      <div className='grid grid-cols-4 gap-4'>
                        <GroupChartNew3 />
                      </div>
                    </Card>
                    {renderLockedCard(
                      'Top Conversations',
                      <div className='xl:col-span-6 col-span-12'>
                        <RecentOrderTable2 />
                      </div>,
                      'topConversations'
                    )}
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
                      'topPerformingPortfolios'
                    )}
                    {renderLockedCard('Hot Deals', <Customer />, 'hotDeals')}
                  </div>
                </div>
                <Chatbot />
              </div>
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
          <div className='bg-white rounded-lg shadow-lg overflow-hidden w-1/2 h-3/4'>
            <div className='p-4 flex justify-end'>
              <button
                className='text-gray-500 hover:text-gray-700'
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            <div className='p-4 overflow-y-auto h-full'>
              <h2 className='text-xl font-semibold mb-4'>Cap Table (Table View)</h2>
              <RecentOrderTable />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
