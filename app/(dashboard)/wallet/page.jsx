// 'use client';
// import React, { useState } from 'react';
// import dynamic from 'next/dynamic';
// import Card from '@/components/ui/Card';
// import Textinput from '@/components/ui/Textinput';
// import GroupChart5 from '@/components/partials/widget/chart/group-chart5';
// import Link from 'next/link';
// import SimpleBar from 'simplebar-react';
// import HistoryChart from '@/components/partials/widget/chart/history-chart';
// import AccountReceivable from '@/components/partials/widget/chart/account-receivable';
// import AccountPayable from '@/components/partials/widget/chart/account-payable';
// import useUserDetails from "@/hooks/useUserDetails";

// const CardSlider = dynamic(
//   () => import('@/components/partials/widget/CardSlider'),
//   {
//     ssr: false,
//   }
// );
// import TransactionsTable from '@/components/partials/table/transactions';
// import SelectMonth from '@/components/partials/SelectMonth';
// import HomeBredCurbs from '@/components/partials/HomeBredCurbs';

// const users = [
//   {
//     name: 'Ab',
//   },
//   {
//     name: 'Bc',
//   },
//   {
//     name: 'Cd',
//   },
//   {
//     name: 'Df',
//   },
//   {
//     name: 'Ab',
//   },
//   {
//     name: 'Sd',
//   },
//   {
//     name: 'Sg',
//   },
// ];

// const BankingPage = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const { user } = useUserDetails(); // Use the hook to get user details

//   return (
//     <div className='space-y-5'>
//       <HomeBredCurbs title='Wallet' />
//       <Card>
//         <div className='grid xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-5 place-content-center'>
//           <div className='flex space-x-4 h-full items-center rtl:space-x-reverse'>
//             <div className='flex-none'>
//               <div className='h-20 w-20 rounded-full'>
//                 <img
//                   src='/assets/images/all-img/main-user.png'
//                   alt=''
//                   className='w-full h-full'
//                 />
//               </div>
//             </div>
//             <div className='flex-1'>
//               <h4 className='text-xl font-medium mb-2'>
//                 <span className='block font-light'>Good evening,</span>
//                 <span className='block'>{user?.name}</span>
//               </h4>
//               <p className='text-sm dark:text-slate-300'>Welcome to Xellerates AI</p>
//             </div>
//           </div>
//           <GroupChart5 />
//         </div>
//       </Card>
//       <div className='grid grid-cols-12 gap-5'>
//         <div className='lg:col-span-4 col-span-12 space-y-5'>
//           <Card title='My card'>
//             <div className='max-w-[90%] mx-auto mt-2'>
//               <CardSlider />
//             </div>
//           </Card>
//         </div>
//         <div className='lg:col-span-8 col-span-12'>
//           <div className='space-y-5 bank-table'>
//             <TransactionsTable />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BankingPage;
import React from 'react';
import ComingSoonPage from '@/components/coming-soon/page';

const page = () => {
  return (
    <div>
      <ComingSoonPage />
    </div>
  );
};

export default page;