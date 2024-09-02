import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseclient";
import { toast } from 'react-toastify';

const WalletModal = ({ isOpen, onClose, user }) => {
  const [newPayment, setNewPayment] = useState({
    product: "",
    type: "",
    plan: "",
    dateOfPayment: "",
    modeOfPayment: "",
    price: 0,
  });

  const [addCredit, setAddCredit] = useState(0);
  const [creditBalance, setCreditBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [walletDetails, setWalletDetails] = useState([]);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [showAddCreditForm, setShowAddCreditForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ensure pricingDetails is defined at the top level of the component
  const pricingDetails = {
    "Fundraising - Equity": { subscriptionMonthly: 5000, subscriptionAnnually: 60000 },
    "Fundraising - Debt": { subscriptionMonthly: 3500, subscriptionAnnually: 42000 },
    "Pitch Deck Creation": { onDemand: 30000 },
    "Company Incorporation": { onDemand: 20000 },
    "GST certification": { onDemand: 3000 },
    "Start-up India registration": { onDemand: 5000 },
    "Trademark registration": { onDemand: 10000 },
    "Annual secretarial compliance + companies act compliance calendar (basic plan and not event based)": { onDemand: "On Demand" },
    "NDA/employment contracts/founder agreement/resolution drafts/business contracts": { onDemand: "On Demand" },
    "Valuation certificate": { onDemand: "On Demand" },
    "Auditor onboarding": { onDemand: "On Demand" },
    "Talent hiring (venture studio + digital marketing)": { onDemand: "On Demand" },
    "Connect with Incubators": { subscriptionMonthly: 1200, subscriptionAnnually: 14400 },
  };

  const products = Object.keys(pricingDetails);

  useEffect(() => {
    if (isOpen && user) {
      fetchWalletDetails(); // Fetch wallet details when the modal opens
    }
  }, [isOpen, user]);

  const fetchWalletDetails = async () => {
    setLoading(true); // Start loading
    try {
      const { data: walletCredits, error: creditError } = await supabase
        .from("wallet_credits")
        .select("*")
        .eq("startup_id", user.id);

      if (creditError) {
        console.error("Error fetching credit details:", creditError.message);
        toast.error("Error fetching credit details: " + creditError.message);
        return;
      }

      if (walletCredits.length === 0) {
        setCreditBalance(0);
        setReferralEarnings(0);
      } else if (walletCredits.length === 1) {
        setCreditBalance(walletCredits[0].credit_balance || 0);
        setReferralEarnings(walletCredits[0].referral_balance || 0);
      } else {
        console.error("Multiple credit entries found for the same startup ID.");
        toast.error("Error: Multiple credit entries found for this startup.");
        return;
      }

      const { data: walletData, error: walletError } = await supabase
        .from("wallet_payments")
        .select("*")
        .eq("startup_id", user.id);

      if (walletError) {
        console.error("Error fetching wallet details:", walletError.message);
        toast.error("Error fetching wallet details: " + walletError.message);
        return;
      }

      setWalletDetails(walletData || []);
    } catch (err) {
      console.error("Unexpected error fetching wallet details:", err.message || err);
      toast.error("Unexpected error: " + (err.message || err));
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleProductChange = (e) => {
    const selectedProduct = e.target.value;
    setNewPayment({
      ...newPayment,
      product: selectedProduct,
      type: "",
      plan: "",
      price: 0,
    });
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    const selectedProduct = newPayment.product;
    let price = 0;

    if (selectedProduct && pricingDetails[selectedProduct]) {
      if (selectedType === "Subscription") {
        price = pricingDetails[selectedProduct].subscriptionMonthly || 0;
      } else if (selectedType === "On Demand") {
        price = ""; // Allow manual input for "On Demand" price
      }
    }

    setNewPayment({
      ...newPayment,
      type: selectedType,
      price: price,
      plan: selectedType === "On Demand" ? "" : newPayment.plan,
    });
  };

  const handlePlanChange = (e) => {
    const selectedPlan = e.target.value;
    const selectedProduct = newPayment.product;
    const selectedType = newPayment.type;
    let price = 0;

    if (selectedType === "Subscription" && selectedProduct && pricingDetails[selectedProduct]) {
      price = selectedPlan === "Monthly"
        ? pricingDetails[selectedProduct].subscriptionMonthly || 0
        : pricingDetails[selectedProduct].subscriptionAnnually || 0;
    }

    setNewPayment({
      ...newPayment,
      plan: selectedPlan,
      price: price,
    });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      toast.error("User ID is not available. Please wait...");
      return;
    }

    const generateTransactionId = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let transactionId = "";
      for (let i = 0; i < 12; i++) {
        transactionId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return transactionId;
    };

    const transactionId = generateTransactionId();

    try {
      const { data: startupCheck, error: startupCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (startupCheckError) {
        console.error("Supabase error fetching startup ID:", startupCheckError.message);
        toast.error("Error checking startup ID: " + startupCheckError.message);
        return;
      }

      if (!startupCheck) {
        console.error("Startup ID does not exist or could not be verified.");
        toast.error("Startup ID does not exist or is invalid.");
        return;
      }

      const { error } = await supabase.from("wallet_payments").insert({
        startup_id: user.id,
        product: newPayment.product,
        type: newPayment.type,
        price: newPayment.price,
        plan: newPayment.plan,
        transaction_id: transactionId,
        date_of_payment: newPayment.dateOfPayment,
        mode_of_payment: newPayment.modeOfPayment,
      });

      if (error) {
        console.error("Error updating wallet details:", error.message);
        toast.error("Error updating wallet details: " + error.message);
      } else {
        toast.success("Payment details updated successfully!");
        setShowNewPaymentForm(false);
        fetchWalletDetails();
      }
    } catch (err) {
      console.error("Unexpected error updating wallet details:", err.message || err);
      toast.error("Unexpected error: " + (err.message || err));
    }
  };

  const handleSubmitCredit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      toast.error("User ID is not available. Please wait...");
      return;
    }

    try {
      const { data: existingCredits, error: fetchError } = await supabase
        .from("wallet_credits")
        .select("*")
        .eq("startup_id", user.id);

      if (fetchError) {
        console.error("Error fetching existing credits:", fetchError.message);
        toast.error("Error fetching existing credits: " + fetchError.message);
        return;
      }

      if (existingCredits.length === 0) {
        const { error: insertError } = await supabase.from("wallet_credits").insert({
          startup_id: user.id,
          credit_balance: parseFloat(addCredit),
          referral_balance: referralEarnings,
        });

        if (insertError) {
          console.error("Error adding credits:", insertError.message);
          toast.error("Error adding credits: " + insertError.message);
        } else {
          toast.success("Credits added successfully!");
          setCreditBalance(parseFloat(addCredit));
          setShowAddCreditForm(false);
          fetchWalletDetails();
        }
      } else if (existingCredits.length === 1) {
        const existingCredit = existingCredits[0];
        const { error: updateError } = await supabase
          .from("wallet_credits")
          .update({ credit_balance: parseFloat(existingCredit.credit_balance) + parseFloat(addCredit) })
          .eq("startup_id", user.id);

        if (updateError) {
          console.error("Error adding credits:", updateError.message);
          toast.error("Error adding credits: " + updateError.message);
        } else {
          toast.success("Credits added successfully!");
          setCreditBalance((prev) => prev + parseFloat(addCredit));
          setShowAddCreditForm(false);
          fetchWalletDetails();
        }
      } else {
        console.error("Multiple credit entries found for the same startup ID.");
        toast.error("Error: Multiple credit entries found for this startup.");
      }
    } catch (err) {
      console.error("Unexpected error adding credits:", err.message || err);
      toast.error("Unexpected error: " + (err.message || err));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const getPriceDisplay = (detail) => {
    if (detail.type === "Subscription") {
      return detail.plan === "Monthly"
        ? `${pricingDetails[detail.product]?.subscriptionMonthly || 0}`
        : `${pricingDetails[detail.product]?.subscriptionAnnually || 0}`;
    }
    return detail.price;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto transition-transform transform-gpu duration-500 ease-in-out mt-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center">
          Wallet Details for {user ? user.name : "Unknown User"}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-10 w-10"></div>
          </div>
        ) : (
          <>
            {/* Current Credit and Referral Earnings */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg shadow-inner mb-6">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="text-gray-500 uppercase tracking-wide text-xs">
                    <th className="py-3 px-5 text-left">Current Credit</th>
                    <th className="py-3 px-5 text-left">Referral Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-gray-800 font-semibold">
                    <td className="py-3 px-5">{creditBalance}</td>
                    <td className="py-3 px-5">{referralEarnings}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Existing Wallet Details */}
            <div className="overflow-hidden rounded-lg shadow-lg mb-6 border border-gray-200">
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-200 to-blue-200 text-gray-800 uppercase tracking-wide text-xs">
                    <th className="py-3 px-5 text-left">Product</th>
                    <th className="py-3 px-5 text-left">Type</th>
                    <th className="py-3 px-5 text-left">Plan</th>
                    <th className="py-3 px-5 text-left">Price</th>
                    <th className="py-3 px-5 text-left">Transaction ID</th>
                    <th className="py-3 px-5 text-left">Mode of Payment</th>
                    <th className="py-3 px-5 text-left">Date of Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {walletDetails.length > 0 ? (
                    walletDetails.map((detail, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 transition duration-300 ease-in-out text-gray-700"
                      >
                        <td className="py-3 px-5">{detail.product}</td>
                        <td className="py-3 px-5">{detail.type}</td>
                        <td className="py-3 px-5">{detail.plan || 'N/A'}</td>
                        <td className="py-3 px-5">{getPriceDisplay(detail)}</td>
                        <td className="py-3 px-5">{detail.transaction_id}</td>
                        <td className="py-3 px-5">{detail.mode_of_payment || 'N/A'}</td>
                        <td className="py-3 px-5">{formatDate(detail.date_of_payment)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-3 px-5 text-center text-gray-500 italic"
                      >
                        No payment details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Buttons to Add New Payment and Add Credits */}
        <div className="flex justify-end mb-6 space-x-3">
          <button
            onClick={() => {
              setShowNewPaymentForm(true);
              setShowAddCreditForm(false);
            }}
            className="px-5 py-3 flex items-center bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full shadow hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            Add New Payment
          </button>
          <button
            onClick={() => {
              setShowAddCreditForm(true);
              setShowNewPaymentForm(false);
            }}
            className="px-5 py-3 flex items-center bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full shadow hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            Add Credits
          </button>
        </div>

        {/* New Payment Form */}
        {showNewPaymentForm && (
          <form
            onSubmit={handleSubmitPayment}
            className="p-6 bg-gray-50 rounded-lg shadow-md mt-6"
          >
            <label className="block mb-4">
              Product
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={newPayment.product}
                onChange={handleProductChange}
              >
                <option value="">Select a product</option>
                {products.map((product, index) => (
                  <option key={index} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </label>
            <label className="block mb-4">
              Type
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={newPayment.type}
                onChange={handleTypeChange}
              >
                <option value="">Select a type</option>
                <option value="Subscription">Subscription</option>
                <option value="On Demand">On Demand</option>
              </select>
            </label>

            {newPayment.type === "Subscription" && (
              <label className="block mb-4">
                Plan
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={newPayment.plan}
                  onChange={handlePlanChange}
                >
                  <option value="">Select a plan</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                </select>
              </label>
            )}

            <label className="block mb-4">
              Date of Payment
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={newPayment.dateOfPayment}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, dateOfPayment: e.target.value })
                }
              />
            </label>
            <label className="block mb-4">
              Mode of Payment
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={newPayment.modeOfPayment}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, modeOfPayment: e.target.value })
                }
              >
                <option value="">Select payment method</option>
                <option value="UPI">UPI</option>
                <option value="Paytm">Paytm</option>
                <option value="NEFT">NEFT</option>
                <option value="Netbanking">Netbanking</option>
                <option value="Card">Card</option>
              </select>
            </label>
            <label className="block mb-4">
              Price
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={newPayment.price}
                onChange={(e) =>
                  setNewPayment({ ...newPayment, price: e.target.value })
                }
                disabled={newPayment.type === "Subscription"} // Enable for "On Demand"
              />
            </label>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowNewPaymentForm(false)}
                className="px-5 py-3 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transform hover:scale-105 transition-transform duration-200 ease-in-out mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transform hover:scale-105 transition-transform duration-200 ease-in-out"
                disabled={!newPayment.product || !newPayment.type}
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Add Credits Form */}
        {showAddCreditForm && (
          <form
            onSubmit={handleSubmitCredit}
            className="p-6 bg-gray-50 rounded-lg shadow-md mt-6"
          >
            <label className="block mb-4">
              Add Credit Amount
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={addCredit}
                onChange={(e) => setAddCredit(e.target.value)}
              />
            </label>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowAddCreditForm(false)}
                className="px-5 py-3 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transform hover:scale-105 transition-transform duration-200 ease-in-out mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transform hover:scale-105 transition-transform duration-200 ease-in-out"
              >
                Add Credit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
