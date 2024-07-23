"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabaseclient';
import CardDebt from '@/components/ui/CardDebt';

const Debt = () => {
  const [showModal, setShowModal] = useState(false);
  const [panCardNumber, setPanCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [investorsPerPage] = useState(20);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user data:', error);
    } else {
      setUserEmail(user.email);
    }
  };

  const handleSignUpClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ pan_number: panCardNumber })
        .eq('email', userEmail);

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error saving PAN card number:', error.message);
        setLoading(false);
      } else {
        simulateProgress();
      }
    } catch (err) {
      console.error('Error fetching data:', err.message);
      setLoading(false);
    }
  };

  const simulateProgress = () => {
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 5;
      setProgress(progressValue);
      if (progressValue === 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
          setShowModal(false);
          setShowTable(true);
          fetchData();
        }, 1000);
      }
    }, 250); // Increment every 250ms to reach 100% in 5 seconds
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
          <h1 className="text-2xl font-bold mb-6">Debt</h1>
          {showTable ? (
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <CardDebt title="Short Term Loan">
                <div className="flex flex-col flex-1">
                  <p>Cash Credit | Overdraft | Working Capital | Supply Chain Financing Export Credit Facilities | Bill Discounting Facilities</p>
                  <p className="mt-2 flex-1">Smooth procedures, quick repayments of short-term loans. Get access to lenders and apply for short term loans. Get multiple repayment options like equated monthly/quarterly/half yearly/yearly repayments, balloon repayments and bullet repayments</p>
                  <div className="flex justify-center mt-auto">
                    <button
                      className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                      onClick={handleSignUpClick}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </CardDebt>
              <CardDebt title="Long Term Loan">
                <div className="flex flex-col flex-1">
                  <p>Term Loans | Project Finance | LAP | NCD | Lease Rent Discounting</p>
                  <p className="mt-2 flex-1">Find the right lender for your debt requirements. Raise finance using long term loans, project finance, loan against property, non-convertible debentures and lease rent discounting.</p>
                  <div className="flex justify-center mt-auto">
                    <button
                      className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                      onClick={handleSignUpClick}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </CardDebt>
              <CardDebt title="Non Fund Based Limits">
                <div className="flex flex-col flex-1">
                  <p>Letter of Credit | Bank Guarantee Facilities | Buyers' Credit</p>
                  <p className="mt-2 flex-1">Finnup is a new way to get your LCs, bank guarantee. We connect you with the best LC providers in the market to develop unique solutions for your business needs.</p>
                  <div className="flex justify-center mt-auto">
                    <button
                      className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                      onClick={handleSignUpClick}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </CardDebt>
              <CardDebt title="Alternative Financing Options">
                <div className="flex flex-col flex-1">
                  <p>Unsecured Business Loans | Personal Loans | Promoter Financing | External Commercial Borrowings</p>
                  <p className="mt-2 flex-1">Solution that is flexible, scalable and efficient. Finnup is an alternative financing platform that bridges the gap between entrepreneurs and investors. Our proprietary process enables us to understand the potential in terms of growth, financials and market dynamics, thereby enabling us to provide tailored funding partners for you.</p>
                  <div className="flex justify-center mt-auto">
                    <button
                      className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                      onClick={handleSignUpClick}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </CardDebt>
            </div>
          )}
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl z-50 p-6 max-w-md mx-auto">
            <CardDebt title="Sign Up" onClose={handleCloseModal}>
              <div className="text-center">
                <input
                  type="text"
                  placeholder="Enter PAN Card Number"
                  value={panCardNumber}
                  onChange={(e) => setPanCardNumber(e.target.value)}
                  className="w-full mb-4 p-2 border rounded text-black"
                />
                <button
                  className="bg-black text-black-500 hover:text-white hover:bg-black-500 py-2 px-4 rounded w-full"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                {loading && (
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-black-500 justify-center bg-black-500"
                        ></div>
                      </div>
                      <p className="text-center">Our AI model is analyzing your profile...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardDebt>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debt;
