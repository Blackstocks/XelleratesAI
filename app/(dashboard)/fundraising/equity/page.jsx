"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabaseclient';
import { CircularProgress, Modal, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Equity = () => {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [investorsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [open, setOpen] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const checkProfileCompletion = async () => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error('Error fetching session:', error);
      setLoading(false);
      return;
    }

    const user = session.user;
    if (!user) {
      console.error('No user found in session');
      setLoading(false);
      return;
    }

    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('name, email, mobile, user_type, interest_status, role, status, linkedin_profile, company_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    } else {
      const isComplete = Object.values(data).every((field) => field !== null && field !== '');
      setIsProfileComplete(isComplete);
      if (!isComplete) {
        setOpen(true);
      } else {
        fetchData();
        setShowTable(true);
      }
    }
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('investor_signup')
      .select('name, email, mobile, typeof, investment_thesis, cheque_size, sectors, investment_stage, Geography');

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Get current investors
  const indexOfLastInvestor = currentPage * investorsPerPage;
  const indexOfFirstInvestor = indexOfLastInvestor - investorsPerPage;
  const currentInvestors = data.slice(indexOfFirstInvestor, indexOfLastInvestor);

  // Pagination logic
  const totalPages = Math.ceil(data.length / investorsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPagination = () => {
    const paginationElements = [];

    paginationElements.push(
      <li key="prev" className={`py-2 px-3 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500'} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}>
        <a onClick={() => paginate(currentPage - 1)} href="#">
          Prev
        </a>
      </li>
    );

    if (currentPage > 2) {
      paginationElements.push(
        <li key={1} className={`py-2 px-3 ${currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}>
          <a onClick={() => paginate(1)} href="#">
            1
          </a>
        </li>
      );
      if (currentPage > 3) {
        paginationElements.push(
          <li key="dots1" className="py-2 px-3 border border-gray-300 bg-white text-gray-500">
            ...
          </li>
        );
      }
    }

    paginationElements.push(
      <li key={currentPage - 1} className={`py-2 px-3 ${currentPage === currentPage - 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}>
        <a onClick={() => paginate(currentPage - 1)} href="#">
          {currentPage - 1}
        </a>
      </li>
    );

    paginationElements.push(
      <li key={currentPage} className={`py-2 px-3 ${'bg-blue-500 text-white'} border border-gray-300`}>
        {currentPage}
      </li>
    );

    paginationElements.push(
      <li key={currentPage + 1} className={`py-2 px-3 ${currentPage === currentPage + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}>
        <a onClick={() => paginate(currentPage + 1)} href="#">
          {currentPage + 1}
        </a>
      </li>
    );

    if (currentPage < totalPages - 1) {
      if (currentPage < totalPages - 2) {
        paginationElements.push(
          <li key="dots2" className="py-2 px-3 border border-gray-300 bg-white text-gray-500">
            ...
          </li>
        );
      }
      paginationElements.push(
        <li key={totalPages} className={`py-2 px-3 ${currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}>
          <a onClick={() => paginate(totalPages)} href="#">
            {totalPages}
          </a>
        </li>
      );
    }

    paginationElements.push(
      <li key="next" className={`py-2 px-3 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500'} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}>
        <a onClick={() => paginate(currentPage + 1)} href="#">
          Next
        </a>
      </li>
    );

    return paginationElements;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-gray-200 text-black p-4 flex-shrink-0">
        <nav className="mt-10 space-y-4">
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
      <div className="border-r-2 border-gray-300 flex-shrink-0"></div>
      <main className="flex-1 p-8 overflow-x-auto">
        <div className="text-center">
          <img src="/assets/images/auth/logo1.svg" alt="Company Logo" className="mx-auto mb-0 h-20 w-43" />
          <h1 className="text-2xl font-bold mb-6">Equity</h1>
          {loading ? (
            <div className="flex justify-center items-center">
              <CircularProgress />
            </div>
          ) : (
            <>
              {showTable ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b border-gray-300">Investor</th>
                          <th className="py-2 px-4 border-b border-gray-300">Sectors</th>
                          <th className="py-2 px-4 border-b border-gray-300">Investment Stages</th>
                          <th className="py-2 px-4 border-b border-gray-300">Geography</th>
                          <th className="py-2 px-4 border-b border-gray-300">Investment Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentInvestors.map((investor, index) => (
                          <tr key={investor.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                            <td className="border px-4 py-2">{investor.name}</td>
                            <td className="border px-4 py-2">{investor.sectors}</td>
                            <td className="border px-4 py-2">{investor.investment_stage}</td>
                            <td className="border px-4 py-2">{investor.Geography}</td>
                            <td className="border px-4 py-2">{investor.cheque_size}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div className="text-gray-600">
                      Total Entries: {data.length}
                    </div>
                    <nav>
                      <ul className="inline-flex items-center -space-x-px">
                        {renderPagination()}
                      </ul>
                    </nav>
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center">
                  <div className="flex space-x-4">
                    <div className="p-4 bg-white border rounded shadow cursor-pointer" onClick={checkProfileCompletion}>
                      <h2 className="text-xl font-bold">Connect with Investor</h2>
                      <p>Find the right investor for your startup</p>
                    </div>
                    <div className="p-4 bg-white border rounded shadow cursor-pointer">
                      <h2 className="text-xl font-bold">Investment Banking</h2>
                      <p>Get support for your financial needs</p>
                    </div>
                  </div>
                </div>
              )}
              <Modal
                open={open}
                onClose={handleClose}
                className={classes.modal}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
              >
                <div className={classes.paper}>
                  <h2 id="simple-modal-title">Complete Your Profile</h2>
                  <p id="simple-modal-description">
                    Please complete your profile before connecting with investors.
                  </p>
                  <button onClick={handleClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                    Close
                  </button>
                </div>
              </Modal>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Equity;
