import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaCalendarCheck,
  FaChevronDown,
  FaSearch,
  FaPlusCircle,
  FaEye,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openEnquiries, setOpenEnquiries] = useState(false);

  // Automatically open Enquiries dropdown if current path is under /enquiries
  useEffect(() => {
    if (location.pathname.startsWith("/enquiries")) {
      setOpenEnquiries(true);
    }
  }, [location.pathname]);

  return (
    <aside className="w-64 bg-white shadow-xl flex flex-col h-screen border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">CRM Dashboard</h2>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 overflow-y-auto mt-4">
        <ul className="flex flex-col space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              to="/"
              className={`flex items-center p-3 rounded-md transition-all duration-300 ${
                location.pathname === "/"
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 text-blue-700 font-semibold shadow-sm"
                  : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-l-4 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              <FaTachometerAlt className="mr-3 w-5 h-5" />
              Dashboard
            </Link>
          </li>

          {/* Enquiries Dropdown */}
          <li>
            <button
              onClick={() => setOpenEnquiries(!openEnquiries)}
              className="flex items-center justify-between w-full p-3 rounded-md hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 transition-all duration-300"
            >
              <div className="flex items-center">
                <FaUser className="mr-3 w-5 h-5" />
                <span className="font-medium text-gray-700">Enquiries</span>
              </div>
              <FaChevronDown
                className={`w-4 h-4 transform transition-transform ${
                  openEnquiries ? "rotate-180" : ""
                }`}
              />
            </button>

            {openEnquiries && (
              <ul className="ml-8 mt-2 flex flex-col space-y-1">
                <li>
                  <Link
                    to="/enquiries/search"
                    className={`flex items-center p-2 rounded-md text-sm transition-all duration-300 ${
                      location.pathname === "/enquiries/search"
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 font-semibold"
                        : "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-l-4 hover:border-green-400 hover:text-green-600"
                    }`}
                  >
                    <FaSearch className="mr-3 w-4 h-4" />
                    Search Enquiry
                  </Link>
                </li>
                <li>
                  <Link
                    to="/enquiries/add"
                    className={`flex items-center p-2 rounded-md text-sm transition-all duration-300 ${
                      location.pathname === "/enquiries/add"
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 font-semibold"
                        : "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-l-4 hover:border-green-400 hover:text-green-600"
                    }`}
                  >
                    <FaPlusCircle className="mr-3 w-4 h-4" />
                    Add New Enquiry
                  </Link>
                </li>
                <li>
                  <Link
                    to="/enquiries/view"
                    className={`flex items-center p-2 rounded-md text-sm transition-all duration-300 ${
                      location.pathname === "/enquiries/view"
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 font-semibold"
                        : "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-l-4 hover:border-green-400 hover:text-green-600"
                    }`}
                  >
                    <FaEye className="mr-3 w-4 h-4" />
                    View Enquiry
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Today's Follow Ups */}
          <li>
            <Link
              to="/follow-ups/today"
              className={`flex items-center p-3 rounded-md transition-all duration-300 ${
                location.pathname === "/follow-ups/today"
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 text-blue-700 font-semibold shadow-sm"
                  : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-l-4 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              <FaCalendarCheck className="mr-3 w-5 h-5" />
              Today's Follow Ups
            </Link>
          </li>

          {/* All Follow Ups */}
          <li>
            <Link
              to="/follow-ups/all"
              className={`flex items-center p-3 rounded-md transition-all duration-300 ${
                location.pathname === "/follow-ups/all"
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 text-blue-700 font-semibold shadow-sm"
                  : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-l-4 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              <FaCalendarCheck className="mr-3 w-5 h-5" />
              All Follow Ups
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 text-gray-400 text-xs border-t border-gray-100">
        © 2025 CRM System
      </div>
    </aside>
  );
};

export default Sidebar;
