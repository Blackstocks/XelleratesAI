"use client";

import React from 'react';
import Link from 'next/link';
import { InvestorsCard, InvestmentCard, GeographicsCard, TransactionsCard } from '@/components/ui/Card';

const Fundraising = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-gray-200 text-black">
        <nav className="mt-10">
          <ul>
            <li className="px-4 py-2 hover:bg-black hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising">Fundraising</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/equity">Equity</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/debt">Debt</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/merger-and-acquisition">Merger and Acquisition</Link>
            </li>
            <li className="px-4 py-2 hover:bg-black hover:text-white hover:bg-black-500 cursor-pointer">
              <Link href="/fundraising/secondary-share">Secondary Share</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="border-r-2 border-gray-300"></div>
      <main className="flex-1 p-8">
        <div className="text-center">
          <img src="/assets/images/auth/logo1.svg" alt="Company Logo" className="mx-auto mb-0 h-20 w-43" />
          <h1 className="text-2xl font-bold mb-6">Fundraising</h1><br></br><br></br>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InvestorsCard />
            <InvestmentCard />
            <GeographicsCard />
            <TransactionsCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fundraising;
