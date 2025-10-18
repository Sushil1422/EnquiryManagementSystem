// src/pages/SearchEnquiry.tsx
import React from "react";
import Layout from "../components/Layout";

const SearchEnquiry: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col items-start gap-6">
        <span className="text-gray-800 text-xl font-bold">Search Enquiry</span>

        <div className="flex flex-col self-stretch bg-white p-6 gap-10 rounded-lg">
          <div className="flex flex-col items-start gap-2">
            <span className="text-gray-700 text-[11px]">
              Search by Name, Mobile Number, or Email
            </span>
            <div className="flex items-center self-stretch bg-white py-1 rounded-md border border-gray-300">
              <input
                type="text"
                placeholder="Enter name, mobile number or email address"
                className="flex-1 text-sm p-2 outline-none"
              />
              <button className="w-20 bg-green-600 text-white rounded-tr-md rounded-br-md">
                Search
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="flex flex-col gap-4">
            <span className="text-gray-900 text-[15px]">Advanced Search</span>

            <div className="grid grid-cols-2 gap-4">
              {/* Branch */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-700 text-[11px]">Branch</span>
                <button className="flex items-center justify-between p-3 border border-gray-400 rounded-md">
                  <span>All Branches</span>
                  <span>▼</span>
                </button>
              </div>

              {/* Enquiry Status */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-700 text-[11px]">
                  Enquiry Status
                </span>
                <button className="flex items-center justify-between p-3 border border-gray-400 rounded-md">
                  <span>All Status</span>
                  <span>▼</span>
                </button>
              </div>

              {/* Source */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-700 text-[11px]">Source</span>
                <button className="flex items-center justify-between p-3 border border-gray-400 rounded-md">
                  <span>All Sources</span>
                  <span>▼</span>
                </button>
              </div>

              {/* Course Type */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-700 text-[11px]">Course Type</span>
                <button className="flex items-center justify-between p-3 border border-gray-400 rounded-md">
                  <span>All Course Types</span>
                  <span>▼</span>
                </button>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-gray-700 text-[11px]">From Date</span>
                <input
                  type="date"
                  className="p-2 border border-gray-400 rounded-md"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-gray-700 text-[11px]">To Date</span>
                <input
                  type="date"
                  className="p-2 border border-gray-400 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-green-600 text-white px-6 py-2 rounded-md">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchEnquiry;

// Sidebar Link for Search Enquiry
// <Link to="/enquiries/search" className="block p-2 rounded-md hover:bg-blue-50 hover:text-blue-500">
//   Search Enquiry
// </Link>

// Clicking this link will render your SearchEnquiry page inside the layout with Sidebar intact.
