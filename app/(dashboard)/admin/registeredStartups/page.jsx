"use client";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import useUserDetails from "@/hooks/useUserDetails";
import useStartupsRawApproved from "@/hooks/useStartupsRawApproved";
import Modal from "@/components/Modal";
import Loading from "@/app/loading";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import Textarea from "@/components/ui/Textarea";
import Icon from "@/components/ui/Icon";
import DocumentSubmissionModal from "@/components/documentModal";
import generateReport from "@/components/report/report-functions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/lib/supabaseclient";
import Button from "@/components/ui/Button"; 

const CuratedDealflow = () => {
  const { user, loading: userLoading } = useUserDetails();
  const {
    startups,
    loading: startupsLoading,
    refetch: refetchStartups,
  } = useStartupsRawApproved();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedFunding, setSelectedFunding] = useState("All");
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [activeTab, setActiveTab] = useState("startupProfile");
  const [picker1, setPicker1] = useState(new Date());
  const [picker2, setPicker2] = useState(new Date());
  const [picker3, setPicker3] = useState(new Date());
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullUSP, setShowFullUSP] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gstInformation, setGstInformation] = useState(null);
  const [loadingGstInformation, setLoadingGstInformation] = useState(false);

  const [showUploadStartupModal, setShowUploadStartupModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false); // State to control modal visibility
  const [activeUploadTab, setActiveUploadTab] = useState("startupProfile"); // State to control the active tab
  const [newStartupData, setNewStartupData] = useState({
    startupProfile: {
      name: "",
      short_description: "",
      date_of_incorporation: "",
      location: "",
      office_address: "",
      industry_sector: "",
      team_size: "",
      current_stage: "",
      target_audience: "",
      usp_moat: "",
      website: "",
      linkedin_profile: "",
      media_presence: "",
    },
    founderInfo: {
      founder_name: "",
      founder_email: "",
      founder_mobile: "",
      founder_linkedin: "",
      college_name: "",
      graduation_year: "",
      advisors: [
        {
          advisor_name: "",
          advisor_email: "",
          advisor_mobile: "",
          advisor_linkedin: "",
        },
      ],
      co_founders: [
        {
          co_founder_name: "",
          co_founder_email: "",
          co_founder_mobile: "",
          co_founder_linkedin: "",
        },
      ],
      co_founder_agreement: "",
    },
    businessDetails: {
      current_traction: "",
      new_customers: "",
      customer_acquisition_cost: "",
      customer_lifetime_value: "",
    },
    fundingInfo: {
      total_funding_ask: "",
      amount_committed: "",
      government_grants: "",
      equity_split: "",
      fund_utilization: "",
      arr: "",
      mrr: "",
      current_cap_table: "",
      previous_funding: [
        {
          investorName: "",
          firmName: "",
          investorType: "",
          amountRaised: "",
        },
      ],
      cap_table: [
        {
          designation: "",
          firstName: "",
          percentage: "",
        },
      ],
    },
    companyDocuments: {
      certificate_of_incorporation: null,
      gst_certificate: null,
      trademark: null,
      copyright: null,
      patent: null,
      startup_india_certificate: null,
      due_diligence_report: null,
      business_valuation_report: null,
      mis: null,
      financial_projections: null,
      balance_sheet: null,
      pl_statement: null,
      cashflow_statement: null,
      pitch_deck: null,
      video_pitch: null,
      sha: null,
      termsheet: null,
      employment_agreement: null,
      mou: null,
      nda: null,
    },
    CTO_info: {
      cto_name: "",
      cto_email: "",
      cto_mobile: "",
      cto_linkedin: "",
      tech_team_size: "",
      mobile_app_link_ios: "",
      mobile_app_link_android: "",
      technology_roadmap: "",
    },
    gstInfo: {
      gstin: "",
      legal_name: "",
      business_constitution: "",
      aggregate_turnover: "",
      current_registration_status: "",
      state_jurisdiction: "",
      central_jurisdiction: "",
      tax_payer_type: "",
      authorized_signatory: "",
      business_details: [],
      filing_status: [],
    },
  });

  const toastIdRef = useRef(null);

  const handleInputChange = (tab, field, value) => {
    setNewStartupData((prevState) => ({
      ...prevState,
      [tab]: {
        ...prevState[tab],
        [field]: value,
      },
    }));
  };

  const handleSaveNewStartup = async () => {
    try {
      // Insert startup profile data
      const { data: startupProfileData, error: startupProfileError } = await supabase
        .from('startup_profiles') // Adjust table name as needed
        .insert([
          {
            name: newStartupData.startupProfile.name,
            short_description: newStartupData.startupProfile.short_description,
            date_of_incorporation: newStartupData.startupProfile.date_of_incorporation,
            location: newStartupData.startupProfile.location,
            office_address: newStartupData.startupProfile.office_address,
            industry_sector: newStartupData.startupProfile.industry_sector,
            team_size: newStartupData.startupProfile.team_size,
            current_stage: newStartupData.startupProfile.current_stage,
            target_audience: newStartupData.startupProfile.target_audience,
            usp_moat: newStartupData.startupProfile.usp_moat,
            website: newStartupData.startupProfile.website,
            linkedin_profile: newStartupData.startupProfile.linkedin_profile,
            media_presence: newStartupData.startupProfile.media_presence,
          },
        ]);
  
      if (startupProfileError) throw startupProfileError;
  
      // Insert founder information data
      const { data: founderInfoData, error: founderInfoError } = await supabase
        .from('founder_information') // Adjust table name as needed
        .insert([
          {
            founder_name: newStartupData.founderInfo.founder_name,
            founder_email: newStartupData.founderInfo.founder_email,
            founder_mobile: newStartupData.founderInfo.founder_mobile,
            founder_linkedin: newStartupData.founderInfo.founder_linkedin,
            college_name: newStartupData.founderInfo.college_name,
            graduation_year: newStartupData.founderInfo.graduation_year,
            advisors: JSON.stringify(newStartupData.founderInfo.advisors),
            co_founders: JSON.stringify(newStartupData.founderInfo.co_founders),
            co_founder_agreement: newStartupData.founderInfo.co_founder_agreement,
          },
        ]);
  
      if (founderInfoError) throw founderInfoError;
  
      // Insert business details data
      const { data: businessDetailsData, error: businessDetailsError } = await supabase
        .from('business_details') // Adjust table name as needed
        .insert([
          {
            current_traction: newStartupData.businessDetails.current_traction,
            new_customers: newStartupData.businessDetails.new_customers,
            customer_acquisition_cost: newStartupData.businessDetails.customer_acquisition_cost,
            customer_lifetime_value: newStartupData.businessDetails.customer_lifetime_value,
          },
        ]);
  
      if (businessDetailsError) throw businessDetailsError;
  
      // Insert funding information data
      const { data: fundingInfoData, error: fundingInfoError } = await supabase
        .from('funding_information') // Adjust table name as needed
        .insert([
          {
            total_funding_ask: newStartupData.fundingInfo.total_funding_ask,
            amount_committed: newStartupData.fundingInfo.amount_committed,
            government_grants: newStartupData.fundingInfo.government_grants,
            equity_split: newStartupData.fundingInfo.equity_split,
            fund_utilization: newStartupData.fundingInfo.fund_utilization,
            arr: newStartupData.fundingInfo.arr,
            mrr: newStartupData.fundingInfo.mrr,
            current_cap_table: newStartupData.fundingInfo.current_cap_table,
            previous_funding: JSON.stringify(newStartupData.fundingInfo.previous_funding),
            cap_table: JSON.stringify(newStartupData.fundingInfo.cap_table),
          },
        ]);
  
      if (fundingInfoError) throw fundingInfoError;
  
      // Insert company documents data
      const { data: companyDocumentsData, error: companyDocumentsError } = await supabase
        .from('company_documents') // Adjust table name as needed
        .insert([
          {
            certificate_of_incorporation: newStartupData.companyDocuments.certificate_of_incorporation,
            gst_certificate: newStartupData.companyDocuments.gst_certificate,
            trademark: newStartupData.companyDocuments.trademark,
            copyright: newStartupData.companyDocuments.copyright,
            patent: newStartupData.companyDocuments.patent,
            startup_india_certificate: newStartupData.companyDocuments.startup_india_certificate,
            due_diligence_report: newStartupData.companyDocuments.due_diligence_report,
            business_valuation_report: newStartupData.companyDocuments.business_valuation_report,
            mis: newStartupData.companyDocuments.mis,
            financial_projections: newStartupData.companyDocuments.financial_projections,
            balance_sheet: newStartupData.companyDocuments.balance_sheet,
            pl_statement: newStartupData.companyDocuments.pl_statement,
            cashflow_statement: newStartupData.companyDocuments.cashflow_statement,
            pitch_deck: newStartupData.companyDocuments.pitch_deck,
            video_pitch: newStartupData.companyDocuments.video_pitch,
            sha: newStartupData.companyDocuments.sha,
            termsheet: newStartupData.companyDocuments.termsheet,
            employment_agreement: newStartupData.companyDocuments.employment_agreement,
            mou: newStartupData.companyDocuments.mou,
            nda: newStartupData.companyDocuments.nda,
          },
        ]);
  
      if (companyDocumentsError) throw companyDocumentsError;
  
      // Insert CTO information data
      const { data: ctoInfoData, error: ctoInfoError } = await supabase
        .from('CTO_info') // Adjust table name as needed
        .insert([
          {
            cto_name: newStartupData.CTO_info.cto_name,
            cto_email: newStartupData.CTO_info.cto_email,
            cto_mobile: newStartupData.CTO_info.cto_mobile,
            cto_linkedin: newStartupData.CTO_info.cto_linkedin,
            tech_team_size: newStartupData.CTO_info.tech_team_size,
            mobile_app_link_ios: newStartupData.CTO_info.mobile_app_link_ios,
            mobile_app_link_android: newStartupData.CTO_info.mobile_app_link_android,
            technology_roadmap: newStartupData.CTO_info.technology_roadmap,
          },
        ]);
  
      if (ctoInfoError) throw ctoInfoError;
  
      // Insert GST information data
      const { data: gstInfoData, error: gstInfoError } = await supabase
        .from('gst_information') // Adjust table name as needed
        .insert([
          {
            gstin: newStartupData.gstInfo.gstin,
            legal_name: newStartupData.gstInfo.legal_name,
            business_constitution: newStartupData.gstInfo.business_constitution,
            aggregate_turnover: newStartupData.gstInfo.aggregate_turnover,
            current_registration_status: newStartupData.gstInfo.current_registration_status,
            state_jurisdiction: newStartupData.gstInfo.state_jurisdiction,
            central_jurisdiction: newStartupData.gstInfo.central_jurisdiction,
            tax_payer_type: newStartupData.gstInfo.tax_payer_type,
            authorized_signatory: newStartupData.gstInfo.authorized_signatory,
            business_details: JSON.stringify(newStartupData.gstInfo.business_details),
            filing_status: JSON.stringify(newStartupData.gstInfo.filing_status),
          },
        ]);
  
      if (gstInfoError) throw gstInfoError;
  
      // If all insert operations are successful
      console.log("New Startup Data Saved Successfully");
      setShowUploadModal(false); // Close the modal after saving
    } catch (error) {
      console.error("Error saving new startup data:", error.message);
    }
  };
  

  // console.log('startups:', startups);
  console.log("selectedStartup:", selectedStartup);
  const itemsPerPage = 20;

  const fetchGstInformation = async (userId) => {
    console.log("Fetching GST information for user ID:", userId);
    setLoadingGstInformation(true);
    try {
      const { data, error } = await supabase
        .from("debt_gstin") // Replace with your GST info table name
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      console.log("GTSIn: ", data);

      setGstInformation(data[0] || null); // Set the GST info or null if not found
    } catch (error) {
      console.error("Error fetching GST information:", error.message);
      setGstInformation(null); // Ensure to set null if there's an error
    } finally {
      setLoadingGstInformation(false); // End loading
    }
  };

  // Use effect to fetch GST information when the tab is selected
  useEffect(() => {
    if (activeTab === "gstInfo" && selectedStartup) {
      fetchGstInformation(selectedStartup.id); // Pass the user ID from the selected startup
    }
  }, [activeTab, selectedStartup]);

  // Use effect to reset the current page when any of the filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to the first page whenever a filter changes
  }, [selectedSector, selectedStage, selectedLocation, selectedFunding]);

  if (userLoading || startupsLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  const uniqueSectors = [
    "All",
    ...new Set(
      startups
        .map((startup) => startup.company_profile?.industry_sector || "N/A")
        .filter((sector) => sector !== "N/A")
    ),
  ];

  const uniqueStages = [
    "All",
    ...new Set(
      startups
        .map((startup) => startup.company_profile?.current_stage || "N/A")
        .filter((stage) => stage !== "N/A")
    ),
  ];

  const uniqueLocations = [
    "All",
    ...new Set(
      startups
        .map((startup) => {
          try {
            const countryData = JSON.parse(
              startup.company_profile?.country || "{}"
            );
            return countryData.label || "N/A";
          } catch (error) {
            return "N/A";
          }
        })
        .filter((location) => location !== "N/A")
    ),
  ];

  const uniqueFundings = [
    "All",
    ...new Set(
      startups.map((startup) => {
        const fundingInformation =
          startup.company_profile?.funding_information?.[0];
        return fundingInformation?.total_funding_ask ? "Funded" : "Not Funded";
      })
    ),
  ];

  const filteredStartups = startups.filter((startup) => {
    const companyProfile = startup.company_profile;
    const fundingInformation =
      startup.company_profile?.funding_information?.[0];

    const searchFields = [
      companyProfile?.company_name,
      companyProfile?.founder_information?.founder_name,
      companyProfile?.industry_sector,
      JSON.parse(companyProfile?.country || "{}").label,
      fundingInformation?.total_funding_ask ? "Funded" : "Not Funded",
      companyProfile?.current_stage,
    ];

    const matchesSearch = searchFields.some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      matchesSearch &&
      (selectedSector === "All" ||
        companyProfile?.industry_sector === selectedSector) &&
      (selectedStage === "All" ||
        companyProfile?.current_stage === selectedStage) &&
      (selectedLocation === "All" ||
        JSON.parse(companyProfile?.country || "{}").label ===
          selectedLocation) &&
      (selectedFunding === "All" ||
        (selectedFunding === "Funded" &&
          fundingInformation?.total_funding_ask) ||
        (selectedFunding === "Not Funded" &&
          !fundingInformation?.total_funding_ask))
    );
  });

  console.log("selectedstartuops:", selectedStartup);

  const totalPages = Math.ceil(filteredStartups.length / itemsPerPage);
  const currentStartups = filteredStartups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleCloseModal = () => {
    setSelectedStartup(null);
  };

  const handleClearFilters = () => {
    setSelectedSector("All");
    setSelectedStage("All");
    setSelectedLocation("All");
    setSelectedFunding("All");
    setSearchQuery(""); // Clear search query when filters are cleared
  };

  const handleExpressInterest = async (
    startupId,
    investorId,
    message,
    dateTime
  ) => {
    try {
      const response = await fetch("/api/express-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: investorId, // Assuming the sender is the investor
          receiverId: startupId, // Assuming the receiver is the startup
          message,
          dateTime,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error sending interest notification:", error.error);
        return;
      }

      const data = await response.json();
      console.log("Interest notification sent:", data.message);
      setMessage("");
      setPicker1(new Date());
      setPicker2(new Date());
      setPicker3(new Date());
      setShowForm(false);
    } catch (error) {
      console.error("Unexpected error sending interest notification:", error);
    }
  };

  const handleImageClick = async (type, selectedStartup) => {
    if (type === "investment") {
      toastIdRef.current = toast.loading("Generating report, please wait...");

      const firstUpdate = setTimeout(() => {
        toast.update(toastIdRef.current, {
          render: "Taking longer than usual...",
          type: toast.TYPE.INFO,
          isLoading: true,
          autoClose: false,
        });
      }, 15000);

      // Second update after 10 seconds
      const secondUpdate = setTimeout(() => {
        toast.update(toastIdRef.current, {
          render: "Almost there...",
          type: toast.TYPE.INFO,
          isLoading: true,
          autoClose: false,
        });
      }, 30000);

      const clearToastUpdates = () => {
        clearTimeout(firstUpdate);
        clearTimeout(secondUpdate);
      };

      const companyProfile = selectedStartup?.company_profile;
      console.log(
        "selectedStartup?.company_profile",
        selectedStartup?.company_profile
      );
      console.log("SELECTED STARTUP: ", selectedStartup);

      const profiles = {
        company_logo: selectedStartup?.company_logo,
        id: selectedStartup?.id,
        name: selectedStartup?.name,
        user_type: selectedStartup?.user_type,
      };

      try {
        const result = await generateReport(
          companyProfile,
          companyProfile?.funding_information,
          companyProfile?.founder_information,
          companyProfile?.business_details,
          companyProfile?.company_documents[0],
          companyProfile?.CTO_info,
          profiles,
          companyProfile?.short_description,
          companyProfile?.industry_sector,
          companyProfile?.company_name || "N/A",
          companyProfile?.current_stage,
          companyProfile?.funding_information?.previous_funding
        );

        if (result.status === "docs") {
          toast.update(toastIdRef.current, {
            render: (
              <div>
                Cannot generate report: Missing documents or incorrect format:
                <br />
                {result.message}
              </div>
            ),
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
          clearToastUpdates();
        } else {
          toast.update(toastIdRef.current, {
            render: "Report generated successfully!",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
          clearToastUpdates();
          toastIdRef.current = null;

          try {
            const newWindow = window.open("", "_blank");

            if (newWindow) {
              newWindow.document.write(result.html);
              newWindow.document.close();
            } else {
              throw new Error(
                "Popup blocked. Please allow popups for this site."
              );
            }
          } catch (error) {
            toast.update(toastIdRef.current, {
              render: `Cannot generate Report! ${error.message || error}`,
              type: "error",
              isLoading: false,
              autoClose: 5000,
            });
            clearToastUpdates();
            toastIdRef.current = null;
          }
        }
      } catch (error) {
        toast.update(toastIdRef.current, {
          render: "Cannot generate Report!",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        clearToastUpdates();
        toastIdRef.current = null;
        console.error("Error generating report:", error);
      }
    } else {
      setModalType(type);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Head>
        <title>Registered Startups</title>
      </Head>
      <main className="container mx-auto p-4">
        <div className="flex justify-between mb-4">
          <h1 className="text-3xl font-bold mb-4">Registered Startups</h1>

          {/* Upload Startup Button */}
          <Button onClick={() => setShowUploadModal(true)}>Upload Startup</Button>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search startups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded ml-4"
          />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-4">
          <div className="mb-4 lg:mb-0">
            <label
              htmlFor="sector-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Sector:
            </label>
            <select
              id="sector-filter"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {uniqueSectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 lg:mb-0">
            <label
              htmlFor="stage-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Stage:
            </label>
            <select
              id="stage-filter"
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {uniqueStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 lg:mb-0">
            <label
              htmlFor="location-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Location:
            </label>
            <select
              id="location-filter"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 lg:mb-0">
            <label
              htmlFor="funding-filter"
              className="block text-sm font-medium text-gray-700"
            >
              Previous Funding:
            </label>
            <select
              id="funding-filter"
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value)}
              className="mt-1 block w-full lg:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {uniqueFundings.map((funding) => (
                <option key={funding} value={funding}>
                  {funding}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 lg:mb-0 lg:ml-auto">
            <button
              onClick={handleClearFilters}
              className="mt-6 lg:mt-4 py-2 px-4 bg-black-500 hover:bg-red-600 text-white rounded-md transition duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Registered Startups</h2>
          {currentStartups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      S.No
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Startup Info
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Founder Name
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Sector
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Date of Incorporation
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Team Size
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Stage
                    </th>
                    <th className="py-4 px-4 border-b border-gray-300 text-left">
                      Previous Funding
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentStartups.map((startup, index) => {
                    const companyProfile = startup.company_profile;
                    const company_logos = startup?.company_logo;
                    const founderInfo = companyProfile?.founder_information;

                    const fundingInformation =
                      companyProfile?.funding_information?.[0];
                    const companyDocuments = companyProfile?.company_documents;

                    return (
                      <tr
                        key={startup.id}
                        className={`hover:bg-gray-100 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }`}
                        onClick={() => {
                          setSelectedStartup(startup);
                          setActiveTab("startupProfile");
                        }}
                      >
                        <td className="py-2 px-4 border-b border-gray-300 text-sm">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300 text-sm flex items-center space-x-2">
                          {company_logos ? (
                            <img
                              src={company_logos}
                              alt={companyProfile?.company_name}
                              className="w-10 h-10 object-contain rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded">
                              N/A
                            </div>
                          )}

                          <div>
                            <span className="text-black-500 hover:underline cursor-pointer">
                              {companyProfile?.company_name || "N/A"}
                            </span>
                            <p className="text-gray-500 text-xs">
                              {companyProfile?.country
                                ? (() => {
                                    try {
                                      const parsed = JSON.parse(
                                        companyProfile.country
                                      );
                                      return parsed.label || "N/A";
                                    } catch (e) {
                                      return "N/A"; // Return 'N/A' if parsing fails
                                    }
                                  })()
                                : "N/A"}
                            </p>
                          </div>
                        </td>

                        <td className="py-2 px-4 border-b border-gray-300 text-sm">
                          {founderInfo?.founder_name || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300 text-sm">
                          {companyProfile?.industry_sector || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300 text-sm">
                          {companyProfile?.incorporation_date
                            ? new Date(
                                companyProfile.incorporation_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300 text-sm">
                          {companyProfile?.team_size || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300 text-sm">
                          {companyProfile?.current_stage || "N/A"}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300 text-sm">
                          {fundingInformation?.total_funding_ask
                            ? "Funded"
                            : "Not Funded"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handlePreviousPage}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition duration-200"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>No startups registered.</p>
          )}
        </div>
      </main>
      <Modal isOpen={!!selectedStartup} onClose={handleCloseModal}>
        <div>
          {selectedStartup && (
            <div className="flex flex-col lg:flex-row lg:space-x-4 w-full h-full max-h-[70vh]">
              {/* Left side */}
              <div className="flex-none lg:w-2/5 p-4 border-r border-gray-300 flex flex-col items-center">
                <div className="mb-4 flex flex-col items-center">
                  {selectedStartup?.company_logo && (
                    <img
                      src={selectedStartup?.company_logo}
                      alt={selectedStartup.company_profile?.company_name}
                      className="w-32 h-32 object-contain mb-4"
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2 text-center">
                    {selectedStartup.company_profile?.company_name || "N/A"}
                  </h2>
                </div>
                <div className="space-y-2 w-full lg:h-80 sm:h-56 h-48 overflow-y-auto">
                  <button
                    className={`w-full py-2 px-4 border rounded ${
                      activeTab === "startupProfile"
                        ? "bg-black-500 text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => {
                      setActiveTab("startupProfile");
                      setShowForm(false);
                    }}
                  >
                    Startup Profile
                  </button>
                  <button
                    className={`w-full py-2 px-4 border rounded ${
                      activeTab === "founderInfo"
                        ? "bg-black-500 text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => {
                      setActiveTab("founderInfo");
                      setShowForm(false);
                    }}
                  >
                    Founder Information
                  </button>
                  <button
                    className={`w-full py-2 px-4 border rounded ${
                      activeTab === "businessDetails"
                        ? "bg-black-500 text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => setActiveTab("businessDetails")}
                  >
                    Business Details
                  </button>
                  <button
                    className={`w-full py-2 px-4 border rounded ${
                      activeTab === "fundingInfo"
                        ? "bg-black-500 text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => setActiveTab("fundingInfo")}
                  >
                    Funding Information
                  </button>
                  <button
                    className={`w-full py-2 px-4 border rounded ${
                      activeTab === "companyDocuments"
                        ? "bg-black-500 text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => setActiveTab("companyDocuments")}
                  >
                    Company Documents
                  </button>
                  <button
                    className={`w-full py-2 px-4 border rounded ${
                      activeTab === "CTO_info"
                        ? "bg-black-500 text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => setActiveTab("CTO_info")}
                  >
                    CTO Info
                  </button>
                  <button
                    onClick={() => setActiveTab("gstInfo")}
                    className={`w-full py-2 px-4 border rounded ${
                      activeTab === "gstInfo"
                        ? "bg-black-500 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    GST Information
                  </button>
                </div>
              </div>
              {/* Right side */}
              <div className="flex-1 p-4 overflow-y-scroll">
                {showForm ? (
                  <div className="express-interest-form mt-4">
                    <Textarea
                      label={"Message to the Startup"}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message here"
                      className="w-full p-2 border rounded"
                    ></Textarea>
                    <div className="my-2">
                      <label className="form-label" htmlFor="date-time-picker1">
                        Slot 1
                      </label>
                      <Flatpickr
                        value={picker1}
                        data-enable-time
                        id="date-time-picker1"
                        className="form-control py-2"
                        onChange={(date) => setPicker1(date[0])}
                      />
                    </div>
                    <div className="my-2">
                      <label className="form-label" htmlFor="date-time-picker2">
                        Slot 2
                      </label>
                      <Flatpickr
                        value={picker2}
                        data-enable-time
                        id="date-time-picker2"
                        className="form-control py-2"
                        onChange={(date) => setPicker2(date[0])}
                      />
                    </div>
                    <div className="my-2">
                      <label className="form-label" htmlFor="date-time-picker3">
                        Slot 3
                      </label>
                      <Flatpickr
                        value={picker3}
                        data-enable-time
                        id="date-time-picker3"
                        className="form-control py-2"
                        onChange={(date) => setPicker3(date[0])}
                      />
                    </div>
                    <button
                      className="mr-1rem rounded-md py-2 px-4 border bg-[#14213d] text-white"
                      onClick={() => {
                        handleExpressInterest(
                          selectedStartup?.company_profile?.id,
                          user.id,
                          message,
                          [picker1, picker2, picker3] // Pass array of date times
                        );
                      }}
                    >
                      Send Interest
                    </button>
                    <button
                      className="rounded-md py-2 px-4 border bg-[#14213d] text-white"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {activeTab === "startupProfile" && (
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold mb-6">
                          Startup Profile
                        </h3>
                        <div className="grid gap-2 md:gap-3 lg:gap-4 text-gray-700">
                          {/* Short Description */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:document-text" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                SHORT DESCRIPTION
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {showFullDescription
                                  ? selectedStartup.company_profile
                                      ?.short_description
                                  : `${selectedStartup.company_profile?.short_description?.slice(
                                      0,
                                      100
                                    )}...`}
                                {selectedStartup.company_profile
                                  ?.short_description?.length > 100 && (
                                  <button
                                    onClick={() =>
                                      setShowFullDescription(
                                        !showFullDescription
                                      )
                                    }
                                    className="text-blue-600 hover:underline ml-2"
                                  >
                                    {showFullDescription
                                      ? "Read less"
                                      : "Read more"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>

                          {/* Date of Incorporation */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:calendar" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                DATE OF INCORPORATION
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile
                                  ?.incorporation_date
                                  ? new Date(
                                      selectedStartup.company_profile?.incorporation_date
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                          </li>

                          {/* Country and State/City */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:map" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                LOCATION
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile?.country
                                  ? JSON.parse(
                                      selectedStartup.company_profile.country
                                    ).label
                                  : "Not Provided"}
                                ,
                                {selectedStartup.company_profile?.state_city ||
                                  "Not Provided"}
                              </div>
                            </div>
                          </li>

                          {/* Office Address */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:building-office" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                OFFICE ADDRESS
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile
                                  ?.office_address || "N/A"}
                              </div>
                            </div>
                          </li>

                          {/* Industry Sector */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:tag" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                INDUSTRY SECTOR
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile
                                  ?.industry_sector || "N/A"}
                              </div>
                            </div>
                          </li>

                          {/* Team Size */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:users" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                TEAM SIZE
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile?.team_size ||
                                  "N/A"}
                              </div>
                            </div>
                          </li>

                          {/* Current Stage */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:chart-bar" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                CURRENT STAGE
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile
                                  ?.current_stage || "N/A"}
                              </div>
                            </div>
                          </li>

                          {/* Target Audience */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:flag" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                TARGET AUDIENCE
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile
                                  ?.target_audience || "N/A"}
                              </div>
                            </div>
                          </li>

                          {/* USP/MOAT */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:light-bulb" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                USP/MOAT
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {showFullUSP
                                  ? selectedStartup.company_profile?.usp_moat
                                  : `${selectedStartup.company_profile?.usp_moat?.slice(
                                      0,
                                      100
                                    )}...`}
                                {selectedStartup.company_profile?.usp_moat
                                  ?.length > 100 && (
                                  <button
                                    onClick={() => setShowFullUSP(!showFullUSP)}
                                    className="text-blue-600 hover:underline ml-2"
                                  >
                                    {showFullUSP ? "Read less" : "Read more"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>

                          {/* Website */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:globe-alt" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                WEBSITE
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                <a
                                  href={
                                    selectedStartup.company_profile
                                      ?.company_website
                                  }
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {selectedStartup.company_profile
                                    ?.company_website || "N/A"}
                                </a>
                              </div>
                            </div>
                          </li>

                          {/* LinkedIn Profile */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:link" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                LINKEDIN PROFILE
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                <a
                                  href={
                                    selectedStartup.company_profile
                                      ?.linkedin_profile
                                  }
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {selectedStartup.company_profile
                                    ?.linkedin_profile || "N/A"}
                                </a>
                              </div>
                            </div>
                          </li>

                          {/* Media Presence */}
                          <li className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:document" />
                            </div>
                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                MEDIA PRESENCE
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {selectedStartup.company_profile?.media ||
                                  "N/A"}
                              </div>
                            </div>
                          </li>

                          {/* Social Media Handles */}
                          {selectedStartup.company_profile?.social_media_handles?.map(
                            (handle, index) => (
                              <li
                                className="flex space-x-3 rtl:space-x-reverse"
                                key={index}
                              >
                                <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                                  <Icon icon="heroicons:share" />
                                </div>
                                <div className="flex-1">
                                  <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                    {handle.platform || "Not provided"}
                                  </div>
                                  <a
                                    href={handle.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-slate-600 dark:text-slate-50"
                                  >
                                    {handle.url || "Not provided"}
                                  </a>
                                </div>
                              </li>
                            )
                          )}

                          {/* Media Presence Links */}
                          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                            Media Presence Links
                          </h3>
                          {selectedStartup.company_profile?.media_presence?.map(
                            (presence, index) => (
                              <li
                                className="flex space-x-3 rtl:space-x-reverse"
                                key={index}
                              >
                                <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                                  <Icon icon="heroicons:newspaper" />
                                </div>
                                <div className="flex-1">
                                  <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                    {presence.platform || "Not provided"}
                                  </div>
                                  <a
                                    href={presence.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base text-slate-600 dark:text-slate-50"
                                  >
                                    {presence.url || "Not provided"}
                                  </a>
                                </div>
                              </li>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "founderInfo" && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold mb-6">Founder Details</h3>
                    <div className="grid gap-2 md:gap-3 lg:gap-4 text-gray-700">
                      {/* Founder Name */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:user" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            FOUNDER NAME
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup.company_profile
                              ?.founder_information?.founder_name ||
                              "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* Founder Email */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:envelope" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            FOUNDER EMAIL
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup.company_profile
                              ?.founder_information?.founder_email ||
                              "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* Founder Mobile */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:phone" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            FOUNDER MOBILE
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup.company_profile
                              ?.founder_information?.founder_mobile ||
                              "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* Founder LinkedIn */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:link" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            FOUNDER LINKEDIN
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            <a
                              href={
                                selectedStartup.company_profile
                                  ?.founder_information?.founder_linkedin
                              }
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedStartup.company_profile
                                ?.founder_information?.founder_linkedin ||
                                "Not provided"}
                            </a>
                          </div>
                        </div>
                      </li>

                      {/* College Name */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:building-library" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            COLLEGE NAME
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup.company_profile
                              ?.founder_information?.college_name ||
                              "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* Graduation Year */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:calendar" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            GRADUATION YEAR
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup.company_profile
                              ?.founder_information?.graduation_year ||
                              "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* Advisors Section */}
                      {selectedStartup.company_profile?.founder_information?.advisors?.map(
                        (advisor, index) => (
                          <li
                            key={index}
                            className="flex space-x-3 rtl:space-x-reverse"
                          >
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:user-group" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Advisor Name: ${
                                  advisor.advisor_name || "Not provided"
                                }`}
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Advisor Email: ${
                                  advisor.advisor_email || "Not provided"
                                }`}
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Advisor Mobile: ${
                                  advisor.advisor_mobile || "Not provided"
                                }`}
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Advisor LinkedIn: ${
                                  advisor.advisor_linkedin || "Not provided"
                                }`}
                              </div>
                            </div>
                          </li>
                        )
                      )}

                      {/* Co-Founders Section */}
                      {selectedStartup.company_profile?.founder_information?.co_founders?.map(
                        (coFounder, index) => (
                          <li
                            key={index}
                            className="flex space-x-3 rtl:space-x-reverse"
                          >
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:user-group" />
                            </div>
                            <div className="flex-1">
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Co-Founder Name: ${
                                  coFounder.co_founder_name || "Not provided"
                                }`}
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Co-Founder Email: ${
                                  coFounder.co_founder_email || "Not provided"
                                }`}
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Co-Founder Mobile: ${
                                  coFounder.co_founder_mobile || "Not provided"
                                }`}
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                {`Co-Founder LinkedIn: ${
                                  coFounder.co_founder_linkedin ||
                                  "Not provided"
                                }`}
                              </div>
                            </div>
                          </li>
                        )
                      )}

                      {/* Co-Founder Agreement */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            CO-FOUNDER AGREEMENT
                          </div>
                          <a
                            href={
                              selectedStartup.company_profile
                                ?.founder_information?.co_founder_agreement ||
                              "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedStartup.company_profile
                              ?.founder_information?.co_founder_agreement
                              ? "View Technology Roadmap"
                              : "Not provided"}
                          </a>
                        </div>
                      </li>
                    </div>
                  </div>
                )}

                {activeTab === "businessDetails" && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold mb-6">
                      Business Details
                    </h3>
                    <div className="grid gap-2 md:gap-3 lg:gap-4 text-gray-700">
                      {/* Current Traction */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:presentation-chart-line" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            CURRENT TRACTION
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.business_details
                              ?.current_traction || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* New Customers */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:user-plus" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            HOW MANY NEW CUSTOMERS YOU OBTAINED IN THE LAST 6
                            MONTHS?
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.business_details
                              ?.new_Customers || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* Customer Acquisition Cost */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:banknotes" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            WHAT IS YOUR CUSTOMER ACQUISITION COST?
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.business_details
                              ?.customer_AcquisitionCost || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* Customer Lifetime Value */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:currency-dollar" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            WHAT IS THE LIFETIME VALUE OF YOUR CUSTOMER?
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.business_details
                              ?.customer_Lifetime_Value || "N/A"}
                          </div>
                        </div>
                      </li>
                    </div>
                  </div>
                )}

                {activeTab === "fundingInfo" && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold mb-6">
                      Funding Information
                    </h3>
                    <div className="grid gap-2 md:gap-3 lg:gap-4 text-gray-700">
                      {/* Total Funding Ask */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:currency-dollar" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            TOTAL FUNDING ASK
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.total_funding_ask || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* Amount Committed */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:banknotes" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            AMOUNT COMMITTED
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.amount_committed || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* Government Grants */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:clipboard-document-check" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            GOVERNMENT GRANTS
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.government_grants || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* Equity Split */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:chart-pie" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            EQUITY SPLIT
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.equity_split || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* Fund Utilization */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document-text" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            FUND UTILIZATION
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.fund_utilization || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* ARR */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:chart-bar" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            ARR
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.arr || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* MRR */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:chart-bar" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            MRR
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.mrr || "N/A"}
                          </div>
                        </div>
                      </li>

                      {/* Current Cap Table */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            CURRENT CAP TABLE
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile
                              ?.funding_information?.current_cap_table ? (
                              <a
                                href={
                                  selectedStartup?.company_profile
                                    ?.funding_information?.current_cap_table
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Document
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>
                      </li>

                      {/* Previous Funding Information */}
                      <div className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:banknotes" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px] mb-4">
                            PREVIOUS FUNDING INFORMATION
                          </div>
                          <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                              <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                                  <thead className="bg-slate-200 dark:bg-slate-700">
                                    <tr>
                                      <th scope="col" className="table-th">
                                        Investor Name
                                      </th>
                                      <th scope="col" className="table-th">
                                        Firm Name
                                      </th>
                                      <th scope="col" className="table-th">
                                        Investor Type
                                      </th>
                                      <th scope="col" className="table-th">
                                        Amount Raised
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700">
                                    {selectedStartup?.company_profile?.funding_information?.previous_funding?.map(
                                      (funding, index) => (
                                        <tr key={index}>
                                          <td className="table-td">
                                            {funding.investorName ||
                                              "Not provided"}
                                          </td>
                                          <td className="table-td">
                                            {funding.firmName || "Not provided"}
                                          </td>
                                          <td className="table-td">
                                            {funding.investorType ||
                                              "Not provided"}
                                          </td>
                                          <td className="table-td">
                                            {funding.amountRaised
                                              ? `$${funding.amountRaised}`
                                              : "Not provided"}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cap Table */}
                      <div className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 leading-[12px] mb-3">
                            CAP TABLE
                          </div>
                          <div className="overflow-x-auto">
                            <div className="inline-block min-w-full align-middle">
                              <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                                  <thead className="bg-slate-200 dark:bg-slate-700">
                                    <tr>
                                      <th scope="col" className="table-th">
                                        Designation
                                      </th>
                                      <th scope="col" className="table-th">
                                        Name
                                      </th>
                                      <th scope="col" className="table-th">
                                        Percentage
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-700">
                                    {selectedStartup?.company_profile?.funding_information?.cap_table?.map(
                                      (entry, index) => (
                                        <tr key={index}>
                                          <td className="table-td">
                                            {entry.designation ||
                                              "Designation not specified"}
                                          </td>
                                          <td className="table-td">
                                            {entry.firstName ||
                                              "Name not specified"}
                                          </td>
                                          <td className="table-td">
                                            {entry.percentage
                                              ? `${entry.percentage}%`
                                              : "Not provided"}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "CTO_info" && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold mb-6">CTO Details</h3>
                    <div className="grid gap-2 md:gap-3 lg:gap-4 text-gray-700">
                      {/* CTO Name */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:user" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            CTO NAME
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.CTO_info
                              ?.cto_name || "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* CTO Email */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:envelope" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            EMAIL
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.CTO_info
                              ?.cto_email || "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* CTO Mobile */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:phone" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            MOBILE NUMBER
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.CTO_info
                              ?.cto_mobile || "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* CTO LinkedIn */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:link" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            LINKEDIN PROFILE
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            <a
                              href={
                                selectedStartup?.company_profile?.CTO_info
                                  ?.cto_linkedin || "#"
                              }
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedStartup?.company_profile?.CTO_info
                                ?.cto_linkedin || "Not provided"}
                            </a>
                          </div>
                        </div>
                      </li>

                      {/* Tech Team Size */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:users" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            TECH TEAM SIZE
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            {selectedStartup?.company_profile?.CTO_info
                              ?.tech_team_size || "Not provided"}
                          </div>
                        </div>
                      </li>

                      {/* Mobile App Link (iOS) */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:link" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            MOBILE APP LINK (iOS)
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            <a
                              href={
                                selectedStartup?.company_profile?.CTO_info
                                  ?.mobile_app_link_ios || "#"
                              }
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedStartup?.company_profile?.CTO_info
                                ?.mobile_app_link_ios || "Not provided"}
                            </a>
                          </div>
                        </div>
                      </li>

                      {/* Mobile App Link (Android) */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:link" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            MOBILE APP LINK (Android)
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            <a
                              href={
                                selectedStartup?.company_profile?.CTO_info
                                  ?.mobile_app_link_android || "#"
                              }
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedStartup?.company_profile?.CTO_info
                                ?.mobile_app_link_android || "Not provided"}
                            </a>
                          </div>
                        </div>
                      </li>

                      {/* Technology Roadmap */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            TECHNOLOGY ROADMAP
                          </div>
                          <div className="text-base text-slate-600 dark:text-slate-50">
                            <a
                              href={
                                selectedStartup?.company_profile?.CTO_info
                                  ?.technology_roadmap || "#"
                              }
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedStartup?.company_profile?.CTO_info
                                ?.technology_roadmap
                                ? "View Technology Roadmap"
                                : "Not provided"}
                            </a>
                          </div>
                        </div>
                      </li>
                    </div>
                  </div>
                )}
                {activeTab === "companyDocuments" && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold mb-6">
                      Company Documents
                    </h3>
                    <div className="grid gap-2 md:gap-3 lg:gap-4 text-gray-700">
                      {/* Certificate of Incorporation */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            CERTIFICATE OF INCORPORATION
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]
                                ?.certificate_of_incorporation || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]
                              ?.certificate_of_incorporation
                              ? "View Certificate"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* GST Certificate */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            GST CERTIFICATE
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.gst_certificate || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.gst_certificate
                              ? "View Certificate"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Trademark */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            TRADEMARK
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.trademark || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.trademark
                              ? "View Trademark"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Copyright */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            COPYRIGHT
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.copyright || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.copyright
                              ? "View Copyright"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Patent */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            PATENT
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.patent || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.patent
                              ? "View Patent"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Startup India Certificate */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            STARTUP INDIA CERTIFICATE
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]
                                ?.startup_india_certificate || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.startup_india_certificate
                              ? "View Certificate"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Due Diligence Report */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            DUE DILIGENCE REPORT
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.due_diligence_report ||
                              "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.due_diligence_report
                              ? "View Report"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Business Valuation Report */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            BUSINESS VALUATION REPORT
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]
                                ?.business_valuation_report || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.business_valuation_report
                              ? "View Report"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* MIS */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            MIS
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.mis || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.mis
                              ? "View MIS"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Financial Projections */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            FINANCIAL PROJECTIONS
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.financial_projections ||
                              "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.financial_projections
                              ? "View Projections"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Balance Sheet */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            BALANCE SHEET
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.balance_sheet || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.balance_sheet
                              ? "View Balance Sheet"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* P&L Statement */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            P&L STATEMENT
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.pl_statement || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.pl_statement
                              ? "View P&L Statement"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Cashflow Statement */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            CASHFLOW STATEMENT
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.cashflow_statement ||
                              "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.cashflow_statement
                              ? "View Cashflow Statement"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Pitch Deck */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            PITCH DECK
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.pitch_deck || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.pitch_deck
                              ? "View Pitch Deck"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Video Pitch */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            VIDEO PITCH
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.video_pitch || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.video_pitch
                              ? "View Video Pitch"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* SHA (Previous/Existing Round) */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            SHA (PREVIOUS/EXISTING ROUND)
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.sha || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.sha
                              ? "View SHA"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Termsheet (Previous/Existing Round) */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            TERMSHEET (PREVIOUS/EXISTING ROUND)
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.termsheet || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.termsheet
                              ? "View Termsheet"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* Employment Agreement */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            EMPLOYMENT AGREEMENT
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.employment_agreement ||
                              "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.employment_agreement
                              ? "View Agreement"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* MoU */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            MOU
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.mou || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.mou
                              ? "View MoU"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>

                      {/* NDA */}
                      <li className="flex space-x-3 rtl:space-x-reverse">
                        <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                          <Icon icon="heroicons:document" />
                        </div>
                        <div className="flex-1">
                          <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                            NDA
                          </div>
                          <a
                            href={
                              selectedStartup?.company_profile
                                ?.company_documents[0]?.nda || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-slate-600 dark:text-slate-50"
                          >
                            {selectedStartup?.company_profile
                              ?.company_documents[0]?.nda
                              ? "View NDA"
                              : "Not Provided"}
                          </a>
                        </div>
                      </li>
                    </div>
                  </div>
                )}

                {activeTab === "gstInfo" && (
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold mb-6">GST Information</h3>
                    {loadingGstInformation ? ( // Assuming you have a state variable `loadingGstInformation` to track loading
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                      </div>
                    ) : gstInformation ? (
                      <div className="grid gap-2 md:gap-3 lg:gap-4 text-gray-700">
                        {/* GSTIN */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:document-text" />
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              GSTIN
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.gstin || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Legal Name */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:user" />
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              LEGAL NAME
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.legal_name || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Business Constitution */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:briefcase" />
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              BUSINESS CONSTITUTION
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.business_constitution || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Aggregate Turnover */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:currency-dollar" />{" "}
                            {/* Icon for money/cash */}
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              AGGREGATE TURNOVER
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.aggregate_turn_over || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Current Registration Status */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:credit-card" />{" "}
                            {/* Icon for status/check */}
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              CURRENT REGISTRATION STATUS
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.current_registration_status ||
                                "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* State Jurisdiction */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:map" />{" "}
                            {/* Icon for location */}
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              STATE JURISDICTION
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.state_jurisdiction || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Central Jurisdiction */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:map" />{" "}
                            {/* Icon for map/jurisdiction */}
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              CENTRAL JURISDICTION
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.central_jurisdiction || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Taxpayer Type */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:document" />
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              TAXPAYER TYPE
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.tax_payer_type || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Authorized Signatories */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:user-group" />
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              AUTHORIZED SIGNATORIES
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              {gstInformation.authorized_signatory?.join(
                                ", "
                              ) || "N/A"}
                            </div>
                          </div>
                        </li>

                        {/* Business Details */}
                        <li className="flex space-x-3 rtl:space-x-reverse">
                          <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                            <Icon icon="heroicons:briefcase" />
                          </div>
                          <div className="flex-1">
                            <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                              BUSINESS DETAILS
                            </div>
                            <div className="text-base text-slate-600 dark:text-slate-50">
                              <ul>
                                {gstInformation.business_details?.bzsdtls?.map(
                                  (detail, index) => (
                                    <div key={index}>
                                      • {detail.sdes} ({detail.saccd})
                                    </div>
                                  )
                                ) || "N/A"}
                              </ul>
                            </div>
                          </div>
                        </li>

                        {/* Filing Status (Last 3 months) */}
                        <li className="flex space-x-3 rtl:space-x-reverse list-none">
                          <div className="flex space-x-3 rtl:space-x-reverse">
                            <div className="flex-none text-2xl text-slate-600 dark:text-slate-300">
                              <Icon icon="heroicons:credit-card" />
                            </div>

                            <div className="flex-1">
                              <div className="uppercase text-xs text-slate-500 dark:text-slate-300 mb-1 leading-[12px]">
                                FILING STATUS (LAST 3 MONTHS)
                              </div>
                              <div className="text-base text-slate-600 dark:text-slate-50">
                                <table className="min-w-full bg-white dark:bg-slate-800">
                                  <thead>
                                    <tr>
                                      <th className="py-2 px-4 text-left">
                                        FY
                                      </th>
                                      <th className="py-2 px-4 text-left">
                                        Tax Period
                                      </th>
                                      <th className="py-2 px-4 text-left">
                                        Return Type
                                      </th>
                                      <th className="py-2 px-4 text-left">
                                        Date of Filing
                                      </th>
                                      <th className="py-2 px-4 text-left">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {gstInformation.filing_status?.[0]
                                      ?.slice(0, 3)
                                      .map((filing, index) => (
                                        <tr key={index}>
                                          <td className="border-t py-2 px-4">
                                            {filing.fy}
                                          </td>
                                          <td className="border-t py-2 px-4">
                                            {filing.taxp}
                                          </td>
                                          <td className="border-t py-2 px-4">
                                            {filing.rtntype}
                                          </td>
                                          <td className="border-t py-2 px-4">
                                            {filing.dof}
                                          </td>
                                          <td className="border-t py-2 px-4">
                                            {filing.status}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </li>

                        {/* Add more fields as necessary */}
                      </div>
                    ) : (
                      <p>Startup hasn't registered for GST.</p>
                    )}
                  </div>
                )}

                <div className="flex justify-center items-center mt-4">
                  {" "}
                  <DocumentSubmissionModal
                    id={selectedStartup?.company_profile?.id}
                  />
                  <button
                    className="btn btn-outline-dark flex justify-between ml-10"
                    onClick={() => {
                      handleImageClick("investment", selectedStartup);
                    }}
                  >
                    Investment Readiness Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      {/* Modal for Upload Startup */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Upload New Startup</h2>

          {/* Tabs for different sections */}
          <div className="flex mb-4">
            {[
              "startupProfile",
              "founderInfo",
              "businessDetails",
              "fundingInfo",
              "companyDocuments",
              "CTO_info",
              "gstInfo",
            ].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 mr-2 ${
                  activeUploadTab === tab
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                } rounded`}
                onClick={() => setActiveUploadTab(tab)}
              >
                {tab.replace(/([A-Z])/g, " $1").toUpperCase()}
              </button>
            ))}
          </div>

          {/* Content for each tab */}
          {activeUploadTab === "startupProfile" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Short Description"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "short_description",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="date"
                placeholder="Date of Incorporation"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "incorporation_date",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Location (Country, State/City)"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "location",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Office Address"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "office_address",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Industry Sector"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "industry_sector",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="number"
                placeholder="Team Size"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "team_size",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Current Stage"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "current_stage",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Target Audience"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "target_audience",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <textarea
                placeholder="USP/MOAT"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "usp_moat",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Website"
                onChange={(e) =>
                  handleInputChange("startupProfile", "website", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="LinkedIn Profile"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "linkedin_profile",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <textarea
                placeholder="Media Presence"
                onChange={(e) =>
                  handleInputChange(
                    "startupProfile",
                    "media_presence",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {activeUploadTab === "founderInfo" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Founder Name"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "founder_name",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="email"
                placeholder="Founder Email"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "founder_email",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Founder Mobile"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "founder_mobile",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Founder LinkedIn"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "founder_linkedin",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="College Name"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "college_name",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="number"
                placeholder="Graduation Year"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "graduation_year",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Advisor Name"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "advisor_name",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="email"
                placeholder="Advisor Email"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "advisor_email",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Advisor Mobile"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "advisor_mobile",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Advisor LinkedIn"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "advisor_linkedin",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Co-Founder Name"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "co_founder_name",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="email"
                placeholder="Co-Founder Email"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "co_founder_email",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Co-Founder Mobile"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "co_founder_mobile",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Co-Founder LinkedIn"
                onChange={(e) =>
                  handleInputChange(
                    "founderInfo",
                    "co_founder_linkedin",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {activeUploadTab === "businessDetails" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Current Traction"
                onChange={(e) =>
                  handleInputChange(
                    "businessDetails",
                    "current_traction",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="number"
                placeholder="New Customers in Last 6 Months"
                onChange={(e) =>
                  handleInputChange(
                    "businessDetails",
                    "new_customers",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Customer Acquisition Cost"
                onChange={(e) =>
                  handleInputChange(
                    "businessDetails",
                    "customer_acquisition_cost",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Customer Lifetime Value"
                onChange={(e) =>
                  handleInputChange(
                    "businessDetails",
                    "customer_lifetime_value",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {activeUploadTab === "fundingInfo" && (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Total Funding Ask"
                onChange={(e) =>
                  handleInputChange(
                    "fundingInfo",
                    "total_funding_ask",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="number"
                placeholder="Amount Committed"
                onChange={(e) =>
                  handleInputChange(
                    "fundingInfo",
                    "amount_committed",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Government Grants"
                onChange={(e) =>
                  handleInputChange(
                    "fundingInfo",
                    "government_grants",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Equity Split"
                onChange={(e) =>
                  handleInputChange(
                    "fundingInfo",
                    "equity_split",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="Fund Utilization"
                onChange={(e) =>
                  handleInputChange(
                    "fundingInfo",
                    "fund_utilization",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="number"
                placeholder="ARR"
                onChange={(e) =>
                  handleInputChange("fundingInfo", "arr", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="number"
                placeholder="MRR"
                onChange={(e) =>
                  handleInputChange("fundingInfo", "mrr", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <textarea
                placeholder="Previous Funding Information"
                onChange={(e) =>
                  handleInputChange(
                    "fundingInfo",
                    "previous_funding_info",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <textarea
                placeholder="Cap Table"
                onChange={(e) =>
                  handleInputChange("fundingInfo", "cap_table", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {activeUploadTab === "companyDocuments" && (
            <div className="space-y-3">
              <input
                type="url"
                placeholder="Certificate of Incorporation"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "certificate_of_incorporation",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="GST Certificate"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "gst_certificate",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Trademark"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "trademark",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Copyright"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "copyright",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Patent"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "patent",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Startup India Certificate"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "startup_india_certificate",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Business Valuation Report"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "business_valuation_report",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="MIS"
                onChange={(e) =>
                  handleInputChange("companyDocuments", "mis", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Financial Projections"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "financial_projections",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Balance Sheet"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "balance_sheet",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="P&L Statement"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "pl_statement",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Cashflow Statement"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "cashflow_statement",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Pitch Deck"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "pitch_deck",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Video Pitch"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "video_pitch",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="SHA (Previous/Existing Round)"
                onChange={(e) =>
                  handleInputChange("companyDocuments", "sha", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Termsheet (Previous/Existing Round)"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "termsheet",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Employment Agreement"
                onChange={(e) =>
                  handleInputChange(
                    "companyDocuments",
                    "employment_agreement",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="MoU"
                onChange={(e) =>
                  handleInputChange("companyDocuments", "mou", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="NDA"
                onChange={(e) =>
                  handleInputChange("companyDocuments", "nda", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {activeUploadTab === "CTO_info" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="CTO Name"
                onChange={(e) =>
                  handleInputChange("CTO_info", "cto_name", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="email"
                placeholder="CTO Email"
                onChange={(e) =>
                  handleInputChange("CTO_info", "cto_email", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                placeholder="CTO Mobile"
                onChange={(e) =>
                  handleInputChange("CTO_info", "cto_mobile", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="CTO LinkedIn"
                onChange={(e) =>
                  handleInputChange("CTO_info", "cto_linkedin", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="number"
                placeholder="Tech Team Size"
                onChange={(e) =>
                  handleInputChange(
                    "CTO_info",
                    "tech_team_size",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Mobile App Link (iOS)"
                onChange={(e) =>
                  handleInputChange(
                    "CTO_info",
                    "mobile_app_link_ios",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Mobile App Link (Android)"
                onChange={(e) =>
                  handleInputChange(
                    "CTO_info",
                    "mobile_app_link_android",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
              <input
                type="url"
                placeholder="Technology Roadmap"
                onChange={(e) =>
                  handleInputChange(
                    "CTO_info",
                    "technology_roadmap",
                    e.target.value
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded w-full"
              />
            </div>
          )}

          {/* Button to save new startup */}
          <div className="mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSaveNewStartup}
            >
              Upload Startup
            </button>
          </div>
        </div>
      </Modal>

      {/* Table to Display Startups */}
      {/* Render the table of startups here */}
    </>
  );
};

export default CuratedDealflow;
