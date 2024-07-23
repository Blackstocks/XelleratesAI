import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const HomeBredCurbs = ({ title, companyName, userType }) => {
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11),
  });

  const handleValueChange = (newValue) => {
    setValue(newValue);
  };

  const handleDownloadReport = () => {
    toast.success("Your investment readiness report has been successfully sent to your email.");
  };

  return (
    <div className="flex justify-between flex-wrap items-center mb-6">
      <div className="flex w-full space-x-4 mt-4">
        <div className="p-4 rounded bg-gradient-to-r from-blue-900 to-blue-500 text-white" style={{ flex: '0 0 25%' }}>
          <p>Good morning,<br /> {companyName ? companyName : 'Loading...'}</p>
        </div>
        <div className="p-4 rounded bg-gradient-to-r from-blue-900 to-blue-500 text-white flex-1">
          <p>Welcome to Xellerates AI,<br />I am Zephyr, your personal Investment Banker</p>
        </div>
        <div className="flex items-center justify-end flex-1">
          {userType === "startup" ? (
            <button
              className="bg-blue-700 text-white py-2 px-4 rounded ml-auto"
              onClick={handleDownloadReport}
            >
              Download Investment Readiness Report
            </button>
          ) : (
            <a
              href="https://www.instagram.com"
              className="bg-blue-700 text-white py-2 px-4 rounded ml-auto"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Latest Insight on Startup
            </a>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default HomeBredCurbs;
