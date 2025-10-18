import React from "react";
import Layout from "../components/Layout";
import { Pencil, Trash2 } from "lucide-react"; // icons

const ViewEnquiry: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            View Enquiries
          </h1>

          {/* Search Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by Name or Mobile No."
              className="flex-1 min-w-[250px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-green-500"
            />

            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>All Branches</option>
            </select>

            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option>All Enquiry Status</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-md shadow-md overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 text-gray-600 text-xs font-semibold py-3 px-4 border-b">
              <span>Full Name</span>
              <span>Mobile</span>
              <span>Course Type</span>
              <span>Enquiry Status</span>
              <span>Interested</span>
              <span>Tele-caller</span>
              <span className="text-center">Actions</span>
            </div>

            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`grid grid-cols-7 items-center text-sm px-4 py-3 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <span>John Doe</span>
                <span>9876543210</span>
                <span>Website</span>
                <span>New</span>
                <span>Yes</span>
                <span>Jane Smith</span>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    title="Edit Enquiry"
                    className="p-2 rounded-md hover:bg-green-100 hover:scale-110 transition-transform"
                  >
                    <Pencil size={18} className="text-green-600" />
                  </button>
                  <button
                    title="Delete Enquiry"
                    className="p-2 rounded-md hover:bg-red-100 hover:scale-110 transition-transform"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default ViewEnquiry;
