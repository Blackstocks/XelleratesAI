'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
} from 'react-table';
import Card from '@/components/ui/Card';
import GlobalFilter from '@/components/GlobalFilter';
import Loading from '@/app/loading';
import Link from 'next/link';

const InvestorWallet = () => {
    
  const [loading, setLoading] = useState(true);
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <h1>
        Hello from Investor wallet!!
    </h1>
  );
};

export default InvestorWallet;
