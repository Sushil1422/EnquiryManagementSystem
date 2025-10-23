import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaCheckCircle,
  FaSearch,
  FaPlusCircle,
  FaEye,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const linkClasses = (path: string) =>
    `flex items-center p-3 rounded-md transition-all duration-300 ${
      location.pathname === path
        ? "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 font-semibold"
        : "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-l-4 hover:border-green-400 hover:text-green-600"
    }`;

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
            <Link to="/" className={linkClasses("/")}>
              <FaTachometerAlt className="mr-3 w-5 h-5" />
              Dashboard
            </Link>
          </li>

          {/* Search Enquiry */}
          <li>
            <Link
              to="/enquiries/search"
              className={linkClasses("/enquiries/search")}
            >
              <FaSearch className="mr-3 w-5 h-5" />
              Search Enquiry
            </Link>
          </li>

          {/* Add New Enquiry */}
          <li>
            <Link to="/enquiries/add" className={linkClasses("/enquiries/add")}>
              <FaPlusCircle className="mr-3 w-5 h-5" />
              Add New Enquiry
            </Link>
          </li>

          {/* View Enquiry */}
          <li>
            <Link
              to="/enquiries/view"
              className={linkClasses("/enquiries/view")}
            >
              <FaEye className="mr-3 w-5 h-5" />
              View Enquiry
            </Link>
          </li>

          {/* Today's Follow Ups */}
          <li>
            <Link
              to="/follow-ups/today"
              className={linkClasses("/follow-ups/today")}
            >
              <FaCalendarCheck className="mr-3 w-5 h-5" />
              Today's Follow Ups
            </Link>
          </li>

          {/* All Follow Ups */}
          <li>
            <Link
              to="/follow-ups/all"
              className={linkClasses("/follow-ups/all")}
            >
              <FaCheckCircle className="mr-3 w-5 h-5" />
              All Follow Ups
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 text-gray-400 text-xs border-t border-gray-100">
        © 2025 CRM System By KaliByte Solutions
      </div>
    </aside>
  );
};

export default Sidebar;
