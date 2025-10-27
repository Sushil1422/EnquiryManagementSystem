import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  RefreshCw,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  User,
  Briefcase,
  BookOpen,
  Save,
  Pencil,
  Trash2,
  Clock,
  FileText,
  Info,
} from "lucide-react";
import { storageUtils, type EnquiryData } from "../utils/localStorage";
import { useAuth } from "../contexts/AuthContext";

const ViewEnquiry: React.FC = () => {
  const { canDelete } = useAuth(); // Add permission check

  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<EnquiryData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryData | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [editFormData, setEditFormData] = useState<EnquiryData | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

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
    filterEnquiries();
  }, [searchTerm, statusFilter, stateFilter, enquiries]);

  const loadEnquiries = () => {
    setIsLoading(true);
    try {
      const data = storageUtils.getAllEnquiries();
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEnquiries(sortedData);
      setFilteredEnquiries(sortedData);
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

  const filterEnquiries = () => {
    let filtered = [...enquiries];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
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

    if (stateFilter !== "All") {
      filtered = filtered.filter((enq) => enq.enquiryState === stateFilter);
    }

    setFilteredEnquiries(filtered);
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
    if (!editFormData.enquiryState) {
      errors.enquiryState = "State is required";
    }
    if (!editFormData.status) {
      errors.status = "Status is required";
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
      });
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
    // Add permission check
    if (!canDelete()) {
      showToast("You don't have permission to delete enquiries", "error");
      return;
    }

    setEnquiryToDelete(enquiry.id);
    setShowDeleteConfirm(true);
    setShowDetailsModal(false);
  };

  const confirmDelete = () => {
    if (!enquiryToDelete) return;

    // Double check permission
    if (!canDelete()) {
      showToast("Only administrators can delete enquiries", "error");
      setShowDeleteConfirm(false);
      setEnquiryToDelete(null);
      return;
    }

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

  const handleExportCSV = () => {
    try {
      storageUtils.downloadCSVBackup();
      showToast("CSV exported successfully", "success");
    } catch (error) {
      showToast("Failed to export CSV", "error");
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

  const uniqueStates = Array.from(
    new Set(enquiries.map((e) => e.enquiryState))
  ).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Permission Info Banner */}
        {!canDelete() && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  User Permissions
                </h4>
                <p className="text-xs text-blue-700">
                  You can view and edit enquiries, but deletion is restricted to
                  administrators only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-t-xl shadow-sm px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                View Enquiries
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and track all enquiries
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <Calendar size={18} />
                <span className="text-sm font-medium text-green-700">
                  {currentDate || "Loading..."}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock size={18} />
                <span className="text-sm font-medium text-blue-700">
                  {currentTime || "Loading..."}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Enquiries"
              value={enquiries.length}
              color="blue"
              icon={<User size={24} />}
            />
            <StatCard
              title="Confirmed"
              value={enquiries.filter((e) => e.status === "Confirmed").length}
              color="green"
              icon={<User size={24} />}
            />
            <StatCard
              title="Pending"
              value={enquiries.filter((e) => e.status === "Pending").length}
              color="yellow"
              icon={<User size={24} />}
            />
            <StatCard
              title="In Process"
              value={enquiries.filter((e) => e.status === "In Process").length}
              color="purple"
              icon={<User size={24} />}
            />
          </div>
        </div>

        {/* Search & Filters Section */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Search size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Search & Filter
            </h2>
          </div>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Search by Name, Mobile, Email or ID
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, Mobile, Email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 
                  focus:ring-2 focus:ring-green-200 focus:border-green-500 hover:border-gray-400 focus:outline-none transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Filter by State
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white hover:border-gray-400 focus:outline-none transition-all duration-200"
                >
                  <option value="All">All States</option>
                  {uniqueStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 bg-white hover:border-gray-400 focus:outline-none transition-all duration-200"
                >
                  <option value="All">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Process">In Process</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredEnquiries.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {enquiries.length}
                </span>{" "}
                enquiries
              </p>
            </div>
          </div>
        </div>

        {/* Results Table Section */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">
              All Enquiries
            </h3>
            <span className="text-xs text-gray-500">
              {filteredEnquiries.length} results
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No enquiries found
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "All" || stateFilter !== "All"
                  ? "Try adjusting your filters"
                  : "Start by adding your first enquiry"}
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
                        State
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Interest Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEnquiries.map((enquiry, i) => (
                      <tr
                        key={enquiry.id}
                        onClick={() => handleRowClick(enquiry)}
                        className={`cursor-pointer transition-colors ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-green-50`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {enquiry.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {enquiry.mobile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">
                          {enquiry.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {enquiry.enquiryState}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              enquiry.status
                            )}`}
                          >
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getInterestedColor(
                              enquiry.interestedStatus
                            )}`}
                          >
                            {enquiry.interestedStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredEnquiries.map((enquiry) => (
                  <div
                    key={enquiry.id}
                    onClick={() => handleRowClick(enquiry)}
                    className="p-4 hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {enquiry.fullName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {enquiry.id}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          enquiry.status
                        )}`}
                      >
                        {enquiry.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        {enquiry.mobile}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        <span className="truncate">{enquiry.email}</span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getInterestedColor(
                            enquiry.interestedStatus
                          )}`}
                        >
                          {enquiry.interestedStatus}
                        </span>
                        <span className="text-xs text-gray-500">
                          {enquiry.enquiryState}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
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
          canDelete={canDelete()} // Pass permission prop
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

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}> = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-100 text-blue-600",
    green: "border-green-500 bg-green-100 text-green-600",
    yellow: "border-yellow-500 bg-yellow-100 text-yellow-600",
    purple: "border-purple-500 bg-purple-100 text-purple-600",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
        colorClasses[color as keyof typeof colorClasses]?.split(" ")[0]
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`p-3 rounded-full ${colorClasses[
            color as keyof typeof colorClasses
          ]
            ?.split(" ")
            .slice(1)
            .join(" ")}`}
        >
          {icon}
        </div>
      </div>
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
  canDelete = false, // Add canDelete prop with default value
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8 max-h-[95vh] overflow-hidden flex flex-col">
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
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <EditableSection
              title="Personal Information"
              icon={<User size={20} />}
            >
              <EditableField
                icon={<User size={16} />}
                label="Full Name"
                value={enquiry.fullName}
                isEditing={isEditing}
                onChange={(val: any) => onChange("fullName", val)}
                error={errors.fullName}
                required
              />
              <EditableField
                icon={<Phone size={16} />}
                label="Mobile Number"
                value={enquiry.mobile}
                isEditing={isEditing}
                onChange={(val: any) => onChange("mobile", val)}
                error={errors.mobile}
                maxLength={10}
                required
              />
              <EditableField
                icon={<Phone size={16} />}
                label="Alternate Mobile"
                value={enquiry.alternateMobile || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("alternateMobile", val)}
                maxLength={10}
              />
              <EditableField
                icon={<Mail size={16} />}
                label="Email Address"
                value={enquiry.email}
                isEditing={isEditing}
                onChange={(val: any) => onChange("email", val)}
                error={errors.email}
                type="email"
                required
              />
              <EditableTextArea
                icon={<MapPin size={16} />}
                label="Address"
                value={enquiry.address || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("address", val)}
                rows={3}
              />
            </EditableSection>

            {/* Document Information */}
            <EditableSection
              title="Document Information"
              icon={<CreditCard size={20} />}
            >
              <EditableField
                icon={<CreditCard size={16} />}
                label="Aadhar Number"
                value={enquiry.aadharNumber || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("aadharNumber", val)}
                maxLength={14}
              />
              <EditableField
                icon={<CreditCard size={16} />}
                label="PAN Number"
                value={enquiry.panNumber || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("panNumber", val)}
                maxLength={10}
              />
              <EditableField
                icon={<CreditCard size={16} />}
                label="Demat Account ID 1"
                value={enquiry.demateAccount1 || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("demateAccount1", val)}
              />
              <EditableField
                icon={<CreditCard size={16} />}
                label="Demat Account ID 2"
                value={enquiry.demateAccount2 || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("demateAccount2", val)}
              />
            </EditableSection>

            {/* Enquiry Details */}
            <EditableSection
              title="Enquiry Details"
              icon={<Briefcase size={20} />}
            >
              <EditableSelect
                icon={<MapPin size={16} />}
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
                required
                error={errors.enquiryState}
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
              <EditableSelect
                label="Interest Level"
                value={enquiry.interestedStatus || ""}
                isEditing={isEditing}
                onChange={(val: any) => onChange("interestedStatus", val)}
                options={[
                  "100% Interested",
                  "75% Interested",
                  "50% Interested",
                  "25% Interested",
                  "0% Interested",
                ]}
                colorClass={
                  !isEditing
                    ? getInterestedColor(enquiry.interestedStatus)
                    : undefined
                }
              />
              <EditableSelect
                label="Status"
                value={enquiry.status}
                isEditing={isEditing}
                onChange={(val: any) => onChange("status", val)}
                options={["Pending", "In Process", "Confirmed"]}
                colorClass={
                  !isEditing ? getStatusColor(enquiry.status) : undefined
                }
                required
                error={errors.status}
              />
            </EditableSection>

            {/* Professional Information */}
            <EditableSection
              title="Professional Information"
              icon={<BookOpen size={20} />}
            >
              <EditableSelect
                icon={<Briefcase size={16} />}
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
                icon={<BookOpen size={16} />}
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
            </EditableSection>

            {/* Important Dates */}
            <EditableSection
              title="Important Dates"
              icon={<Calendar size={20} />}
            >
              <EditableField
                icon={<Calendar size={16} />}
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
                icon={<Calendar size={16} />}
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
                icon={<Calendar size={16} />}
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
            </EditableSection>

            {/* Additional Information */}
            <EditableSection
              title="Additional Information"
              icon={<FileText size={20} />}
            >
              <div className="py-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                  <Clock size={14} />
                  Enquiry Created
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(enquiry.createdAt)}
                </p>
              </div>
              {enquiry.updatedAt && enquiry.updatedAt !== enquiry.createdAt && (
                <div className="py-2">
                  <p className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1">
                    <Clock size={14} />
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

        {/* Footer - Updated with permission check */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex flex-col sm:flex-row justify-between gap-3">
          {/* Only show delete button for admins */}
          {canDelete ? (
            <button
              onClick={onDelete}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Trash2 size={16} />
              Delete Enquiry
            </button>
          ) : (
            <div className="flex-1"></div>
          )}

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
                  <Save size={16} />
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
                  <Pencil size={16} />
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
  error,
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
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-200 ${
              error ? "border-red-400" : "border-gray-300"
            }`}
          >
            <option value="">Select {label}</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
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

const DeleteConfirmModal: React.FC<any> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-red-100 rounded-full">
          <Trash2 size={24} className="text-red-600" />
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

const Toast: React.FC<any> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
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
        <X size={16} />
      </button>
    </div>
  );
};

export default ViewEnquiry;
