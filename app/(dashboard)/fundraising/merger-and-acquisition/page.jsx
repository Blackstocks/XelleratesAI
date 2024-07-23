import React from 'react';
import Link from 'next/link';
import ComingSoonPage from '@/components/coming-soon/page';

const MergerAndAcquisition = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-gray-200 text-black">
        <nav className="mt-10">
          <ul>
            <li className="px-4 py-2 hover:bg-black hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising">Fundraising</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black  hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/equity">Equity</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black  hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/debt">Debt</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black  hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/merger-and-acquisition">Merger and Acquisition</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black  hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/secondary-share">Secondary Share</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="border-r-2 border-gray-300"></div>
      <ComingSoonPage />
    </div>
  );
};

export default MergerAndAcquisition;
