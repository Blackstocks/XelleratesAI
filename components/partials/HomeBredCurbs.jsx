import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComingSoonModal from "@/components/ComingSoonModal";
import ImageBlock2 from "@/components/partials/widget/block/image-block-2";

const HomeBredCurbs = ({ title, companyName, userType }) => {
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11),
  });
  const [greeting, setGreeting] = useState("Good evening");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleValueChange = (newValue) => {
    setValue(newValue);
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
                onClick={handleImageClick}
              />
              <img
                src="/assets/images/dashboard/investment-redinessdark.png"
                alt="Investment Readiness Dark"
                className="hidden dark:block w-50% h-auto cursor-pointer"
                onClick={handleImageClick}
              />
            </>
          ) : (
            <>
              <img
                src="/assets/images/dashboard/latest-insight.png"
                alt="Latest Insight"
                className="block dark:hidden w-full h-auto"
                onClick={handleImageClick}
              />
              <img
                src="/assets/images/dashboard/latest-insightdark.png"
                alt="Latest Insight Dark"
                className="hidden dark:block w-full h-auto"
                onClick={handleImageClick}
              />
            </>
          )}
        </div>
      </div>

      <ComingSoonModal isOpen={isModalOpen} onClose={handleCloseModal} />
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
