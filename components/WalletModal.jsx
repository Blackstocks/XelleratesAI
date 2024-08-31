import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseclient'; // Ensure you have the correct import for Supabase

const WalletModal = ({ isOpen, onClose, startup, walletDetails = [], walletCredit = {} }) => {
  const [newPayment, setNewPayment] = useState({
    product: '',
    type: '',
    dateOfPayment: '',
    modeOfPayment: '',
  });

  const [addCredit, setAddCredit] = useState(0);
  const [balance, setBalance] = useState(walletCredit?.credit_balance || 0);
  const [referralEarnings, setReferralEarnings] = useState(walletCredit?.referral_balance || 0);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [showAddCreditForm, setShowAddCreditForm] = useState(false);

  const products = [
    'Fundraising - Equity',
    'Fundraising - Debt',
    'Pitch Deck Creation',
    'Company Incorporation',
    'GST certification',
    'Start-up India registration',
    'Trademark registration',
    'Annual secretarial compliance',
    'NDA/employment contracts',
    'Valuation certificate',
    'Auditor onboarding',
    'Talent hiring',
    'Connect with Incubators'
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

    // Generate a random 12-character transaction ID
    const generateTransactionId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let transactionId = '';
      for (let i = 0; i < 12; i++) {
        transactionId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return transactionId;
    };

    const transactionId = generateTransactionId(); // Generate the transaction ID

    try {
      const { error } = await supabase
        .from('wallet_payments')
        .insert({
          startup_id: startup.id,
          product: newPayment.product,
          type: newPayment.type,
          transaction_id: transactionId, // Use the generated transaction ID
          date_of_payment: newPayment.dateOfPayment,
          mode_of_payment: newPayment.modeOfPayment,
        });

      if (error) {
        console.error('Error updating wallet details:', error.message);
        alert('Error updating wallet details: ' + error.message);
      } else {
        alert('Payment details updated successfully!');
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error updating wallet details:', err.message || err);
      alert('Unexpected error: ' + (err.message || err));
    }
  };

  const handleSubmitCredit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('wallet_credits')
        .update({ credit_balance: parseFloat(balance) + parseFloat(addCredit) })
        .eq('startup_id', startup.id);

      if (error) {
        console.error('Error adding credits:', error.message);
        alert('Error adding credits: ' + error.message);
      } else {
        alert('Credits added successfully!');
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error adding credits:', err.message || err);
      alert('Unexpected error: ' + (err.message || err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl mb-4">Wallet Details for {startup.company_profile?.company_name}</h2>
        
        {/* Current Balance and Referral Earnings */}
        <table className="w-full mb-4 border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Current Balance</th>
              <th className="py-2 px-4 border-b">Referral Earnings</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b">{balance}</td>
              <td className="py-2 px-4 border-b">{referralEarnings}</td>
            </tr>
          </tbody>
        </table>

        {/* Existing Wallet Details */}
        <table className="w-full mb-4 border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Product</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">Transaction ID</th>
              <th className="py-2 px-4 border-b">Date of Payment</th>
              <th className="py-2 px-4 border-b">Mode of Payment</th>
            </tr>
          </thead>
          <tbody>
            {walletDetails.length > 0 ? (
              walletDetails.map((detail, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b">{detail.product}</td>
                  <td className="py-2 px-4 border-b">{detail.type}</td>
                  <td className="py-2 px-4 border-b">{detail.transactionId}</td>
                  <td className="py-2 px-4 border-b">{detail.dateOfPayment}</td>
                  <td className="py-2 px-4 border-b">{detail.modeOfPayment}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-2 px-4 border-b text-center">No payment details available.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Buttons to Add New Payment and Add Credits */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setShowNewPaymentForm(true); setShowAddCreditForm(false); }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
          >
            Add New Payment
          </button>
          <button
            onClick={() => { setShowAddCreditForm(true); setShowNewPaymentForm(false); }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Credits
          </button>
        </div>

        {/* New Payment Form */}
        {showNewPaymentForm && (
          <form onSubmit={handleSubmitPayment}>
            <label className="block mb-2">
              Product
              <select
                className="w-full p-2 border border-gray-300 rounded"
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

            <label className="block mb-2">
              Type
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={newPayment.type}
                onChange={handleTypeChange}
              >
                <option value="">Select a type</option>
                <option value="Subscription">Subscription</option>
                <option value="On Demand">On Demand</option>
              </select>
            </label>

            <label className="block mb-2">
              Date of Payment
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded"
                value={newPayment.dateOfPayment}
                onChange={(e) => setNewPayment({ ...newPayment, dateOfPayment: e.target.value })}
              />
            </label>

            <label className="block mb-2">
              Mode of Payment
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={newPayment.modeOfPayment}
                onChange={(e) => setNewPayment({ ...newPayment, modeOfPayment: e.target.value })}
              >
                <option value="">Select payment method</option>
                <option value="UPI">UPI</option>
                <option value="Paytm">Paytm</option>
                <option value="NEFT">NEFT</option>
                <option value="Netbanking">Netbanking</option>
                <option value="Card">Card</option>
              </select>
            </label>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={!newPayment.product || !newPayment.type}
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Add Credits Form */}
        {showAddCreditForm && (
          <form onSubmit={handleSubmitCredit}>
            <label className="block mb-2">
              Add Credit Amount
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                value={addCredit}
                onChange={(e) => setAddCredit(e.target.value)}
              />
            </label>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
