import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  X,
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  Save,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { storageUtils, type EnquiryData } from "../utils/localStorage";

const TodaysFollowUps: React.FC = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [todaysFollowUps, setTodaysFollowUps] = useState<EnquiryData[]>([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState<EnquiryData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryData | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EnquiryData | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadTodaysFollowUps();
  }, []);

  useEffect(() => {
    filterFollowUps();
  }, [searchTerm, todaysFollowUps]);

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

  const loadTodaysFollowUps = () => {
    setIsLoading(true);
    try {
      const allEnquiries = storageUtils.getAllEnquiries();
      const todayFollowUps = allEnquiries.filter((enquiry) =>
        isToday(enquiry.callBackDate)
      );

      const sorted = todayFollowUps.sort((a, b) => {
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;
        return 0;
      });

      setTodaysFollowUps(sorted);
      setFilteredFollowUps(sorted);
    } catch (error) {
      console.error("Error loading today's follow-ups:", error);
      showToast("Failed to load today's follow-ups", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      loadTodaysFollowUps();
      showToast("Follow-ups refreshed successfully", "success");
    } catch (error) {
      showToast("Failed to refresh follow-ups", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterFollowUps = () => {
    if (!searchTerm.trim()) {
      setFilteredFollowUps(todaysFollowUps);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = todaysFollowUps.filter(
      (enquiry) =>
        enquiry.fullName.toLowerCase().includes(term) ||
        enquiry.mobile.includes(term) ||
        enquiry.email.toLowerCase().includes(term) ||
        enquiry.id.toLowerCase().includes(term)
    );
    setFilteredFollowUps(filtered);
  };

  const handleRowClick = (enquiry: EnquiryData) => {
    setSelectedEnquiry(enquiry);
    setShowDetailsModal(true);
  };

  const handleEdit = (enquiry: EnquiryData) => {
    setEditFormData({ ...enquiry });
    setEditErrors({});
    setShowEditModal(true);
    setShowDetailsModal(false);
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
      const updated = storageUtils.updateEnquiry(editFormData.id, editFormData);
      if (updated) {
        showToast("Follow-up updated successfully", "success");
        loadTodaysFollowUps();
        setShowEditModal(false);
        setEditFormData(null);
      } else {
        showToast("Failed to update follow-up", "error");
      }
    } catch (error) {
      console.error("Error updating follow-up:", error);
      showToast("Error updating follow-up", "error");
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

  const pendingCount = todaysFollowUps.filter(
    (f) => f.status === "Pending"
  ).length;
  const completedCount = todaysFollowUps.filter(
    (f) => f.status === "Confirmed"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-t-xl shadow-sm px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Today's Follow Ups
              </h1>
              <div className="flex items-center gap-3 text-sm flex-wrap">
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
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Follow Ups</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {todaysFollowUps.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {pendingCount}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertCircle size={24} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedCount}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by Name, Mobile, Email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
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

        {/* Table Section */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">
              Today's Scheduled Callbacks
            </h3>
            <span className="text-xs text-gray-500">
              {filteredFollowUps.length} follow-ups
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredFollowUps.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No follow-ups for today
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Great! You're all caught up for today"}
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
                        Interest Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Profession
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFollowUps.map((item, i) => (
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
                {filteredFollowUps.map((item) => (
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
                        <Phone size={14} />
                        {item.mobile}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
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
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEnquiry && (
        <DetailsModal
          enquiry={selectedEnquiry}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => handleEdit(selectedEnquiry)}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <EditModal
          enquiry={editFormData}
          errors={editErrors}
          onChange={handleEditChange}
          onSave={handleSaveEdit}
          onCancel={() => {
            setShowEditModal(false);
            setEditFormData(null);
            setEditErrors({});
          }}
        />
      )}

      {/* Toast Notification */}
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

// Details Modal Component
const DetailsModal: React.FC<{
  enquiry: EnquiryData;
  onClose: () => void;
  onEdit: () => void;
  getStatusColor: (status: string) => string;
}> = ({ enquiry, onClose, onEdit, getStatusColor }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
        <div>
          <h2 className="text-xl font-bold">Today's Follow Up Details</h2>
          <p className="text-sm text-green-100 mt-1">ID: {enquiry.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailSection title="Personal Information" icon={<User size={20} />}>
            <DetailRow
              icon={<User size={16} />}
              label="Full Name"
              value={enquiry.fullName}
            />
            <DetailRow
              icon={<Phone size={16} />}
              label="Mobile"
              value={enquiry.mobile}
            />
            <DetailRow
              icon={<Phone size={16} />}
              label="Alternate Mobile"
              value={enquiry.alternateMobile || "N/A"}
            />
            <DetailRow
              icon={<Mail size={16} />}
              label="Email"
              value={enquiry.email}
            />
            <DetailRow
              icon={<MapPin size={16} />}
              label="Address"
              value={enquiry.address || "N/A"}
            />
          </DetailSection>

          <DetailSection
            title="Follow Up Information"
            icon={<Calendar size={20} />}
          >
            <DetailRow
              icon={<Calendar size={16} />}
              label="Callback Date"
              value="Today"
            />
            <DetailRow
              label="Status"
              value={
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    enquiry.status
                  )}`}
                >
                  {enquiry.status}
                </span>
              }
            />
            <DetailRow
              label="Interest Level"
              value={enquiry.interestedStatus}
            />
            <DetailRow
              icon={<Briefcase size={16} />}
              label="Profession"
              value={
                enquiry.profession === "Other"
                  ? enquiry.customProfession
                  : enquiry.profession
              }
            />
            <DetailRow label="Source" value={enquiry.sourceOfEnquiry} />
          </DetailSection>

          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created At:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {new Date(enquiry.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {new Date(enquiry.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 rounded-b-xl">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Pencil size={16} />
          Edit Follow Up
        </button>
      </div>
    </div>
  </div>
);

const DetailSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
      <span className="text-green-600">{icon}</span>
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailRow: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

const EditModal: React.FC<any> = ({
  enquiry,
  errors,
  onChange,
  onSave,
  onCancel,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
      <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
        <div>
          <h2 className="text-xl font-bold">Edit Today's Follow Up</h2>
          <p className="text-sm text-green-100 mt-1">ID: {enquiry.id}</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Personal Information
            </h3>
            <EditField
              label="Full Name"
              value={enquiry.fullName}
              onChange={(val: any) => onChange("fullName", val)}
              error={errors.fullName}
              required
            />
            <EditField
              label="Mobile"
              value={enquiry.mobile}
              onChange={(val: any) => onChange("mobile", val)}
              error={errors.mobile}
              maxLength={10}
              required
            />
            <EditField
              label="Alternate Mobile"
              value={enquiry.alternateMobile}
              onChange={(val: any) => onChange("alternateMobile", val)}
              maxLength={10}
            />
            <EditField
              label="Email"
              type="email"
              value={enquiry.email}
              onChange={(val: any) => onChange("email", val)}
              error={errors.email}
              required
            />
            <EditTextArea
              label="Address"
              value={enquiry.address}
              onChange={(val: any) => onChange("address", val)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Follow Up Details
            </h3>
            <EditField
              label="Callback Date"
              type="date"
              value={enquiry.callBackDate}
              onChange={(val: any) => onChange("callBackDate", val)}
              required
            />
            <EditSelect
              label="Status"
              value={enquiry.status}
              onChange={(val: any) => onChange("status", val)}
              options={["Confirmed", "Pending", "In Process"]}
              required
            />
            <EditSelect
              label="Interest Level"
              value={enquiry.interestedStatus}
              onChange={(val: any) => onChange("interestedStatus", val)}
              options={[
                "100% Interested",
                "75% Interested",
                "50% Interested",
                "25% Interested",
                "0% Interested",
              ]}
            />
            <EditSelect
              label="Profession"
              value={enquiry.profession}
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
              <EditField
                label="Custom Profession"
                value={enquiry.customProfession}
                onChange={(val: any) => onChange("customProfession", val)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 rounded-b-xl">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

const EditField: React.FC<any> = ({
  label,
  value,
  onChange,
  type = "text",
  error,
  required,
  maxLength,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none ${
        error
          ? "border-red-400 focus:ring-red-200 focus:border-red-500"
          : "border-gray-300 focus:ring-green-200 focus:border-green-500"
      }`}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const EditTextArea: React.FC<any> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none resize-none border-gray-300 focus:ring-green-200 focus:border-green-500"
    />
  </div>
);

const EditSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}> = ({ label, value, onChange, options, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none border-gray-300 focus:ring-green-200 focus:border-green-500"
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

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
        <X size={16} />
      </button>
    </div>
  );
};

export default TodaysFollowUps;
