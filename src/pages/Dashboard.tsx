import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import stats from "../data/stats";
import { HiMenu } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // 👈 for animations

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const navigate = useNavigate();

  // Map stat title to navigation path
  const handleCardClick = (title: string) => {
    if (title === "Follow Ups") navigate("/follow-ups/all");
    else if (title === "Enquiries (Total)") navigate("/enquiries/view");
    else if (title === "Users (Total)") navigate("/enquiries/view");
    // Add other mappings as needed
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black opacity-25"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white p-6 shadow-md z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-12 relative">
        {/* Mobile Hamburger */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-white shadow-md"
          >
            <HiMenu className="w-6 h-6" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome to your admin dashboard</p>

        {/* Responsive Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.title}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="relative"
              onMouseEnter={() => setHoveredCard(stat.title)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <button
                onClick={() => handleCardClick(stat.title)}
                className="w-full"
              >
                <StatCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  iconBgColor={stat.iconBgColor}
                />
              </button>

              {/* Popup tooltip on hover */}
              {hoveredCard === stat.title && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white shadow-lg border border-gray-200 rounded-md px-4 py-2 text-sm text-gray-700 z-50"
                >
                  <div className="font-semibold">{stat.title}</div>
                  <div className="text-gray-500">Click to view details</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
