"use client";

import React, { useState, useEffect } from "react";
import { CircularProgress, Modal, makeStyles, LinearProgress } from "@material-ui/core";
import { supabase } from "../../../../../lib/supabaseclient";
import Card from "@/components/ui/Card2";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
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
  const [progress, setProgress] = useState(0);

  const checkProfileCompletion = async () => {
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      console.error("Error fetching session:", error);
      setLoading(false);
      return;
    }

    const user = session.user;
    if (!user) {
      console.error("No user found in session");
      setLoading(false);
      return;
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("name, email, mobile, user_type, interest_status, role, status, linkedin_profile, company_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      const isComplete = Object.values(data).every((field) => field !== null && field !== "");
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
      .from("investor_signup")
      .select("name, email, mobile, typeof, investment_thesis, cheque_size, sectors, investment_stage, Geography");

    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setData(data);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(oldProgress + 5, 100);
        });
      }, 500);
    }
  }, [open]);

  // Get current investors
  const indexOfLastInvestor = currentPage * investorsPerPage;
  const indexOfFirstInvestor = indexOfLastInvestor - investorsPerPage;
  const currentInvestors = data.slice(indexOfFirstInvestor, indexOfLastInvestor);

  // Pagination logic
  const totalPages = Math.ceil(data.length / investorsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <img src="/path/to/your/image.jpg" alt="Card image" className="card-img-top" />
            <div className="card-body">
              <h5 className="card-title">Connect with Investors</h5>
              <h6 className="card-subtitle mb-2 text-muted">Find the right investor for your startup</h6>
              <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <a href="#" className="card-link">Learn more</a>
              <a href="#" className="card-link">Another link</a>
            </div>
          </div>
          <div className="card">
            <img src="/path/to/your/image.jpg" alt="Card image" className="card-img-top" />
            <div className="card-body">
              <h5 className="card-title">Investment Banking</h5>
              <h6 className="card-subtitle mb-2 text-muted">Get support for your financial needs</h6>
              <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <a href="#" className="card-link">Learn more</a>
              <a href="#" className="card-link">Another link</a>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => history.back()} className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded">
            Back
          </button>
        </div>
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
                        <tr key={investor.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
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
                  <div className="text-gray-600">Total Entries: {data.length}</div>
                  <nav>
                    <ul className="inline-flex items-center -space-x-px">
                      <li
                        className={`py-2 px-3 ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-blue-500"} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}
                      >
                        <a onClick={() => paginate(currentPage - 1)} href="#">
                          Prev
                        </a>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i + 1}
                          className={`py-2 px-3 ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-white text-blue-500"} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}
                        >
                          <a onClick={() => paginate(i + 1)} href="#">
                            {i + 1}
                          </a>
                        </li>
                      ))}
                      <li
                        className={`py-2 px-3 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-blue-500"} border border-gray-300 hover:bg-gray-100 hover:text-blue-500`}
                      >
                        <a onClick={() => paginate(currentPage + 1)} href="#">
                          Next
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center">
                <div className="flex space-x-4">
                  <Card title="Connect with Investors" description="Find the right investor for your startup" onClick={checkProfileCompletion} />
                  <Card title="Investment Banking" description="Get support for your financial needs" />
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
                <p id="simple-modal-description">Please complete your profile before connecting with investors.</p>
                <LinearProgress variant="determinate" value={progress} />
                <p className="text-center mt-2">Our AI model is analyzing your profile...</p>
                <button onClick={handleClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                  Close
                </button>
              </div>
            </Modal>
          </>
        )}
      </main>
    </div>
  );
};

export default Equity;
