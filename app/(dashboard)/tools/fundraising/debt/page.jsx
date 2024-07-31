"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Ensure correct import from 'next/navigation'
import { supabase } from "../../../../../lib/supabaseclient";

const Equity = () => {
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showPanModal, setShowPanModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [panCard, setPanCard] = useState("");
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
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
      .select("name, email, mobile, user_type, status, linkedin_profile, company_name, pan_number")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      const requiredFields = ["name", "email", "mobile", "user_type", "status", "linkedin_profile", "company_name"];
      const isComplete = requiredFields.every(field => data[field]);
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

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
        <h1>Hello from Debt</h1>
    </div>
  );
};

export default Equity;
