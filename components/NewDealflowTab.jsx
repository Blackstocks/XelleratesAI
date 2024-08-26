import React from "react";

const NewDealflowTab = ({ newDealflows, searchTerm, handleUpdateDealflow }) => {
  const filteredDealflows = newDealflows.filter((dealflow) =>
    Object.values(dealflow).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Name
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Email
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Mobile
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Investment Thesis
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Cheque Size
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Sector
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Investment Stage
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Company Name
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Type Of
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Geography
            </th>
            <th className="py-4 px-4 border-b border-gray-300 text-left">
              Update
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredDealflows.map((dealflow, index) => (
            <tr
              key={dealflow.id}
              className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
            >
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.name}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.email}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.mobile}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.investment_thesis}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.cheque_size}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.sector}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.investment_stage}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.company_name}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.typeof}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {dealflow.Geography}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                <button
                  onClick={() => handleUpdateDealflow(dealflow)}
                  className="py-1 px-2 bg-blue-500 text-white rounded"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewDealflowTab;
