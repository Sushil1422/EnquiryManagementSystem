import React from "react";
import Layout from "../components/Layout";

const AllFollowUps: React.FC = () => {
  return (
    <Layout>
      <div className="flex bg-gray-100 min-h-screen">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-xl font-bold text-gray-800 mb-6">
            All Follow Ups
          </h1>

          {/* Filter Section */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="border rounded-md p-2 w-44 focus:ring focus:ring-green-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="border rounded-md p-2 w-44 focus:ring focus:ring-green-300"
              />
            </div>
            <button className="bg-[#27AE60] text-white px-4 py-2 rounded-md hover:bg-[#219150] transition">
              Search
            </button>
            <input
              type="text"
              placeholder="Search by Name or Mobile no."
              className="border rounded-md p-2 flex-1 min-w-[250px]"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-6 bg-gray-50 px-6 py-3 text-[12px] text-gray-500 font-semibold">
              <span>Full Name</span>
              <span>Mobile</span>
              <span>Course Type</span>
              <span>Enquiry Status</span>
              <span>Interested</span>
              <span>Assigned Tele-caller</span>
            </div>

            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-6 px-6 py-3 text-sm ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <span className="text-gray-900">John Doe</span>
                <span className="text-gray-600">9876543210</span>
                <span className="text-gray-600">Website</span>
                <span className="text-gray-600">New</span>
                <span className="text-gray-600">Yes</span>
                <span className="text-gray-600">Jane Smith</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default AllFollowUps;
