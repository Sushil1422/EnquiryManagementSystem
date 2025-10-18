// src/pages/Enquiries.tsx
import React, { useState } from "react";
import Layout from "../components/Layout";

const Enquiries: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState("Search Enquiry");

  const actions = ["Search Enquiry", "Add New Enquiry", "View Enquiry"];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Enquiries</h1>

      {/* Dropdown */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Select Action:</label>
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="border rounded-md p-2 w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      {/* Render content based on dropdown */}
      {selectedAction === "Search Enquiry" && (
        <div>
          <input
            type="text"
            placeholder="Search by name or ID"
            className="border rounded-md p-2 w-full mb-4"
          />
          <p className="text-gray-500">Search results will appear here.</p>
        </div>
      )}

      {selectedAction === "Add New Enquiry" && (
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Name"
            className="border rounded-md p-2 w-full mb-2"
          />
          <input
            type="email"
            placeholder="Email"
            className="border rounded-md p-2 w-full mb-2"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Add Enquiry
          </button>
        </div>
      )}

      {selectedAction === "View Enquiry" && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Example data */}
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-6">1</td>
                <td className="py-3 px-6">John Doe</td>
                <td className="py-3 px-6">john@example.com</td>
                <td className="py-3 px-6 text-green-500 font-semibold">
                  Active
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-6">2</td>
                <td className="py-3 px-6">Jane Smith</td>
                <td className="py-3 px-6">jane@example.com</td>
                <td className="py-3 px-6 text-red-500 font-semibold">
                  Pending
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Enquiries;
