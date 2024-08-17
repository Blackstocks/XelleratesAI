import React, { useState, useEffect } from "react";
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

  const { fundingInformation, companyProfile, founderInformation, businessDetails,
    companyDocuments,
    ctoInfo,
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
  }, []);


  // const generatePDF = async (htmlContent, fileName = 'report.pdf') => {
  //   try {
  //     const file = { content: htmlContent };
  //     const options = { format: 'A4' };
  
  //     // Generate the PDF and save it
  //     await pdf.generatePdf(file, options).then(pdfBuffer => {
  //       fs.writeFileSync(fileName, pdfBuffer);
  //       console.log(`PDF generated and saved as ${fileName}`);
  //     });
  
  //     // Send the file as a download (assuming an Express.js environment)
  //     // res.download(fileName, err => {
  //     //   if (err) {
  //     //     console.log('Error downloading the file:', err);
  //     //   } else {
  //     //     console.log('File downloaded successfully');
  //     //   }
  //     // });
  
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // };

  const handleImageClick = async (type) => {
    if (type === 'investment') {
      // if (loading) {
      //   toast.info("Loading data, please wait...");
      //   return;
      // }

      const toastId = toast.loading("Generating report, please wait...");
  
      const shortDescription = companyProfile?.short_description || "Default description";
      const industrySector = companyProfile?.industry_sector || "Default sector";
      const currentStage = companyProfile?.currentStage || "Not Available";
      const previousFunding = fundingInformation?.previous_funding || [];
      
      try{
  
      const reportHtml = await generateReport(companyProfile, fundingInformation, founderInformation, businessDetails, companyDocuments, 
        ctoInfo, shortDescription, industrySector, companyName, currentStage, previousFunding);
      //generatePDF(reportHtml);
      
      toast.update(toastId, { render: "Report generated successfully!", type: "success", isLoading: false, autoClose: 5000 });
      
      const newWindow = window.open('', '_blank');
      newWindow.document.write(reportHtml);
      newWindow.document.close();
      } catch{
        toast.update(toastId, { render: "Cannot generate Report!", type: "error", isLoading: false, autoClose: 5000 });
      }
    } else {
      setModalType(type);
      setIsModalOpen(true);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  return (
    <div className="flex justify-between flex-wrap items-center mb-6">
      <div className="flex w-full space-x-4 mt-4">
        <div
          className="bg-no-repeat bg-cover bg-center shadow-lg p-5 rounded-[6px] relative flex-1"
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
        <div className="p-4 rounded bg-white shadow-lg text-black flex-1">
          <p>
            <h5>Welcome to Xellerates AI,</h5>
            I am <b>Zephyr</b>
            <span className="inline-block ml-2 animate-waving-hand">👋🏻</span>
            , your personal Investment Banker
          </p>
        </div>
        <div className="flex items-center justify-end flex-1">
          {userType === "startup" ? (
            <>
              <img
                src="/assets/images/dashboard/investment-readiness.png"
                alt="Investment Readiness"
                className="block dark:hidden w-50% h-auto cursor-pointer"
                onClick={() => handleImageClick('investment')}
              />
              <img
                src="/assets/images/dashboard/investment-redinessdark.png"
                alt="Investment Readiness Dark"
                className="hidden dark:block w-50% h-auto cursor-pointer"
                onClick={() => handleImageClick('investment')}
              />
            </>
          ) : (
            <>
              <img
                src="/assets/images/dashboard/latest-insight.png"
                alt="Latest Insight"
                className="block dark:hidden w-full h-auto cursor-pointer"
                onClick={() => handleImageClick('insight')}
              />
              <img
                src="/assets/images/dashboard/latest-insightdark.png"
                alt="Latest Insight Dark"
                className="hidden dark:block w-full h-auto cursor-pointer"
                onClick={() => handleImageClick('insight')}
              />
            </>
          )}
        </div>
      </div>

      {isModalOpen && modalType === 'insight' && (
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