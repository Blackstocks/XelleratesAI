import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComingSoonModal from "@/components/ComingSoonModal";
import GetStartupInsightsModal from "@/components/GetStartupInsights"; // Adjust import as needed
import generateReport from "@/components/report/report-functions";
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
// import * as fs from 'fs';
// import * as pdf from 'html-pdf-node';



const HomeBredCurbs = ({ title, companyName, userType }) => {
  const [greeting, setGreeting] = useState("Good evening");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const toastIdRef = useRef(null);

  const { fundingInformation, companyProfile, founderInformation, businessDetails,
    companyDocuments,
    ctoInfo,
    profile,
     loading } = useCompleteUserDetails();

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    return () => {
      // Dismiss the toast when the component is unmounted
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  const handleImageClick = async (type) => {
    if (type === 'investment') {
      // if (loading) {
      //   toast.info("Loading data, please wait...");
      //   return;
      // }

      toastIdRef.current = toast.loading("Generating report, please wait...");
  
      const shortDescription = companyProfile?.short_description || "Default description";
      const industrySector = companyProfile?.industry_sector || "Default sector";
      const currentStage = companyProfile?.current_stage || "Not Available";
      const previousFunding = fundingInformation?.previous_funding || [];
      
      try{
  
      const result = await generateReport(companyProfile, fundingInformation, founderInformation, businessDetails, companyDocuments, 
        ctoInfo, profile, shortDescription, industrySector, companyName, currentStage, previousFunding);
      //generatePDF(reportHtml);
      
      if (result.status === 'error') {
        toast.update(toastIdRef.current, {
          render: `Cannot generate report: Missing documents or incorrect format: ${result.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.update(toastIdRef.current, {
          render: "Report generated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });

        try {
          const newWindow = window.open('', '_blank');
      
          if (newWindow) {
            newWindow.document.write(result.html);
            newWindow.document.close();

            newWindow.addEventListener('load', () => {
              // Load Tailwind CSS and Chart.js dynamically
              loadExternalScripts(newWindow);
          });

          } else {
            throw new Error("Popup blocked. Please allow popups for this site.");
          }
        } catch (error) {
          toast.update(toastIdRef.current, {
            render: `Cannot generate Report! ${error.message || error}`,
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      }
      } catch (error) {
        toast.update(toastIdRef.current, {
          render: `Cannot generate Report! Error: ${error.message || error}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        // console.error('Error Generating Report', error.message);
      }
    } else {
      setModalType(type);
      setIsModalOpen(true);
    }
  };

  function loadExternalScripts(win) {
    // Load Tailwind CSS
    const tailwindScript = win.document.createElement('script');
    tailwindScript.src = "https://cdn.tailwindcss.com";
    tailwindScript.onload = () => {
        console.log("Tailwind CSS loaded in new window.");
    };
    win.document.head.appendChild(tailwindScript);

    // Load Chart.js
    const chartScript = win.document.createElement('script');
    chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
    chartScript.onload = () => {
        console.log("Chart.js loaded in new window.");
    };
    win.document.head.appendChild(chartScript);
}


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  return (
<div className="flex flex-col lg:flex-row justify-between flex-wrap items-center mb-6">
      <div className="w-full lg:flex lg:space-x-4 mt-4">
        <div
          className="bg-no-repeat bg-cover bg-center shadow-lg p-5 rounded-[6px] relative flex-1 mb-4 lg:mb-0"
          style={{
            backgroundImage: `url(/assets/images/all-img/widget-bg-2.png)`,
          }}
        >
          <div>
            <h4 className="text-xl font-medium text-white mb-2">
              <span className="block font-normal">{greeting},</span>
              <span className="block">
                <h5 className="text-white">
                  <b>{companyName ? companyName : "Loading..."}</b>
                </h5>
              </span>
            </h4>
          </div>
        </div>
        <div className="p-4 rounded bg-white shadow-lg text-black flex-1 mb-4 lg:mb-0">
          <p>
            <h5>Welcome to Xellerates AI,</h5>
            I am <b>Zephyr</b>
            <span className="inline-block ml-2 animate-waving-hand">👋🏻</span>
            , your personal Investment Banker
          </p>
        </div>
        <div className="flex items-center justify-center lg:justify-end flex-1 mt-4 lg:mt-0">
  {userType === "startup" ? (
    <>
      <img
        src="/assets/images/dashboard/investment-readiness.png"
        alt="Investment Readiness"
        className="block dark:hidden w-full h-auto cursor-pointer"
        onClick={() => handleImageClick("investment")}
      />
      <img
        src="/assets/images/dashboard/investment-readinessdark.svg"
        alt="Investment Readiness Dark"
        className="hidden dark:block w-full h-auto cursor-pointer"
        onClick={() => handleImageClick("investment")}
      />
    </>
  ) : (
    <>
      <img
        src="/assets/images/dashboard/latest-insight.png"
        alt="Latest Insight"
        className="block dark:hidden w-full h-auto cursor-pointer"
        onClick={() => handleImageClick("insight")}
      />
      <img
        src="/assets/images/dashboard/latest-insightdark.svg"
        alt="Latest Insight Dark"
        className="hidden dark:block w-full h-auto cursor-pointer"
        onClick={() => handleImageClick("insight")}
      />
    </>
  )}
</div>

      </div>

      {isModalOpen && modalType === "insight" && (
        <GetStartupInsightsModal isOpen={isModalOpen} onClose={handleCloseModal} />
      )}

      <ToastContainer />

      <style jsx>{`
        @keyframes wave {
          0% {
            transform: rotate(0.0deg);
          }
          10% {
            transform: rotate(14.0deg);
          }
          20% {
            transform: rotate(-8.0deg);
          }
          30% {
            transform: rotate(14.0deg);
          }
          40% {
            transform: rotate(-4.0deg);
          }
          50% {
            transform: rotate(10.0deg);
          }
          60% {
            transform: rotate(0.0deg);
          }
          100% {
            transform: rotate(0.0deg);
          }
        }

        .animate-waving-hand {
          display: inline-block;
          animation: wave 2s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  );
};


export default HomeBredCurbs;