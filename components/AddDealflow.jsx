"use client";
import React, { useState } from "react";
import Modal from "@/components/Modal";
import { supabase } from "@/lib/supabaseclient";

const AddDealflow = ({
  isOpen,
  onClose,
  onAddDealflow,
  user,
  dealflowEntries,
  onUpdateDealflow,
}) => {
  const [newDealflow, setNewDealflow] = useState({
    name: "",
    email: "",
    mobile: "",
    investment_thesis: "",
    cheque_size: "",
    sector: "",
    investment_stage: "",
    company_name: "",
    typeof: "",
    Geography: "",
    user_id: user.id,
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDealflow((prevDealflow) => ({
      ...prevDealflow,
      [name]: value,
    }));
  };

  const handleAddDealflow = async () => {
    try {
      const { data, error } = await supabase
        .from("add_dealflow")
        .insert([newDealflow])
        .select();

      if (error) throw error;

      onAddDealflow(data[0]);
      setNewDealflow({
        name: "",
        email: "",
        mobile: "",
        investment_thesis: "",
        cheque_size: "",
        sector: "",
        investment_stage: "",
        company_name: "",
        typeof: "",
        Geography: "",
        user_id: user.id,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding dealflow:", error.message);
    }
  };

  const handleEditDealflow = async () => {
    try {
      const { data, error } = await supabase
        .from("add_dealflow")
        .update(newDealflow)
        .eq("id", currentEditId)
        .select();

      if (error) throw error;

      onUpdateDealflow(data[0]);
      setNewDealflow({
        name: "",
        email: "",
        mobile: "",
        investment_thesis: "",
        cheque_size: "",
        sector: "",
        investment_stage: "",
        company_name: "",
        typeof: "",
        Geography: "",
        user_id: user.id,
      });
      setShowForm(false);
      setEditing(false);
      setCurrentEditId(null);
    } catch (error) {
      console.error("Error editing dealflow:", error.message);
    }
  };

  const handleEditClick = (entry) => {
    setNewDealflow(entry);
    setShowForm(true);
    setEditing(true);
    setCurrentEditId(entry.id);
  };

  const handleCloseForm = () => {
    setNewDealflow({
      name: "",
      email: "",
      mobile: "",
      investment_thesis: "",
      cheque_size: "",
      sector: "",
      investment_stage: "",
      company_name: "",
      typeof: "",
      Geography: "",
      user_id: user.id,
    });
    setShowForm(false);
    setEditing(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 max-h-[70vh] overflow-y-auto" style={{ width: '900px' }}>
        <h2 className="text-xl font-bold mb-4">Your Dealflow Entries</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 mb-4 text-xs">
            <thead>
              <tr>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Name
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Email
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Mobile
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Investment Thesis
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Cheque Size
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Sector
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Investment Stage
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Company Name
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Type Of
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Geography
                </th>
                <th className="py-2 px-2 border-b border-gray-300 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {dealflowEntries.map((entry, index) => (
                <tr
                  key={entry.id || index}
                  className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                >
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.name || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.email || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.mobile || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.investment_thesis || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.cheque_size || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.sector || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.investment_stage || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.company_name || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.typeof || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    {entry.Geography || "N/A"}
                  </td>
                  <td className="py-2 px-2 border-b border-gray-300">
                    <button
                      onClick={() => handleEditClick(entry)}
                      className="py-1 px-2 bg-red-500 text-white rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="py-2 px-4 bg-red-500 text-white rounded"
          >
            Add New Dealflow
          </button>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Add your new dealflow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={newDealflow.name}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newDealflow.email}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="mobile"
                placeholder="Mobile"
                value={newDealflow.mobile}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="investment_thesis"
                placeholder="Investment Thesis"
                value={newDealflow.investment_thesis}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="cheque_size"
                placeholder="Cheque Size"
                value={newDealflow.cheque_size}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="sector"
                placeholder="Sector"
                value={newDealflow.sector}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="investment_stage"
                placeholder="Investment Stage"
                value={newDealflow.investment_stage}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="company_name"
                placeholder="Company Name"
                value={newDealflow.company_name}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="typeof"
                placeholder="Type of"
                value={newDealflow.typeof}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                name="Geography"
                placeholder="Geography"
                value={newDealflow.Geography}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={editing ? handleEditDealflow : handleAddDealflow}
                className="py-2 px-4 bg-red-500 text-white rounded"
              >
                {editing ? "Save Changes" : "Save"}
              </button>
              <button
                onClick={handleCloseForm}
                className="py-2 px-4 bg-gray-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddDealflow;
