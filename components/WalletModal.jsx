import React, { useState } from "react";
import { supabase } from "@/lib/supabaseclient";

const WalletModal = ({
  isOpen,
  onClose,
  walletDetails = [],
  walletCredit = {},
  user,
}) => {
  const [newPayment, setNewPayment] = useState({
    product: "",
    type: "",
    dateOfPayment: "",
    modeOfPayment: "",
  });

  const [addCredit, setAddCredit] = useState(0);
  const [balance, setBalance] = useState(walletCredit?.credit_balance || 0);
  const [referralEarnings, setReferralEarnings] = useState(
    walletCredit?.referral_balance || 0
  );
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [showAddCreditForm, setShowAddCreditForm] = useState(false);

  const products = [
    "Fundraising - Equity",
    "Fundraising - Debt",
    "Pitch Deck Creation",
    "Company Incorporation",
    "GST certification",
    "Start-up India registration",
    "Trademark registration",
    "Annual secretarial compliance",
    "NDA/employment contracts",
    "Valuation certificate",
    "Auditor onboarding",
    "Talent hiring",
    "Connect with Incubators",
  ];

  const handleProductChange = (e) => {
    setNewPayment({
      ...newPayment,
      product: e.target.value,
    });
  };

  const handleTypeChange = (e) => {
    setNewPayment({ ...newPayment, type: e.target.value });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    // Ensure the startup_id is available before proceeding
    if (!user || !user.id) {
      alert("User ID is not available. Please wait...");
      return;
    }

    // Debugging: log the user ID
    console.log("User ID being used for startup:", user.id);

    // Generate a random 12-character transaction ID
    const generateTransactionId = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let transactionId = "";
      for (let i = 0; i < 12; i++) {
        transactionId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return transactionId;
    };

    const transactionId = generateTransactionId(); // Generate the transaction ID

    try {
      // Check if the user ID exists in the 'profiles' table
      const { data: startupCheck, error: startupCheckError } = await supabase
        .from("profiles") // Correct table name where user ID is stored
        .select("id")
        .eq("id", user.id)
        .single();

      // Debugging: log the result of the startup check
      console.log("Startup Check Result:", startupCheck);

      if (startupCheckError) {
        console.error(
          "Supabase error fetching startup ID:",
          startupCheckError.message
        );
        alert("Error checking startup ID: " + startupCheckError.message);
        return;
      }

      if (!startupCheck) {
        console.error("Startup ID does not exist or could not be verified.");
        alert("Startup ID does not exist or is invalid.");
        return;
      }

      // Proceed with inserting the payment details
      const { error } = await supabase.from("wallet_payments").insert({
        startup_id: user.id, // Use the user ID directly as the foreign key
        product: newPayment.product,
        type: newPayment.type,
        transaction_id: transactionId, // Use the generated transaction ID
        date_of_payment: newPayment.dateOfPayment,
        mode_of_payment: newPayment.modeOfPayment,
      });

      if (error) {
        console.error("Error updating wallet details:", error.message);
        alert("Error updating wallet details: " + error.message);
      } else {
        alert("Payment details updated successfully!");
        onClose();
      }
    } catch (err) {
      console.error(
        "Unexpected error updating wallet details:",
        err.message || err
      );
      alert("Unexpected error: " + (err.message || err));
    }
  };

  const handleSubmitCredit = async (e) => {
    e.preventDefault();

    // Ensure the user ID is available before proceeding
    if (!user || !user.id) {
      alert("User ID is not available. Please wait...");
      return;
    }

    try {
      const { error } = await supabase
        .from("wallet_credits")
        .update({ credit_balance: parseFloat(balance) + parseFloat(addCredit) })
        .eq("startup_id", user.id); // Use the user ID directly

      if (error) {
        console.error("Error adding credits:", error.message);
        alert("Error adding credits: " + error.message);
      } else {
        alert("Credits added successfully!");
        onClose();
      }
    } catch (err) {
      console.error("Unexpected error adding credits:", err.message || err);
      alert("Unexpected error: " + (err.message || err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl transition-transform transform-gpu duration-500 ease-in-out">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center">
          <span className="mr-2">
            <svg
              className="w-8 h-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7l6 6-6 6M21 7l-6 6 6 6"
              />
            </svg>
          </span>
          Wallet Details for {user ? user.name : "Unknown User"}
        </h2>

        {/* Current Balance and Referral Earnings */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg shadow-inner mb-6">
          <table className="w-full text-sm text-gray-700">
            <thead>
              <tr className="text-gray-500 uppercase tracking-wide text-xs">
                <th className="py-3 px-5 text-left">Current Balance</th>
                <th className="py-3 px-5 text-left">Referral Earnings</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-800 font-semibold">
                <td className="py-3 px-5">{balance}</td>
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
                <th className="py-3 px-5 text-left">Transaction ID</th>
                <th className="py-3 px-5 text-left">Date of Payment</th>
                <th className="py-3 px-5 text-left">Mode of Payment</th>
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
                    <td className="py-3 px-5">{detail.transactionId}</td>
                    <td className="py-3 px-5">{detail.dateOfPayment}</td>
                    <td className="py-3 px-5">{detail.modeOfPayment}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-3 px-5 text-center text-gray-500 italic"
                  >
                    No payment details available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Buttons to Add New Payment and Add Credits */}
        <div className="flex justify-end mb-6 space-x-3">
          <button
            onClick={() => {
              setShowNewPaymentForm(true);
              setShowAddCreditForm(false);
            }}
            className="px-5 py-3 flex items-center bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full shadow hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Payment
          </button>
          <button
            onClick={() => {
              setShowAddCreditForm(true);
              setShowNewPaymentForm(false);
            }}
            className="px-5 py-3 flex items-center bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full shadow hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 12H4m16 0l-4 4m4-4l-4-4"
              />
            </svg>
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
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Product
              </span>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </span>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newPayment.type}
                onChange={handleTypeChange}
              >
                <option value="">Select a type</option>
                <option value="Subscription">Subscription</option>
                <option value="On Demand">On Demand</option>
              </select>
            </label>

            <label className="block mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Date of Payment
              </span>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newPayment.dateOfPayment}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    dateOfPayment: e.target.value,
                  })
                }
              />
            </label>

            <label className="block mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Mode of Payment
              </span>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={newPayment.modeOfPayment}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    modeOfPayment: e.target.value,
                  })
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

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
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
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Add Credit Amount
              </span>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={addCredit}
                onChange={(e) => setAddCredit(e.target.value)}
              />
            </label>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
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
