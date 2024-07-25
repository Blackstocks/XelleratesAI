"use client";

import React, { useEffect, useState } from "react";
import useUserDetails from "@/hooks/useUserDetails";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseclient";
import dynamic from "next/dynamic";

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

  const cardContent = (title, imgSrc, link) => (
    <a
      href={link}
      onClick={(e) => handleLinkClick(e, link)}
      className="relative z-[1] rounded-2xl shadow-lg transform transition-transform duration-500"
    >
      <img src={imgSrc} alt={title} className="rounded-2xl w-full transition-transform duration-300 ease-in-out" />
    </a>
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
          <div className="w-full">
            <section className="py-8 w-full">
              <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardContent(
                    "Investment Readiness",
                    "/assets/images/tools/1.png",
                    "#"
                  )}
                  {cardContent(
                    "DIY Pitch Deck",
                    "/assets/images/tools/2.png",
                    "#"
                  )}
                  {cardContent(
                    "Financial Insights",
                    "/assets/images/tools/3.png",
                    "#"
                  )}
                  {cardContent(
                    "Fundraising",
                    "/assets/images/tools/4.png",
                    "/tools/fundraising"
                  )}
                  {cardContent(
                    "Legal Help Desk",
                    "/assets/images/tools/5.png",
                    "#"
                  )}
                  {cardContent(
                    "Connect with Incubators",
                    "/assets/images/tools/6.png",
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
          <div className="w-full">
            <section className="py-8 w-full">
              <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardContent(
                    "Curated Dealflow",
                    "/assets/images/tools/1.png",
                    "#"
                  )}
                  {cardContent(
                    "Document Management",
                    "/assets/images/tools/2.png",
                    "/tools/document-management"
                  )}
                  {cardContent(
                    "Syndicate",
                    "/assets/images/tools/3.png",
                    "#"
                  )}
                  {cardContent(
                    "Portfolio Management",
                    "/assets/images/tools/4.png",
                    "/tools/portfolio-management"
                  )}
                  {cardContent(
                    "Valuate a Startup",
                    "/assets/images/tools/5.png",
                    "#"
                  )}
                  {cardContent(
                    "Post Term Sheet",
                    "/assets/images/tools/6.png",
                    "#"
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
      <style jsx>{`
        a {
          perspective: 1000px;
        }
        a:hover img {
          transform: rotateY(10deg) translateY(-10px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Tools;
