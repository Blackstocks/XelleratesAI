import React from "react";

const EquityTab = ({
  connectedStartups,
  comments,
  handleCommentChange,
  saveComment,
  openAssignModal,
  openViewModal,
  searchTerm,
}) => {
  const filteredStartups = connectedStartups.filter(
    (startup) =>
      startup.startup_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.linkedin_profile
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <table className="min-w-full bg-white border border-gray-300">
      <thead>
        <tr>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            Company Name
          </th>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            Founder Name
          </th>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            Email
          </th>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            Mobile
          </th>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            LinkedIn
          </th>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            Comment
          </th>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            Assign
          </th>
          <th className="py-4 px-4 border-b border-gray-300 text-left">
            Assigned
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredStartups.map((startup, index) => (
          <tr
            key={startup.id}
            className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
          >
            <td className="py-2 px-4 border-b border-gray-300">
              {startup.startup_name}
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              {startup.founder_name}
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              {startup.email}
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              {startup.mobile}
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              <a
                href={startup.linkedin_profile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                LinkedIn Profile
              </a>
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              <textarea
                value={comments[startup.id] || ""}
                onChange={(e) =>
                  handleCommentChange(startup.id, e.target.value)
                }
                onBlur={() => saveComment(startup.id)}
                className="w-full p-1 border rounded"
                rows="2"
              />
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              <button
                onClick={() => openAssignModal(startup)}
                className="py-1 px-2 bg-blue-500 text-white rounded"
              >
                Assign
              </button>
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              <button
                onClick={() => openViewModal(startup)}
                className="py-1 px-2 bg-green-500 text-white rounded"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EquityTab;
