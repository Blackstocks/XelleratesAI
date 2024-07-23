"use client";

import React, { useEffect, useState } from "react";
import useUserDetails from "@/hooks/useUserDetails";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabaseclient";

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

  const handleLinkClick = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  const cardContent = (title, subtitle, imgSrc, link) => (
    <div
      className="relative w-full h-60 bg-cover bg-center rounded-lg overflow-hidden shadow-lg"
      style={{ backgroundImage: `url(${imgSrc})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2 text-center">
            {title}
          </h2>
        </div>
        <div>
          <p className="text-sm text-white mb-4">{subtitle}</p>
        </div>
        <div className="flex justify-center">
          <a
            className="inline-block px-4 py-2 bg-white text-black text-xs font-medium rounded hover:bg-gray-200 transition"
            href={link}
            onClick={link === "#" ? handleLinkClick : null}
          >
            Explore
          </a>
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
        {user?.user_type === "startup" && (
          <div className="w-full border">
            <section className="py-8 w-full">
              <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardContent(
                    "Investment Readiness",
                    "Achieve investment readiness with our comprehensive tools for incorporation, certification, and cap table management.",
                    "/assets/images/dashboard/background2.jpg",
                    "#"
                  )}
                  {cardContent(
                    "DIY Pitch Deck",
                    "Create your own pitch deck effortlessly with our DIY tool, equipped with templates and customization options.",
                    "/assets/images/dashboard/background2.jpg",
                    "#"
                  )}
                  {cardContent(
                    "Financial Insights",
                    "Gain comprehensive financial insights with our advanced analytics tool, providing real-time data and trends.",
                    "/assets/images/dashboard/background2.jpg",
                    "#"
                  )}
                  {cardContent(
                    "Fundraising",
                    "Streamline your fund raising with our platform, offering tailored solutions and connections to potential investors.",
                    "/assets/images/dashboard/background2.jpg",
                    "/tools/fundraising"
                  )}
                  {cardContent(
                    "Legal Help Desk",
                    "Access legal assistance with our help desk, offering guidance on contracts, compliance and legal documentation.",
                    "/assets/images/dashboard/background2.jpg",
                    "#"
                  )}
                  {cardContent(
                    "Connect with Incubators",
                    "Connect with top incubators through our platform, fostering growth and providing valuable mentorship and resources.",
                    "/assets/images/dashboard/background2.jpg",
                    "#"
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
        {user?.user_type === "investor" && (
          <div className="w-full border">
            <section className="py-8 w-full">
              <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardContent(
                    "Curated Dealflow",
                    "Access global deal flow opportunities, connecting with investors and startups worldwide for strategic growth.",
                    "/assets/images/dashboard/backgound1.jpg",
                    "#"
                  )}
                  {cardContent(
                    "Document Management",
                    "Streamline your document management with our secure platform, ensuring easy access and organization of critical files.",
                    "/assets/images/dashboard/backgound1.jpg",
                    "#"
                  )}
                  {cardContent(
                    "Syndicate",
                    "Join or create syndicates to pool resources, share risks, and invest in promising startups collaboratively.",
                    "/assets/images/dashboard/backgound1.jpg",
                    "#"
                  )}
                  {cardContent(
                    "Portfolio Management",
                    "Optimize your investments with our portfolio management tools, providing insights and tracking performance.",
                    "/assets/images/dashboard/backgound1.jpg",
                    "/tools/portfolio-management"
                  )}
                  {cardContent(
                    "Valuate a Startup",
                    "Accurately valuate startups using our comprehensive tools, offering detailed financial and market evaluations.",
                    "/assets/images/dashboard/backgound1.jpg",
                    "#"
                  )}
                  {cardContent(
                    "Post Term Sheet",
                    "Manage post-term sheet activities efficiently with our tools, ensuring smooth transitions and adherence to agreements.",
                    "/assets/images/dashboard/backgound1.jpg",
                    "#"
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4 text-center">Coming Soon!!</h2>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
