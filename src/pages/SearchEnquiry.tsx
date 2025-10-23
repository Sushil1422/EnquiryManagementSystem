import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const SearchEnquiry: React.FC = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 🕒 Update date & time every minute
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format: "Monday, January 15, 2024"
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", dateOptions));

      // Format: "10:30 AM"
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentTime(now.toLocaleTimeString("en-US", timeOptions));
    };

    updateDateTime(); // Run immediately
    const interval = setInterval(updateDateTime, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* ---------- Header Section ---------- */}
          <header className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Title + Date/Time */}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Search Enquiry
                </h1>

                <time
                  className="flex items-center gap-4 text-sm"
                  dateTime={new Date().toISOString()}
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <Calendar size={16} className="text-green-600" />
                    <span className="font-medium text-green-700">
                      {currentDate || "Loading..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock size={16} className="text-blue-600" />
                    <span className="font-medium text-blue-700">
                      {currentTime || "Loading..."}
                    </span>
                  </div>
                </time>
              </div>

              {/* Summary Cards */}
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                  <p className="text-xs text-gray-500">Total Enquiries</p>
                  <p className="text-2xl font-bold text-gray-800">1,234</p>
                </div>
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">856</p>
                </div>
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                  <p className="text-xs text-gray-500">Converted</p>
                  <p className="text-2xl font-bold text-blue-600">378</p>
                </div>
              </div>
            </div>
          </header>

          {/* ---------- Quick Search Section ---------- */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Search size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-700">
                Quick Search
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Search by Name, Mobile Number, or Email
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter name, mobile number or email address"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>
          </section>

          {/* ---------- Advanced Filter Section ---------- */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Filter size={18} className="text-gray-600" />
              <h2 className="text-base font-semibold text-gray-700">
                Advanced Search Filters
              </h2>
            </div>

            <div className="space-y-6">
              {/* Status Filters */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Status Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Enquiry Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Enquiry Status
                    </label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-400">
                      <option>All Status</option>
                      <option>New</option>
                      <option>In Progress</option>
                      <option>Follow-up</option>
                      <option>Converted</option>
                      <option>Closed</option>
                    </select>
                  </div>

                  {/* Interested Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Interested Status
                    </label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-400">
                      <option>All</option>
                      <option>Highly Interested</option>
                      <option>Moderately Interested</option>
                      <option>Low Interest</option>
                      <option>Not Interested</option>
                    </select>
                  </div>

                  {/* Profession */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Profession
                    </label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-400">
                      <option>All Professions</option>
                      <option>Farmer</option>
                      <option>Business</option>
                      <option>Salaried</option>
                      <option>Self-Employed</option>
                      <option>Student</option>
                      <option>Retired</option>
                    </select>
                  </div>

                  {/* Knowledge Level */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Knowledge Level
                    </label>
                    <select className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white hover:border-gray-400">
                      <option>All Levels</option>
                      <option>Fresher</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Professional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Date Range Filters */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Date Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-500" />
                      From Date
                    </label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-400"
                    />
                  </div>

                  {/* To Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-500" />
                      To Date
                    </label>
                    <input
                      type="date"
                      className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-500">
                  Use filters to narrow down your search results
                </p>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border-2 border-gray-300 font-medium text-sm">
                    Reset Filters
                  </button>
                  <button className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium text-sm">
                    <Filter size={18} />
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- Results Table Section ---------- */}
          <section className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Table Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">
                Search Results
              </h3>
              <span className="text-xs text-gray-500">
                Showing 8 of 1,234 results
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-6 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm font-semibold py-3 px-4 border-b border-gray-200">
                <span>Full Name</span>
                <span>Mobile</span>
                <span>Enquiry Status</span>
                <span>Interested</span>
                <span>Profession</span>
                <span className="text-center">Actions</span>
              </div>

              {/* Table Body */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-6 items-center text-sm px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-800">John Doe</span>
                  <span className="text-gray-600">9876543210</span>
                  <span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        i % 3 === 0
                          ? "bg-green-100 text-green-700"
                          : i % 3 === 1
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {i % 3 === 0
                        ? "Converted"
                        : i % 3 === 1
                        ? "Pending"
                        : "New"}
                    </span>
                  </span>
                  <span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Yes
                    </span>
                  </span>
                  <span className="text-gray-600">Farmer</span>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      title="View Details"
                      className="p-2 rounded-md hover:bg-blue-100 hover:scale-110 transition-all"
                    >
                      <Eye size={18} className="text-blue-600" />
                    </button>
                    <button
                      title="Edit Enquiry"
                      className="p-2 rounded-md hover:bg-green-100 hover:scale-110 transition-all"
                    >
                      <Pencil size={18} className="text-green-600" />
                    </button>
                    <button
                      title="Delete Enquiry"
                      className="p-2 rounded-md hover:bg-red-100 hover:scale-110 transition-all"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- Pagination ---------- */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">1-8</span> of{" "}
              <span className="font-medium">1,234</span> results
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Previous
              </button>
              <button className="px-4 py-2 bg-green-600 border border-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-all">
                1
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                2
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                3
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                ...
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                155
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default SearchEnquiry;
