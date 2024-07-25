"use client";

import React, { useEffect, useState } from "react";
import useUserDetails from "@/hooks/useUserDetails";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseclient";
import dynamic from "next/dynamic";

const rabitWidget = [
  {
    bg: "bg-slate-900 dark:bg-slate-800",
  },
];

const Tools = () => {
  const { user, details, loading } = useUserDetails();
  const [companyName, setCompanyName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("company_name")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching company name:", error);
        } else {
          setCompanyName(data.company_name);
        }
      }
    };

    fetchCompanyName();
  }, [user]);

  const handleLinkClick = (e, link) => {
    if (link === "#") {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  const cardContent = (title, subtitle, imgSrc, link) => (
    <div
      className={`relative z-[1] rounded-2xl text-white bg-cover bg-center bg-slate-900 dark:bg-slate-800 shadow-lg p-6`}
      style={{ backgroundImage: `url(${imgSrc})` }}
    >
      <div className="max-w-[300px] mx-auto text-center">
        <div className="widget-title text-white">
          <h5 className="text-white">
            <b>{title}</b>
          </h5>
        </div>
      </div>
      <div className="mt-4 mb-4 text-center">
        <a
          className="btn bg-white hover:bg-opacity-80 text-slate-900 btn-sm"
          href={link}
          onClick={(e) => handleLinkClick(e, link)}
        >
          Explore
        </a>
        <img
          src="/assets/images/svg/line.svg"
          alt=""
          className="absolute left-0 bottom-0 w-full z-[-1]"
        />
      </div>
    </div>
  );

  const additionalCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {/* show the percentage from backend */}
          {/* <CircularProgress /> */}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold">
            Few steps away from completing your profile
          </h3>
        </div>
      </div>
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center animate-bounce">
            <img
              src="/assets/images/tools/click.jpg"
              alt="Click Animation"
              className="w-20 h-25"
            />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium">
            <b>Connect with investors in a single click</b>
          </h3>
        </div>
      </div>
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <img
              src="/assets/images/tools/customer_care.jpg"
              alt="Phone Animation"
              className="w-20 h-25"
            />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-normal">
            <b>Free consultation with an Investment Banker</b>
          </h3>
        </div>
      </div>
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
          <img
            src="/assets/images/tools/wallet.jpg"
            alt="Wallet Icon"
            className="w-20 h-25"
          />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold">Wallet Balance</h3>
          <p className="text-sm">$50000</p>
        </div>
      </div>
    </div>
  );

  const additionalCards2 = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <img
              src="/assets/images/tools/customer_care.jpg"
              alt="Phone Animation"
              className="w-20 h-25"
            />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold">
            Get free consultation with an Investment Banker
          </h3>
        </div>
      </div>
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center animate-bounce">
            <img
              src="/assets/images/tools/funding.png"
              alt="Click Animation"
              className="w-20 h-25"
            />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium">
            <b>Raise funds for your portfolio startup(s)</b>
          </h3>
        </div>
      </div>
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <img
              src="/assets/images/tools/bank.png"
              alt="Phone Animation"
              className="w-20 h-25"
            />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-normal">
            <b>Explore exit opportunities</b>
          </h3>
        </div>
      </div>
      <div className="flex items-center bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
          <img
            src="/assets/images/tools/stock.png"
            alt="Wallet Icon"
            className="w-20 h-25"
          />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold">Invest in upcoming IPOs</h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full relative">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-40"></div>
      )}
      <div className={`w-full ${isModalOpen ? "blur-md" : ""}`}>
        <div className="container px-4 mx-auto">
          {user?.user_type === "startup" && additionalCards()}
        </div>
        {user?.user_type === "startup" && (
          <div className="w-full border">
            <section className="py-8 w-full">
              <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardContent(
                    "Investment Readiness",
                    "Achieve investment readiness with our comprehensive tools for incorporation, certification, and cap table management.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                  {cardContent(
                    "DIY Pitch Deck",
                    "Create your own pitch deck effortlessly with our DIY tool, equipped with templates and customization options.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                  {cardContent(
                    "Financial Insights",
                    "Gain comprehensive financial insights with our advanced analytics tool, providing real-time data and trends.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                  {cardContent(
                    "Fundraising",
                    "Streamline your fund raising with our platform, offering tailored solutions and connections to potential investors.",
                    "bg-slate-900 dark:bg-slate-800",
                    ""
                  )}
                  {cardContent(
                    "Legal Help Desk",
                    "Access legal assistance with our help desk, offering guidance on contracts, compliance and legal documentation.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                  {cardContent(
                    "Connect with Incubators",
                    "Connect with top incubators through our platform, fostering growth and providing valuable mentorship and resources.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
        <div className="container px-4 mx-auto">
          {user?.user_type === "investor" && additionalCards2()}
        </div>
        {user?.user_type === "investor" && (
          <div className="w-full border">
            <section className="py-8 w-full">
              <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardContent(
                    "Curated Dealflow",
                    "Access global deal flow opportunities, connecting with investors and startups worldwide for strategic growth.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                  {cardContent(
                    "Document Management",
                    "Streamline your document management with our secure platform, ensuring easy access and organization of critical files.",
                    "bg-slate-900 dark:bg-slate-800",
                    "/tools/document-management"
                  )}
                  {cardContent(
                    "Syndicate",
                    "Join or create syndicates to pool resources, share risks, and invest in promising startups collaboratively.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                  {cardContent(
                    "Portfolio Management",
                    "Optimize your investments with our portfolio management tools, providing insights and tracking performance.",
                    "bg-slate-900 dark:bg-slate-800",
                    "/tools/portfolio-management"
                  )}
                  {cardContent(
                    "Valuate a Startup",
                    "Accurately valuate startups using our comprehensive tools, offering detailed financial and market evaluations.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                  {cardContent(
                    "Post Term Sheet",
                    "Manage post-term sheet activities efficiently with our tools, ensuring smooth transitions and adherence to agreements.",
                    "bg-slate-900 dark:bg-slate-800",
                    "#"
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;
