import React, { useState, useEffect } from "react";
import { storageUtils, type EnquiryData } from "../utils/localStorage";

const ITEMS_PER_PAGE = 10;

const SearchEnquiry: React.FC = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [allEnquiries, setAllEnquiries] = useState<EnquiryData[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<EnquiryData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [interestedFilter, setInterestedFilter] = useState("All");
  const [professionFilter, setProfessionFilter] = useState("All");
  const [knowledgeFilter, setKnowledgeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal states
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryData | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EnquiryData | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("en-US", dateOptions));

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setCurrentTime(now.toLocaleTimeString("en-US", timeOptions));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadEnquiries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    searchQuery,
    statusFilter,
    interestedFilter,
    professionFilter,
    knowledgeFilter,
    fromDate,
    toDate,
    allEnquiries,
  ]);

  const loadEnquiries = () => {
    setIsLoading(true);
    try {
      const data = storageUtils.getAllEnquiries();
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllEnquiries(sorted);
      setFilteredEnquiries(sorted);
    } catch (error) {
      console.error("Error loading enquiries:", error);
      showToast("Failed to load enquiries", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      loadEnquiries();
      showToast("Enquiries refreshed successfully", "success");
    } catch (error) {
      showToast("Failed to refresh enquiries", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEnquiries];

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (enq) =>
          enq.fullName.toLowerCase().includes(term) ||
          enq.mobile.includes(term) ||
          enq.email.toLowerCase().includes(term) ||
          enq.id.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((enq) => enq.status === statusFilter);
    }

    if (interestedFilter !== "All") {
      filtered = filtered.filter(
        (enq) => enq.interestedStatus === interestedFilter
      );
    }

    if (professionFilter !== "All") {
      filtered = filtered.filter(
        (enq) =>
          enq.profession === professionFilter ||
          (enq.profession === "Other" &&
            enq.customProfession === professionFilter)
      );
    }

    if (knowledgeFilter !== "All") {
      filtered = filtered.filter(
        (enq) => enq.knowledgeOfShareMarket === knowledgeFilter
      );
    }

    if (fromDate) {
      filtered = filtered.filter((enq) => {
        const createdDate = new Date(enq.createdAt);
        return createdDate >= new Date(fromDate);
      });
    }

    if (toDate) {
      filtered = filtered.filter((enq) => {
        const createdDate = new Date(enq.createdAt);
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        return createdDate <= endDate;
      });
    }

    setFilteredEnquiries(filtered);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setInterestedFilter("All");
    setProfessionFilter("All");
    setKnowledgeFilter("All");
    setFromDate("");
    setToDate("");
  };

  const handleRowClick = (enquiry: EnquiryData) => {
    setSelectedEnquiry(enquiry);
    setEditFormData({ ...enquiry });
    setIsEditing(false);
    setEditErrors({});
    setShowDetailsModal(true);
  };

  const handleEditChange = (field: keyof EnquiryData, value: string) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [field]: value });
      if (editErrors[field]) {
        setEditErrors({ ...editErrors, [field]: "" });
      }
    }
  };

  const validateEditForm = (): boolean => {
    if (!editFormData) return false;
    const errors: Record<string, string> = {};

    if (!editFormData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!editFormData.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (editFormData.mobile.length !== 10) {
      errors.mobile = "Mobile number must be 10 digits";
    }
    if (!editFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = "Invalid email address";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !validateEditForm()) {
      showToast("Please fix the errors before saving", "error");
      return;
    }

    try {
      const updated = storageUtils.updateEnquiry(editFormData.id, {
        ...editFormData,
        updatedAt: new Date().toISOString(),
      } as Partial<EnquiryData>);
      if (updated) {
        showToast("Enquiry updated successfully", "success");
        loadEnquiries();
        setShowDetailsModal(false);
        setEditFormData(null);
        setIsEditing(false);
      } else {
        showToast("Failed to update enquiry", "error");
      }
    } catch (error) {
      console.error("Error updating enquiry:", error);
      showToast("Error updating enquiry", "error");
    }
  };

  const handleDeleteClick = (enquiry: EnquiryData) => {
    setEnquiryToDelete(enquiry.id);
    setShowDeleteConfirm(true);
    setShowDetailsModal(false);
  };

  const confirmDelete = () => {
    if (!enquiryToDelete) return;

    try {
      const success = storageUtils.deleteEnquiry(enquiryToDelete);
      if (success) {
        showToast("Enquiry deleted successfully", "success");
        loadEnquiries();
      } else {
        showToast("Failed to delete enquiry", "error");
      }
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      showToast("Error deleting enquiry", "error");
    } finally {
      setShowDeleteConfirm(false);
      setEnquiryToDelete(null);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Process":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInterestedColor = (interested: string) => {
    if (interested?.includes("100%")) return "bg-green-100 text-green-700";
    if (interested?.includes("75%")) return "bg-blue-100 text-blue-700";
    if (interested?.includes("50%")) return "bg-yellow-100 text-yellow-700";
    if (interested?.includes("25%")) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  // Pagination
  const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Icons
  const SearchIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const FilterIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const ClockIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const RefreshIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

  const XIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  const PhoneIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );

  const MailIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  // const UserIcon = () => (
  //   <svg
  //     className="w-5 h-5"
  //     fill="none"
  //     stroke="currentColor"
  //     viewBox="0 0 24 24"
  //   >
  //     <path
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth={2}
  //       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  //     />
  //   </svg>
  // );

  // const BriefcaseIcon = () => (
  //   <svg
  //     className="w-5 h-5"
  //     fill="none"
  //     stroke="currentColor"
  //     viewBox="0 0 24 24"
  //   >
  //     <path
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth={2}
  //       d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  //     />
  //   </svg>
  // );

  //

  // const TrashIcon = () => (
  //   <svg
  //     className="w-5 h-5"
  //     fill="none"
  //     stroke="currentColor"
  //     viewBox="0 0 24 24"
  //   >
  //     <path
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth={2}
  //       d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
  //     />
  //   </svg>
  // );

  // const SaveIcon = () => (
  //   <svg
  //     className="w-5 h-5"
  //     fill="none"
  //     stroke="currentColor"
  //     viewBox="0 0 24 24"
  //   >
  //     <path
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //       strokeWidth={2}
  //       d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
  //     />
  //   </svg>
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-t-xl shadow-sm px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search Enquiry
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Search and manage your enquiries
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <CalendarIcon />
                <span className="text-sm font-medium text-green-700">
                  {currentDate || "Loading..."}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <ClockIcon />
                <span className="text-sm font-medium text-blue-700">
                  {currentTime || "Loading..."}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <div className={isRefreshing ? "animate-spin" : ""}>
                  <RefreshIcon />
                </div>
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search Section */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <SearchIcon />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Search
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Search by Name, Mobile Number, Email or ID
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter name, mobile number, email or enquiry ID"
                className="w-full h-11 border border-gray-300 rounded-lg pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 
                focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-gray-400 focus:outline-none transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Filter Section */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FilterIcon />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Advanced Search Filters
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Status Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Enquiry Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white hover:border-gray-400 focus:outline-none transition-all duration-200"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Process">In Process</option>
                    <option value="Confirmed">Confirmed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Interested Status
                  </label>
                  <select
                    value={interestedFilter}
                    onChange={(e) => setInterestedFilter(e.target.value)}
                    className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white hover:border-gray-400 focus:outline-none transition-all duration-200"
                  >
                    <option value="All">All</option>
                    <option value="100% Interested">100% Interested</option>
                    <option value="75% Interested">75% Interested</option>
                    <option value="50% Interested">50% Interested</option>
                    <option value="25% Interested">25% Interested</option>
                    <option value="0% Interested">0% Interested</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Profession
                  </label>
                  <select
                    value={professionFilter}
                    onChange={(e) => setProfessionFilter(e.target.value)}
                    className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white hover:border-gray-400 focus:outline-none transition-all duration-200"
                  >
                    <option value="All">All Professions</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Business">Business</option>
                    <option value="Traider">Traider</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Knowledge Level
                  </label>
                  <select
                    value={knowledgeFilter}
                    onChange={(e) => setKnowledgeFilter(e.target.value)}
                    className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white hover:border-gray-400 focus:outline-none transition-all duration-200"
                  >
                    <option value="All">All Levels</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Date Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <CalendarIcon />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-gray-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <CalendarIcon />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-gray-400 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredEnquiries.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {allEnquiries.length}
                </span>{" "}
                results
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border-2 border-gray-300 font-medium text-sm transition-all duration-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Table Section */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">
              Search Results
            </h3>
            <span className="text-xs text-gray-500">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredEnquiries.length)} of{" "}
              {filteredEnquiries.length} results
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : currentEnquiries.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <SearchIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Interest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Profession
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEnquiries.map((item, i) => (
                      <tr
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        className={`cursor-pointer transition-colors ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-green-50`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.mobile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                          {item.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getInterestedColor(
                              item.interestedStatus
                            )}`}
                          >
                            {item.interestedStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.profession === "Other"
                            ? item.customProfession
                            : item.profession}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {currentEnquiries.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="p-4 hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.fullName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{item.id}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneIcon />
                        {item.mobile}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MailIcon />
                        <span className="truncate">{item.email}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getInterestedColor(
                            item.interestedStatus
                          )}`}
                        >
                          {item.interestedStatus}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.profession === "Other"
                            ? item.customProfession
                            : item.profession}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {startIndex + 1}-{Math.min(endIndex, filteredEnquiries.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {filteredEnquiries.length}
              </span>{" "}
              results
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 py-2 text-gray-500">...</span>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && editFormData && (
        <EditableDetailsModal
          enquiry={editFormData}
          errors={editErrors}
          isEditing={isEditing}
          onClose={() => {
            setShowDetailsModal(false);
            setEditFormData(null);
            setIsEditing(false);
            setEditErrors({});
          }}
          onEdit={() => setIsEditing(true)}
          onChange={handleEditChange}
          onSave={handleSaveEdit}
          onCancel={() => {
            setEditFormData(selectedEnquiry ? { ...selectedEnquiry } : null);
            setIsEditing(false);
            setEditErrors({});
          }}
          onDelete={() => handleDeleteClick(editFormData)}
          getStatusColor={getStatusColor}
          getInterestedColor={getInterestedColor}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Editable Details Modal Component
const EditableDetailsModal: React.FC<any> = ({
  enquiry,
  errors,
  isEditing,
  onClose,
  onEdit,
  onChange,
  onSave,
  onCancel,
  onDelete,
  getStatusColor,
  getInterestedColor,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const XIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  const UserIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

  const PhoneIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );

  const MailIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const MapIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const BriefcaseIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const BookIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );

  const CardIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const ClockIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const InfoIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const FileIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const TrashIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );

  const PencilIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );

  const SaveIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8 max-h-[95vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold">
              {isEditing ? "Edit Enquiry" : "Enquiry Details"}
            </h2>
            <p className="text-sm text-green-100 mt-1">ID: {enquiry.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <EditableSection title="Personal Information" icon={<UserIcon />}>
              <EditableField
                icon={<UserIcon />}
                label="Full Name"
                value={enquiry.fullName}
                isEditing={isEditing}
                onChange={(val: any) => onChange("fullName", val)}
                error={errors.fullName}
                required
              />
              <EditableField
                icon={<PhoneIcon />}
                label="Mobile Number"
                value={enquiry.mobile}
                isEditing={isEditing}
                onChange={(val: any) => onChange("mobile", val)}
                error={errors.mobile}
                maxLength={10}
                required
              />
              <EditableField
                icon={<PhoneIcon />}
                label="Alternate Mobile"
                value={enquiry.alternateMobile || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("alternateMobile", val)}
                maxLength={10}
              />
              <EditableField
                icon={<MailIcon />}
                label="Email Address"
                value={enquiry.email}
                isEditing={isEditing}
                onChange={(val: any) => onChange("email", val)}
                error={errors.email}
                type="email"
                required
              />
              <EditableTextArea
                icon={<MapIcon />}
                label="Address"
                value={enquiry.address || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("address", val)}
                rows={3}
              />
              <EditableField
                icon={<CardIcon />}
                label="Aadhar Number"
                value={enquiry.aadharNumber || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("aadharNumber", val)}
                maxLength={14}
              />
              <EditableField
                icon={<CardIcon />}
                label="PAN Number"
                value={enquiry.panNumber || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("panNumber", val)}
                maxLength={10}
              />
            </EditableSection>

            {/* Professional & Demat Information */}
            <EditableSection
              title="Professional Information"
              icon={<BriefcaseIcon />}
            >
              <EditableSelect
                icon={<BriefcaseIcon />}
                label="Profession"
                value={enquiry.profession}
                isEditing={isEditing}
                onChange={(val: any) => onChange("profession", val)}
                options={[
                  "Farmer",
                  "Business",
                  "Traider",
                  "Self-Employed",
                  "Student",
                  "Retired",
                  "Other",
                ]}
              />
              {enquiry.profession === "Other" && (
                <EditableField
                  label="Custom Profession"
                  value={enquiry.customProfession || ""}
                  isEditing={isEditing}
                  onChange={(val: any) => onChange("customProfession", val)}
                />
              )}
              <EditableSelect
                icon={<BookIcon />}
                label="Share Market Knowledge"
                value={enquiry.knowledgeOfShareMarket || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("knowledgeOfShareMarket", val)}
                options={[
                  "Fresher",
                  "Intermediate",
                  "Advanced",
                  "Professional",
                ]}
              />
              <EditableField
                icon={<CardIcon />}
                label="Demat Account ID 1"
                value={enquiry.demateAccount1 || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("demateAccount1", val)}
              />
              <EditableField
                icon={<CardIcon />}
                label="Demat Account ID 2"
                value={enquiry.demateAccount2 || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("demateAccount2", val)}
              />
            </EditableSection>

            {/* Enquiry Status Information */}
            <EditableSection title="Status Information" icon={<InfoIcon />}>
              <EditableSelect
                label="Enquiry State"
                value={enquiry.enquiryState || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("enquiryState", val)}
                options={[
                  "Andhra Pradesh",
                  "Arunachal Pradesh",
                  "Assam",
                  "Bihar",
                  "Chhattisgarh",
                  "Goa",
                  "Gujarat",
                  "Haryana",
                  "Himachal Pradesh",
                  "Jharkhand",
                  "Karnataka",
                  "Kerala",
                  "Madhya Pradesh",
                  "Maharashtra",
                  "Manipur",
                  "Meghalaya",
                  "Mizoram",
                  "Nagaland",
                  "Odisha",
                  "Punjab",
                  "Rajasthan",
                  "Sikkim",
                  "Tamil Nadu",
                  "Telangana",
                  "Tripura",
                  "Uttar Pradesh",
                  "Uttarakhand",
                  "West Bengal",
                  "Delhi",
                ]}
              />
              <EditableSelect
                label="Enquiry Status"
                value={enquiry.status}
                isEditing={isEditing}
                onChange={(val: any) => onChange("status", val)}
                options={["Pending", "In Process", "Confirmed"]}
                colorClass={getStatusColor(enquiry.status)}
                required
              />
              <EditableSelect
                label="Interest Level"
                value={enquiry.interestedStatus}
                isEditing={isEditing}
                onChange={(val: any) => onChange("interestedStatus", val)}
                options={[
                  "100% Interested",
                  "75% Interested",
                  "50% Interested",
                  "25% Interested",
                  "0% Interested",
                ]}
                colorClass={getInterestedColor(enquiry.interestedStatus)}
              />
              <EditableSelect
                label="Source of Enquiry"
                value={enquiry.sourceOfEnquiry || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("sourceOfEnquiry", val)}
                options={[
                  "Phone Call",
                  "Walk-in",
                  "Referral",
                  "Social Media",
                  "Email",
                  "Advertisement",
                ]}
              />
            </EditableSection>

            {/* Additional Information */}
            <EditableSection title="Additional Information" icon={<FileIcon />}>
              <EditableSelect
                label="How did you know about us?"
                value={enquiry.howDidYouKnow || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("howDidYouKnow", val)}
                options={[
                  "Google Search",
                  "Facebook",
                  "Instagram",
                  "LinkedIn",
                  "Friend/Family",
                  "Advertisement",
                  "Other",
                ]}
              />
              {enquiry.howDidYouKnow === "Other" && (
                <EditableField
                  label="Custom Source"
                  value={enquiry.customHowDidYouKnow || ""}
                  isEditing={isEditing}
                  onChange={(val: any) => onChange("customHowDidYouKnow", val)}
                />
              )}
              <EditableField
                icon={<CalendarIcon />}
                label="Call Back Date"
                value={
                  isEditing
                    ? formatDateForInput(enquiry.callBackDate || "")
                    : enquiry.callBackDate
                    ? formatDate(enquiry.callBackDate)
                    : ""
                }
                isEditing={isEditing}
                onChange={(val: any) => onChange("callBackDate", val)}
                type={isEditing ? "date" : "text"}
              />
              <EditableField
                icon={<CalendarIcon />}
                label="Deposit Inward Date"
                value={
                  isEditing
                    ? formatDateForInput(enquiry.depositInwardDate || "")
                    : enquiry.depositInwardDate
                    ? formatDate(enquiry.depositInwardDate)
                    : ""
                }
                isEditing={isEditing}
                onChange={(val: any) => onChange("depositInwardDate", val)}
                type={isEditing ? "date" : "text"}
              />
              <EditableField
                icon={<CalendarIcon />}
                label="Deposit Outward Date"
                value={
                  isEditing
                    ? formatDateForInput(enquiry.depositOutwardDate || "")
                    : enquiry.depositOutwardDate
                    ? formatDate(enquiry.depositOutwardDate)
                    : ""
                }
                isEditing={isEditing}
                onChange={(val: any) => onChange("depositOutwardDate", val)}
                type={isEditing ? "date" : "text"}
              />
              <div className="py-2 border-t border-gray-200 mt-2">
                <p className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                  <ClockIcon />
                  Enquiry Created
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(enquiry.createdAt)}
                </p>
              </div>
              {enquiry.updatedAt && enquiry.updatedAt !== enquiry.createdAt && (
                <div className="py-2">
                  <p className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                    <ClockIcon />
                    Last Updated
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(enquiry.updatedAt)}
                  </p>
                </div>
              )}
            </EditableSection>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={onDelete}
            className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <TrashIcon />
            Delete Enquiry
          </button>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={onCancel}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
                >
                  <SaveIcon />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={onEdit}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
                >
                  <PencilIcon />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditableSection: React.FC<any> = ({ title, icon, children }) => (
  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-300 pb-2">
      <span className="text-green-600">{icon}</span>
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const EditableField: React.FC<any> = ({
  icon,
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  error,
  required,
  maxLength,
}) => (
  <div className="flex items-start gap-3 py-2">
    {icon && <div className="text-gray-400 mt-2.5">{icon}</div>}
    <div className="flex-1">
      <label className="text-xs text-gray-500 mb-1 font-medium block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isEditing ? (
        <div>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-200 ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-green-500"
            }`}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      ) : (
        <div className="text-sm font-medium text-gray-800">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </div>
      )}
    </div>
  </div>
);

const EditableSelect: React.FC<any> = ({
  icon,
  label,
  value,
  isEditing,
  onChange,
  options,
  colorClass,
  required,
}) => (
  <div className="flex items-start gap-3 py-2">
    {icon && <div className="text-gray-400 mt-2.5">{icon}</div>}
    <div className="flex-1">
      <label className="text-xs text-gray-500 mb-1 font-medium block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-200"
        >
          <option value="">Select {label}</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-sm font-medium text-gray-800">
          {colorClass ? (
            <span className={`px-3 py-1.5 rounded-full text-sm ${colorClass}`}>
              {value}
            </span>
          ) : (
            value || <span className="text-gray-400 italic">Not selected</span>
          )}
        </div>
      )}
    </div>
  </div>
);

const EditableTextArea: React.FC<any> = ({
  icon,
  label,
  value,
  isEditing,
  onChange,
  rows = 3,
}) => (
  <div className="flex items-start gap-3 py-2">
    {icon && <div className="text-gray-400 mt-2.5">{icon}</div>}
    <div className="flex-1">
      <label className="text-xs text-gray-500 mb-1 font-medium block">
        {label}
      </label>
      {isEditing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 focus:outline-none resize-none transition-all duration-200"
        />
      ) : (
        <div className="text-sm font-medium text-gray-800 whitespace-pre-wrap">
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </div>
      )}
    </div>
  </div>
);

const DeleteConfirmModal: React.FC<any> = ({ onConfirm, onCancel }) => {
  const TrashIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <TrashIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Enquiry</h3>
            <p className="text-sm text-gray-600 mt-1">
              This action cannot be undone
            </p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this enquiry? All associated data will
          be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Toast: React.FC<any> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in-right ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default SearchEnquiry;
