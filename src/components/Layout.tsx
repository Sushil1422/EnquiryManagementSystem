import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  UserPlus,
  Search,
  Eye,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  User,
  Bell,
} from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/",
      icon: <Home size={20} />,
      label: "Dashboard",
      roles: ["admin", "user"],
    },
    {
      path: "/add-enquiry",
      icon: <UserPlus size={20} />,
      label: "Add Enquiry",
      roles: ["admin", "user"],
    },
    {
      path: "/view-enquiry",
      icon: <Eye size={20} />,
      label: "View Enquiries",
      roles: ["admin", "user"],
    },
    {
      path: "/search-enquiry",
      icon: <Search size={20} />,
      label: "Search Enquiry",
      roles: ["admin", "user"],
    },
    {
      path: "/user-management",
      icon: <Users size={20} />,
      label: "User Management",
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(currentUser?.role || "user")
  );

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gradient-to-b from-green-800 to-green-900 border-r border-green-700">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-green-900 border-b border-green-700">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EnquiryPro</h1>
                <p className="text-xs text-green-300">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-white text-green-700 shadow-md"
                    : "text-green-100 hover:bg-green-700 hover:text-white"
                }`}
              >
                <span
                  className={
                    isActive(item.path) ? "text-green-600" : "text-green-300"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-green-700 bg-green-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                <User size={20} className="text-green-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.fullName}
                </p>
                <p className="text-xs text-green-300 truncate">
                  {currentUser?.role === "admin" ? "Administrator" : "User"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-800 to-green-900 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-green-900 border-b border-green-700">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EnquiryPro</h1>
                <p className="text-xs text-green-300">Management</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-white hover:bg-green-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-white text-green-700 shadow-md"
                    : "text-green-100 hover:bg-green-700 hover:text-white"
                }`}
              >
                <span
                  className={
                    isActive(item.path) ? "text-green-600" : "text-green-300"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-green-700 bg-green-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                <User size={20} className="text-green-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.fullName}
                </p>
                <p className="text-xs text-green-300 truncate">
                  {currentUser?.role === "admin" ? "Administrator" : "User"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Mobile */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">EnquiryPro</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
            </button>

            {/* Mobile User Menu Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentUser?.email || currentUser?.username}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                        currentUser?.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {currentUser?.role === "admin" ? "Administrator" : "User"}
                    </span>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Top Header - Desktop */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredMenuItems.find((item) => isActive(item.path))?.label ||
                "Dashboard"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Welcome back, {currentUser?.fullName}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.role === "admin" ? "Administrator" : "User"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Desktop User Menu Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentUser?.email || currentUser?.username}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                          currentUser?.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {currentUser?.role === "admin"
                          ? "Administrator"
                          : "User"}
                      </span>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area - NO PADDING HERE */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
