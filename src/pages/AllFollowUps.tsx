import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Calendar, Clock, Filter } from "lucide-react";

const AllFollowUps: React.FC = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // 🕒 Update date & time every minute
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format date like "Monday, January 15, 2024"
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", dateOptions));

      // Format time like "10:30 AM"
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentTime(now.toLocaleTimeString("en-US", timeOptions));
    };

    updateDateTime();
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
                  All Follow Ups
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
                  <p className="text-xs text-gray-500">Total Follow Ups</p>
                  <p className="text-2xl font-bold text-gray-800">243</p>
                </div>

                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">89</p>
                </div>

                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">154</p>
                </div>
              </div>
            </div>
          </header>

          {/* ---------- Filter Section ---------- */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={18} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-700">
                Filter Options
              </h2>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              {/* Start Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-44 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>

              {/* Search Button */}
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-all shadow-sm hover:shadow-md">
                Search
              </button>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by Name or Mobile No."
                className="flex-1 min-w-[250px] border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
          </section>

          {/* ---------- Table Section ---------- */}
          <section className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm font-semibold py-3 px-4 border-b border-gray-200">
              <span>Full Name</span>
              <span>Mobile</span>
              <span>Enquiry Status</span>
              <span>Interested</span>
              <span>Profession</span>
            </div>

            {/* Table Body */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`grid grid-cols-5 items-center text-sm px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
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
              </div>
            ))}
          </section>

          {/* ---------- Pagination ---------- */}
          <footer className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1–8</span> of{" "}
              <span className="font-medium">243</span> results
            </p>

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
                …
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                31
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Next
              </button>
            </div>
          </footer>
        </main>
      </div>
    </Layout>
  );
};

export default AllFollowUps;
