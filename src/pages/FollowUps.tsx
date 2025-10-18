// src/pages/FollowUps.tsx
import React from "react";
import Layout from "../components/Layout";

const FollowUps: React.FC = () => {
  // Example data
  const followUps = [
    { id: 1, name: "John Doe", date: "2025-10-17", status: "Pending" },
    { id: 2, name: "Jane Smith", date: "2025-10-18", status: "Completed" },
    { id: 3, name: "Bob Johnson", date: "2025-10-19", status: "Pending" },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Follow Ups</h1>
      <p className="text-gray-500 mb-6">List of all follow ups.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {followUps.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-6">{item.id}</td>
                <td className="py-3 px-6">{item.name}</td>
                <td className="py-3 px-6">{item.date}</td>
                <td
                  className={`py-3 px-6 font-semibold ${
                    item.status === "Pending"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default FollowUps;
