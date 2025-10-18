// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TodaysFollowUps from "./pages/TodaysFollowUps";
import AllFollowUps from "./pages/AllFollowUps";
import AddEnquiry from "./pages/AddEnquiry";
import ViewEnquiry from "./pages/ViewEnquiry";
import SearchEnquiry from "./pages/SearchEnquiry";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Follow Ups */}
        <Route path="/follow-ups/today" element={<TodaysFollowUps />} />
        <Route path="/follow-ups/all" element={<AllFollowUps />} />

        {/* Enquiries */}
        <Route path="/enquiries/search" element={<SearchEnquiry />} />
        <Route path="/enquiries/add" element={<AddEnquiry />} />
        <Route path="/enquiries/view" element={<ViewEnquiry />} />
      </Routes>
    </Router>
  );
};

export default App;
