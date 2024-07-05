'use client';

import React from 'react';
import SendReportButton from '@/components/DownloadReportButton'; // Adjust the import path as necessary
// import { FaRobot } from 'react-icons/fa'; // Importing a chatbot icon from react-icons

const Page = () => {
  return (
    <div className='relative min-h-screen bg-gray-100 py-10'>
      <div className='container mx-auto px-6'>
        <div className='bg-white p-8 rounded-lg shadow-lg'>
          <h1 className='text-3xl font-bold text-slate-900 mb-6'>
            Startup Evaluation Report
          </h1>
          <p className='text-slate-600 mb-4'>
            Our comprehensive startup evaluation report provides detailed
            insights into the health and potential of your startup. Here are
            some of the key benefits:
          </p>
          <ul className='list-disc list-inside text-slate-600 mb-6'>
            <li>
              Accurate valuation of your startup based on market trends and
              financial performance.
            </li>
            <li>
              Detailed analysis of cash flows and financial projections for the
              next five years.
            </li>
            <li>
              Insights into the management information system (MIS) data,
              including revenue, expenses, and profit margins.
            </li>
            <li>Overview of previous funding rounds and use of funds.</li>
            <li>
              Assessment of intellectual property and compliance with legal
              regulations.
            </li>
            <li>
              Evaluation of product development stages, technology stack, and
              R&D initiatives.
            </li>
            <li>Market analysis and competitive landscape assessment.</li>
            <li>
              Profiles of founders and key team members, along with equity
              structure.
            </li>
          </ul>
          <p className='text-slate-600 mb-6'>
            By leveraging our startup evaluation report, you can attract
            potential investors, make informed strategic decisions, and plan for
            sustainable growth.
          </p>
          <div className='bg-gradient-to-r from-gray-800 to-gray-500 p-3 rounded-lg shadow-lg text-white w-full sm:w-1/2 lg:w-1/4 mx-auto flex justify-center'>
            <SendReportButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
