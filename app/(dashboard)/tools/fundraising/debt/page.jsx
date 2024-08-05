"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabaseclient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import CountUp from "react-countup";

const Equity = () => {
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showPanModal, setShowPanModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showUnlockCapitalModal, setShowUnlockCapitalModal] = useState(false);
  const [panCard, setPanCard] = useState("");
  const [progress, setProgress] = useState(0);
  const [annualRevenue, setAnnualRevenue] = useState("₹0-2 Cr");
  const [growthRate, setGrowthRate] = useState("0 - 50%");
  const [cashRunway, setCashRunway] = useState("< 3 months");
  const [existingDebt, setExistingDebt] = useState("< 5% ARR");
  const [sector, setSector] = useState("SaaS");
  const [capitalOffer, setCapitalOffer] = useState(0);
  const [emi, setEmi] = useState(0);
  const [roi, setRoi] = useState("");
  const [tenure, setTenure] = useState("");
  const [collateral, setCollateral] = useState("No");
  const [isCalculated, setIsCalculated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session) {
      console.error("Error fetching session:", error);
      return;
    }

    const user = session.user;
    if (!user) {
      console.error("No user found in session");
      return;
    }

    setUser(user);
    console.log("User found:", user);
  };

  const checkProfileCompletion = async () => {
    if (!user) {
      console.error("User is not defined");
      return;
    }

    console.log("Checking profile completion for user:", user.id);

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select(
        "name, email, mobile, user_type, status, linkedin_profile, company_name, pan_number"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      const requiredFields = [
        "name",
        "email",
        "mobile",
        "user_type",
        "status",
        "linkedin_profile",
        "company_name",
      ];
      const isComplete = requiredFields.every((field) => data[field]);
      setIsProfileComplete(isComplete);
      console.log("Profile completion status:", isComplete);
      if (!isComplete) {
        setShowCompletionModal(true);
      } else {
        if (data.pan_number) {
          setShowProgressModal(true);
          startProgress();
        } else {
          setShowPanModal(true);
        }
      }
    }
  };

  const handlePanSubmit = async () => {
    if (user && panCard) {
      console.log("Submitting PAN card:", panCard);
      const { error } = await supabase
        .from("profiles")
        .update({ pan_number: panCard })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating PAN card:", error);
        return;
      }

      setShowPanModal(false);
      setShowProgressModal(true);
      startProgress();
    }
  };

  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowProgressModal(false);
            alert("Hello from equity connect with investor");
          }, 500);
          return 100;
        }
        return Math.min(oldProgress + 5, 100);
      });
    }, 500);
  };

  const calculateEstimates = () => {
    // Basic logic to calculate estimated values
    let baseCapital = 0;
    switch (annualRevenue) {
      case "₹0-2 Cr":
        baseCapital = 20;
        break;
      case "₹2-5 Cr":
        baseCapital = 50;
        break;
      case "₹5-10 Cr":
        baseCapital = 100;
        break;
      case "₹10-30 Cr":
        baseCapital = 300;
        break;
      case "₹30-100 Cr":
        baseCapital = 800;
        break;
      case "₹100+ Cr":
        baseCapital = 1000;
        break;
    }

    let growthMultiplier = 1;
    switch (growthRate) {
      case "0 - 50%":
        growthMultiplier = 1.2;
        break;
      case "50 - 100%":
        growthMultiplier = 1.5;
        break;
      case "> 100%":
        growthMultiplier = 2;
        break;
    }

    let runwayMultiplier = 1;
    switch (cashRunway) {
      case "< 3 months":
        runwayMultiplier = 0.8;
        break;
      case "3 - 6 months":
        runwayMultiplier = 1;
        break;
      case "6 - 9 months":
        runwayMultiplier = 1.2;
        break;
      case "9 - 12 months":
        runwayMultiplier = 1.5;
        break;
      case "> 12 months":
        runwayMultiplier = 2;
        break;
    }

    let debtMultiplier = 1;
    switch (existingDebt) {
      case "< 5% ARR":
        debtMultiplier = 1;
        break;
      case "5 - 15% ARR":
        debtMultiplier = 0.8;
        break;
      case "15 - 25% ARR":
        debtMultiplier = 0.5;
        break;
      case "> 25% ARR":
        debtMultiplier = 0.2;
        break;
    }

    const calculatedCapital =
      baseCapital *
      growthMultiplier *
      runwayMultiplier *
      debtMultiplier *
      100000;

    setCapitalOffer(calculatedCapital);
    setIsCalculated(true);

    // Assuming some predefined values for EMI, ROI, and tenure based on input
    setEmi((calculatedCapital / 3).toFixed(0));
    setRoi("16-20%");
    setTenure("6-9m");
    setCollateral("No");
  };

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const handleUnlockCapital = () => {
    setShowUnlockCapitalModal(true);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 relative">
      <Slider {...settings} className="w-full h-full">
        <div>
          <img
            src="/assets/images/tools/dcrou1.png"
            alt="Slide 1"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <img
            src="/assets/images/tools/dcrou2.png"
            alt="Slide 2"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <img
            src="/assets/images/tools/dcrou3.png"
            alt="Slide 3"
            className="w-full h-full object-cover"
          />
        </div>
      </Slider>

      <h1 className="text-2xl font-bold mt-8">
        India's Preferred Working Capital & Embedded Finance Platform
      </h1>
      <p className="text-lg text-center mt-4">
        Designed to supercharge startups and MSMEs across sectors with
        non-dilutive funding that scales as their business grows.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div>
          <img
            src="/assets/images/tools/dwhy1.png"
            alt="Why 1"
            className="w-full h-48 object-cover"
          />
        </div>
        <div>
          <img
            src="/assets/images/tools/dwhy2.png"
            alt="Why 2"
            className="w-full h-48 object-cover"
          />
        </div>
        <div>
          <img
            src="/assets/images/tools/dwhy3.png"
            alt="Why 3"
            className="w-full h-48 object-cover"
          />
        </div>
        <div>
          <img
            src="/assets/images/tools/dwhy4.png"
            alt="Why 4"
            className="w-full h-48 object-cover"
          />
        </div>
      </div>

      <div className="mt-12 p-6 bg-[#1a235e] text-white shadow rounded text-center w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4" style={{ color: "#1a235e" }}>
          <h2 className="text-2xl font-bold text-white">
            Estimate Your Funding
          </h2>
          <br />
          <p className="text-white mt-2">
            It takes just 60 seconds to calculate your capital offer with{" "}
            <b>Xellerates AI</b>
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white">Annual Revenue</label>
              <select
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="₹0-2 Cr">₹0-2 Cr</option>
                <option value="₹2-5 Cr">₹2-5 Cr</option>
                <option value="₹5-10 Cr">₹5-10 Cr</option>
                <option value="₹10-30 Cr">₹10-30 Cr</option>
                <option value="₹30-100 Cr">₹30-100 Cr</option>
                <option value="₹100+ Cr">₹100+ Cr</option>
              </select>
            </div>
            <div>
              <label className="text-white">Annual Growth Rate</label>
              <select
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="0 - 50%">0 - 50%</option>
                <option value="50 - 100%">50 - 100%</option>
                <option value="> 100%">100%</option>
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white">Cash Runway</label>
              <select
                value={cashRunway}
                onChange={(e) => setCashRunway(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="< 3 months"> 3 months</option>
                <option value="3 - 6 months">3 - 6 months</option>
                <option value="6 - 9 months">6 - 9 months</option>
                <option value="9 - 12 months">9 - 12 months</option>
                <option value="> 12 months"> 12 months</option>
              </select>
            </div>
            <div>
              <label className="text-white">Existing Debt</label>
              <select
                value={existingDebt}
                onChange={(e) => setExistingDebt(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="< 5% ARR">5% ARR</option>
                <option value="5 - 15% ARR">5 - 15% ARR</option>
                <option value="15 - 25% ARR">15 - 25% ARR</option>
                <option value="> 25% ARR"> 25% ARR</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-white">Sector</label>
            <br />
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="border border-gray-300 p-2 rounded w-1/2"
            >
              <option value="Generative AI">Generative AI</option>
              <option value="CleanTech">CleanTech</option>
              <option value="SaaS">SaaS</option>
              <option value="B2B Marketplaces">B2B Marketplaces</option>
              <option value="E-commerce">E-commerce</option>
              <option value="School Financing">School Financing</option>
              <option value="Marketing Services">Marketing Services</option>
              <option value="OTT">OTT</option>
              <option value="IOT">IOT</option>
              <option value="Tech Services">Tech Services</option>
              <option value="EV">EV</option>
              <option value="Co-working">Co-working</option>
              <option value="Staffing Services">Staffing Services</option>
              <option value="EdTech">EdTech</option>
              <option value="HealthTech">HealthTech</option>
              <option value="D2C">D2C</option>
              <option value="NBFC">NBFC</option>
              <option value="AgriTech">AgriTech</option>
              <option value="Prop Tech">Prop Tech</option>
              <option value="Co-Living">Co-Living</option>
              <option value="Engineering Services">Engineering Services</option>
              <option value="Facility Management">Facility Management</option>
              <option value="Logistics">Logistics</option>
              <option value="SpaceTech">SpaceTech</option>
              <option value="DefenceTech">DefenceTech</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <button
            onClick={calculateEstimates}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
          >
            Calculate
          </button>
        </div>
        <div className="p-4 bg-[#fff8f0] text-black-500 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold">Estimated Capital Offer:</h2>
          <p className="text-4xl font-bold mt-4">
            <CountUp
              end={capitalOffer}
              duration={1.5}
              separator=","
              prefix="₹"
            />
          </p>
          <p className="text-gray-600 mt-2">
            {(capitalOffer / 100000).toFixed(0)} Lakh Rupees Only
          </p>
          <div className="mt-4 text-left space-y-2">
            <p>
              <b>EMI :</b> ₹{emi.toLocaleString()}
            </p>
            <p>
              <b>ROI :</b> {roi}
            </p>
            <p>
              <b>Tenure :</b> {tenure}
            </p>
            <p>
              <b>Collaterals :</b> {collateral}
            </p>
          </div>
          <div className="mt-4 text-left text-gray-600">
            <p>*This is an indicative term sheet.</p>
            <p>*EMI shown for 3 months financing at 16% ROI.</p>
          </div>
          {isCalculated && (
            <button
              onClick={handleUnlockCapital}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Unlock Capital
            </button>
          )}
        </div>
      </div>

      <div className="mt-12 p-6 bg-white shadow rounded text-center w-full">
        <h4 className="text-2xl font-bold mb-8">Our Products</h4>
        <div className="flex justify-center gap-4">
          <div className="flex flex-col items-center">
            <img
              src="/assets/images/tools/dpro1.png"
              alt="Image 1"
              className="w-full h-48 object-cover shadow-lg"
            />
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/images/tools/dpro2.png"
              alt="Image 2"
              className="w-full h-48 object-cover shadow-lg"
            />
          </div>
          <div className="flex flex-col items-center">
            <img
              src="/assets/images/tools/dpro3.png"
              alt="Image 3"
              className="w-full h-48 object-cover shadow-lg"
            />
          </div>
        </div>
      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg w-1/3">
            <h2 className="text-2xl mb-4">Complete Your Profile</h2>
            <p>Please complete all required fields in your profile.</p>
            <button
              onClick={() => setShowCompletionModal(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showProgressModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-lg w-1/3">
            <h2 className="text-2xl mb-4">Processing...</h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>{progress}%</p>
          </div>
        </div>
      )}

      {showUnlockCapitalModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="relative bg-[#1a235e] text-white p-8 rounded shadow-lg w-3/4 md:w-1/2 lg:w-1/3">
            <button
              onClick={() => setShowUnlockCapitalModal(false)}
              className="absolute top-4 right-4 text-white hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center text-white">
              Unlock Capital Now
            </h2>
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-white text-base">Enter Company PAN</label>
                <input
                  type="text"
                  className="border border-[#fff8f0] p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white text-base">
                  Enter Required Amount
                </label>
                <input
                  type="text"
                  className="border border-[#fff8f0] p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-white text-base">
                  Upload Company PAN
                </label>
                <input
                  type="file"
                  className="border border-[#fff8f0] p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-semibold mb-2 text-white text-center">
                  Tentative Timeline
                </h3>
                <div className="flex justify-center gap-4">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Immediately
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
                    Within 1 month
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
                    Within 3 months
                  </button>
                </div>
              </div>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Analyzing Your Profile
              </button>
              <p className="mt-4 text-white text-center">
                Currently we only facilitate debt funding for PVT LTD co.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equity;
