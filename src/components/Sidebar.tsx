// src/components/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaCheckCircle,
  FaSearch,
  FaPlusCircle,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaUsersCog,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import { TrendingUp, Shield, User } from "lucide-react";
import { storageUtils } from "../utils/localStorage";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar(); // Use context instead of local state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [statistics, setStatistics] = useState({
    totalEnquiries: 0,
    todayFollowUps: 0,
    allFollowUps: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, [location.pathname]);

  const isToday = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const loadStatistics = () => {
    try {
      const allEnquiries = storageUtils.getAllEnquiries();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        totalEnquiries: allEnquiries.length,
        todayFollowUps: allEnquiries.filter((e) => isToday(e.callBackDate))
          .length,
        allFollowUps: allEnquiries.filter((e) => {
          if (!e.callBackDate) return false;
          const callBackDate = new Date(e.callBackDate);
          callBackDate.setHours(0, 0, 0, 0);
          return callBackDate >= today;
        }).length,
      };

      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClasses = (path: string) =>
    `flex items-center justify-between p-3 rounded-lg transition-all duration-300 group ${
      location.pathname === path
        ? "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 font-semibold shadow-sm"
        : "hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:border-l-4 hover:border-green-400 hover:text-green-600 text-gray-700"
    }`;

  const menuItems = [
    {
      path: "/",
      icon: <FaTachometerAlt className="w-5 h-5" />,
      label: "Dashboard",
      badge: null,
      show: true,
      group: "main",
    },
    {
      path: "/add-enquiry",
      icon: <FaPlusCircle className="w-5 h-5" />,
      label: "Add New Enquiry",
      badge: null,
      highlight: true,
      show: true,
      group: "main",
    },
    {
      path: "/search-enquiry",
      icon: <FaSearch className="w-5 h-5" />,
      label: "Search Enquiry",
      badge: null,
      show: true,
      group: "main",
    },
    {
      path: "/view-enquiry",
      icon: <FaEye className="w-5 h-5" />,
      label: "View Enquiries",
      badge: statistics.totalEnquiries > 0 ? statistics.totalEnquiries : null,
      show: true,
      group: "main",
    },
    {
      path: "/today-followups",
      icon: <FaCalendarCheck className="w-5 h-5" />,
      label: "Today's Follow Ups",
      badge: statistics.todayFollowUps > 0 ? statistics.todayFollowUps : null,
      urgent: statistics.todayFollowUps > 0,
      show: true,
      group: "followups",
    },
    {
      path: "/all-followups",
      icon: <FaCheckCircle className="w-5 h-5" />,
      label: "All Follow Ups",
      badge: statistics.allFollowUps > 0 ? statistics.allFollowUps : null,
      show: true,
      group: "followups",
    },
    {
      path: "/user-management",
      icon: <FaUsersCog className="w-5 h-5" />,
      label: "User Management",
      badge: null,
      show: isAdmin(),
      adminOnly: true,
      group: "admin",
    },
  ].filter((item) => item.show);

  const mainMenuItems = menuItems.filter((item) => item.group === "main");
  const followUpItems = menuItems.filter((item) => item.group === "followups");
  const adminItems = menuItems.filter((item) => item.group === "admin");

  const getUserInitials = () => {
    if (!currentUser?.fullName) return "U";
    const names = currentUser.fullName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return currentUser.fullName.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-white shadow-xl fixed left-0 top-0 h-screen flex flex-col border-r border-gray-200 transition-all duration-300 z-30`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-800">EMS</h2>
              <p className="text-xs text-gray-500">Enquiry Management</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <FaChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <FaChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* User Role Badge */}
        {!isCollapsed && (
          <div className="px-4 pt-3 pb-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isAdmin()
                  ? "bg-purple-50 border border-purple-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              {isAdmin() ? (
                <>
                  <Shield size={16} className="text-purple-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-purple-700">
                    Administrator
                  </span>
                </>
              ) : (
                <>
                  <User size={16} className="text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-blue-700">
                    User Access
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Menu - Scrollable */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Main Menu Items */}
          <ul className="flex flex-col space-y-1">
            {!isCollapsed && (
              <li className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Main Menu
              </li>
            )}
            {mainMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={linkClasses(item.path)}
                  title={isCollapsed ? item.label : ""}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <span
                      className={`${
                        isCollapsed ? "mx-auto" : "mr-3"
                      } flex-shrink-0`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge !== null && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                        item.highlight
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {!isCollapsed && (
            <div className="my-3 border-t border-gray-200"></div>
          )}

          {/* Follow-ups Menu Items */}
          <ul className="flex flex-col space-y-1">
            {!isCollapsed && (
              <li className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FaBell size={12} />
                Follow-ups
              </li>
            )}
            {followUpItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={linkClasses(item.path)}
                  title={isCollapsed ? item.label : ""}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <span
                      className={`${
                        isCollapsed ? "mx-auto" : "mr-3"
                      } flex-shrink-0`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && item.badge !== null && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                        item.urgent
                          ? "bg-orange-500 text-white animate-pulse"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Admin Menu Items */}
          {adminItems.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="my-3 border-t border-gray-200"></div>
              )}
              <ul className="flex flex-col space-y-1">
                {!isCollapsed && (
                  <li className="px-2 py-1 text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Shield size={12} />
                    Administration
                  </li>
                )}
                {adminItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={linkClasses(item.path)}
                      title={isCollapsed ? item.label : ""}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <span
                          className={`${
                            isCollapsed ? "mx-auto" : "mr-3"
                          } flex-shrink-0 ${
                            item.adminOnly ? "text-purple-600" : ""
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Quick Stats */}
          {!isCollapsed && (
            <div className="mt-4 p-3 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-600" />
                Quick Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Total Enquiries</span>
                  <span className="text-xs font-bold text-gray-800">
                    {statistics.totalEnquiries}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">
                    Today's Follow-ups
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      statistics.todayFollowUps > 0
                        ? "text-orange-600 animate-pulse"
                        : "text-gray-800"
                    }`}
                  >
                    {statistics.todayFollowUps}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">All Follow-ups</span>
                  <span className="text-xs font-bold text-gray-800">
                    {statistics.allFollowUps}
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {currentUser?.fullName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{currentUser?.username || "username"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}

        {/* Collapsed User Profile */}
        {isCollapsed && (
          <div className="p-2 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {getUserInitials()}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className={`${
            isCollapsed ? "p-2" : "p-4"
          } text-gray-400 text-xs border-t border-gray-100 bg-gray-50 flex-shrink-0`}
        >
          {isCollapsed ? (
            <div className="text-center">
              <TrendingUp size={16} className="mx-auto text-green-500" />
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-600 mb-1">© 2025 EMS</p>
              <p className="text-gray-400">By Kali-Byte Solutions</p>
            </div>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <FaSignOutAlt className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Confirm Logout
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to logout?
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 text-sm">
              You will be redirected to the login page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
