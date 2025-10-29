import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  RefreshCw,
  X,
  FileSpreadsheet,
  Phone,
  Mail,
  CreditCard,
  User as UserIcon,
  Calendar,
  Trash2,
  Edit,
  Save,
  AlertCircle,
} from "lucide-react";
import {
  advertisementStorage,
  type AdvertisementEnquiry,
} from "../utils/advertisementStorage";
import { useAuth } from "../contexts/AuthContext";

const AdvertisementEnquiries: React.FC = () => {
  const { isAdmin } = useAuth(); // Get admin status
  const [enquiries, setEnquiries] = useState<AdvertisementEnquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<
    AdvertisementEnquiry[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] =
    useState<AdvertisementEnquiry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<AdvertisementEnquiry | null>(
    null
  );
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    todayImported: 0,
    withAadhar: 0,
    withPAN: 0,
  });

  useEffect(() => {
    loadEnquiries();
  }, []);

  useEffect(() => {
    filterEnquiries();
  }, [searchTerm, enquiries]);

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = advertisementStorage.getAllAdvertisementEnquiries();
      const sortedData = (await data).sort(
        (a, b) =>
          new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()
      );
      setEnquiries(sortedData);
      setFilteredEnquiries(sortedData);
      setStatistics(await advertisementStorage.getStatistics());
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
          enq.name.toLowerCase().includes(term) ||
          enq.phoneNo.includes(term) ||
          enq.email.toLowerCase().includes(term) ||
          enq.id.toLowerCase().includes(term)
      );
    }

    setFilteredEnquiries(filtered);
  };

  const handleRowClick = (enquiry: AdvertisementEnquiry) => {
    setSelectedEnquiry(enquiry);
    setEditFormData({ ...enquiry });
    setIsEditing(false);
    setEditErrors({});
    setShowDetailsModal(true);
  };

  const handleEditChange = (
    field: keyof AdvertisementEnquiry,
    value: string
  ) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [field]: value });
      if (editErrors[field]) {
        setEditErrors({ ...editErrors, [field]: "" });
      }
    }
  };

  const validateEditForm = (): boolean => {
    if (!editFormData) return false;

    const validation = advertisementStorage.validateEnquiry(editFormData);
    setEditErrors(
      validation.errors.reduce((acc, error) => {
        const field = error.includes("Name")
          ? "name"
          : error.includes("Phone")
          ? "phoneNo"
          : error.includes("Email")
          ? "email"
          : error.includes("Aadhar")
          ? "aadharNo"
          : error.includes("PAN")
          ? "panNo"
          : "";
        if (field) acc[field] = error;
        return acc;
      }, {} as Record<string, string>)
    );

    return validation.isValid;
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !validateEditForm()) {
      showToast("Please fix the errors before saving", "error");
      return;
    }

    try {
      const success = advertisementStorage.updateAdvertisementEnquiry(
        editFormData.id,
        editFormData
      );
      if (await success) {
        showToast("Enquiry updated successfully", "success");
        loadEnquiries();
        setIsEditing(false);
        setShowDetailsModal(false);
        setEditFormData(null);
      } else {
        showToast("Failed to update enquiry", "error");
      }
    } catch (error) {
      console.error("Error updating enquiry:", error);
      showToast("Error updating enquiry", "error");
    }
  };

  const handleDeleteClick = (id: string) => {
    if (!isAdmin()) {
      showToast("You don't have permission to delete enquiries", "error");
      return;
    }
    setEnquiryToDelete(id);
    setShowDeleteConfirm(true);
    setShowDetailsModal(false);
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete) return;

    if (!isAdmin()) {
      showToast("Only administrators can delete enquiries", "error");
      setShowDeleteConfirm(false);
      setEnquiryToDelete(null);
      return;
    }

    try {
      const success =
        advertisementStorage.deleteAdvertisementEnquiry(enquiryToDelete);
      if (await success) {
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
      advertisementStorage.downloadCSV();
      showToast("CSV exported successfully", "success");
    } catch (error) {
      showToast("Failed to export CSV", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Permission Info Banner for Users */}
        {!isAdmin() && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-blue-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  User Permissions
                </h4>
                <p className="text-xs text-blue-700">
                  You can view and edit advertisement enquiries, but deletion is
                  restricted to administrators only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-sm px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                Advertisement Enquiries
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                View and manage imported advertisement enquiry data
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-semibold disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Enquiries"
              value={statistics.total}
              color="blue"
              icon={<FileSpreadsheet size={24} />}
            />
            <StatCard
              title="Today Imported"
              value={statistics.todayImported}
              color="green"
              icon={<Calendar size={24} />}
            />
            <StatCard
              title="With Aadhar"
              value={statistics.withAadhar}
              color="purple"
              icon={<CreditCard size={24} />}
            />
            <StatCard
              title="With PAN"
              value={statistics.withPAN}
              color="orange"
              icon={<CreditCard size={24} />}
            />
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border-x border-gray-200 p-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by Name, Phone, Email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 border-2 border-gray-300 rounded-xl pl-12 pr-12 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredEnquiries.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {enquiries.length}
              </span>{" "}
              enquiries
            </p>
            {searchTerm && (
              <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                Filtered results
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border border-gray-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading enquiries...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <FileSpreadsheet size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No enquiries found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Import Excel data to get started"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Documents
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Imported Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEnquiries.map((enquiry, i) => (
                      <tr
                        key={enquiry.id}
                        onClick={() => handleRowClick(enquiry)}
                        className={`cursor-pointer transition-all duration-200 ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 hover:shadow-md hover:scale-[1.01]`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {enquiry.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {enquiry.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {enquiry.phoneNo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-700 truncate max-w-xs">
                              {enquiry.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            {enquiry.aadharNo ? (
                              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold shadow-sm">
                                Aadhar
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium">
                                No Aadhar
                              </span>
                            )}
                            {enquiry.panNo ? (
                              <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold shadow-sm">
                                PAN
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium">
                                No PAN
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">
                                {new Date(
                                  enquiry.importedAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(enquiry.importedAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
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
                    className="p-5 hover:bg-blue-50 cursor-pointer transition-all duration-200 active:bg-blue-100"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                        {enquiry.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base mb-1">
                          {enquiry.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {enquiry.id.split("-")[0]}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="font-medium">{enquiry.phoneNo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="truncate">{enquiry.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span>
                          {new Date(enquiry.importedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                      {enquiry.aadharNo ? (
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                          Aadhar ✓
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs">
                          No Aadhar
                        </span>
                      )}
                      {enquiry.panNo ? (
                        <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                          PAN ✓
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs">
                          No PAN
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details/Edit Modal */}
      {showDetailsModal && editFormData && (
        <DetailsModal
          enquiry={editFormData}
          isEditing={isEditing}
          errors={editErrors}
          canDelete={isAdmin()}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEnquiry(null);
            setEditFormData(null);
            setIsEditing(false);
            setEditErrors({});
          }}
          onEdit={() => setIsEditing(true)}
          onCancel={() => {
            setEditFormData(selectedEnquiry ? { ...selectedEnquiry } : null);
            setIsEditing(false);
            setEditErrors({});
          }}
          onChange={handleEditChange}
          onSave={handleSaveEdit}
          onDelete={() => handleDeleteClick(editFormData.id)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setEnquiryToDelete(null);
          }}
        />
      )}

      {/* Toast */}
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
    blue: "border-blue-500 from-blue-500 to-blue-600 bg-blue-100 text-blue-600",
    green:
      "border-green-500 from-green-500 to-green-600 bg-green-100 text-green-600",
    purple:
      "border-purple-500 from-purple-500 to-purple-600 bg-purple-100 text-purple-600",
    orange:
      "border-orange-500 from-orange-500 to-orange-600 bg-orange-100 text-orange-600",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${
        colorClasses[color as keyof typeof colorClasses]?.split(" ")[0]
      } transition-all duration-200 hover:shadow-xl hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
        <div
          className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[
            color as keyof typeof colorClasses
          ]
            ?.split(" ")
            .slice(1, 3)
            .join(" ")} shadow-lg`}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
};

// Details/Edit Modal
const DetailsModal: React.FC<{
  enquiry: AdvertisementEnquiry;
  isEditing: boolean;
  errors: Record<string, string>;
  canDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (field: keyof AdvertisementEnquiry, value: string) => void;
  onSave: () => void;
  onDelete: () => void;
}> = ({
  enquiry,
  isEditing,
  errors,
  canDelete,
  onClose,
  onEdit,
  onCancel,
  onChange,
  onSave,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full animate-scale-in max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-5 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileSpreadsheet size={28} />
              {isEditing ? "Edit Enquiry" : "Enquiry Details"}
            </h2>
            <p className="text-sm text-blue-100 mt-1 font-medium">
              ID: {enquiry.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90"
          >
            <X size={28} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Personal Info */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-300 pb-3 text-lg">
              <UserIcon size={22} className="text-blue-600" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField
                icon={<UserIcon size={18} />}
                label="Full Name"
                value={enquiry.name}
                isEditing={isEditing}
                onChange={(val) => onChange("name", val)}
                error={errors.name}
                required
              />
              <EditableField
                icon={<Phone size={18} />}
                label="Phone Number"
                value={enquiry.phoneNo}
                isEditing={isEditing}
                onChange={(val) => onChange("phoneNo", val)}
                error={errors.phoneNo}
                required
                maxLength={10}
              />
              <EditableField
                icon={<Mail size={18} />}
                label="Email Address"
                value={enquiry.email}
                isEditing={isEditing}
                onChange={(val) => onChange("email", val)}
                error={errors.email}
                required
                className="md:col-span-2"
                type="email"
              />
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-300 pb-3 text-lg">
              <CreditCard size={22} className="text-blue-600" />
              Document Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField
                icon={<CreditCard size={18} />}
                label="Aadhar Number"
                value={enquiry.aadharNo || ""}
                isEditing={isEditing}
                onChange={(val) => onChange("aadharNo", val)}
                error={errors.aadharNo}
                maxLength={12}
                placeholder="Optional"
              />
              <EditableField
                icon={<CreditCard size={18} />}
                label="PAN Number"
                value={enquiry.panNo || ""}
                isEditing={isEditing}
                onChange={(val) => onChange("panNo", val)}
                error={errors.panNo}
                maxLength={10}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Import Info */}
          {!isEditing && (
            <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-300 pb-3 text-lg">
                <Calendar size={22} className="text-blue-600" />
                Import Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  icon={<Calendar size={18} />}
                  label="Imported Date & Time"
                  value={new Date(enquiry.importedAt).toLocaleString("en-US", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                />
                {enquiry.importedBy && (
                  <InfoField
                    icon={<UserIcon size={18} />}
                    label="Imported By"
                    value={enquiry.importedBy}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-between gap-3 border-t border-gray-200 flex-shrink-0">
          {/* Delete button - Only for Admin */}
          {canDelete && !isEditing ? (
            <button
              onClick={onDelete}
              className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
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
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={onEdit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Edit size={18} />
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

// Editable Field Component
const EditableField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  className?: string;
  type?: string;
}> = ({
  icon,
  label,
  value,
  isEditing,
  onChange,
  error,
  required,
  maxLength,
  placeholder,
  className = "",
  type = "text",
}) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <div className="text-gray-400 mt-1 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      {isEditing ? (
        <div>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 ${
              error
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      ) : (
        <p className="text-sm font-semibold text-gray-900 break-words">
          {value || (
            <span className="text-gray-400 italic font-normal">
              Not provided
            </span>
          )}
        </p>
      )}
    </div>
  </div>
);

// Info Field Component (Read-only)
const InfoField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
  emptyText?: string;
  className?: string;
}> = ({ icon, label, value, emptyText = "N/A", className = "" }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    <div className="text-gray-400 mt-1 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 break-words">
        {value || (
          <span className="text-gray-400 italic font-normal">{emptyText}</span>
        )}
      </p>
    </div>
  </div>
);

// Delete Confirm Modal
const DeleteConfirmModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-red-100 rounded-full">
          <Trash2 size={28} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Delete Enquiry</h3>
          <p className="text-sm text-gray-600 mt-1">
            This action cannot be undone
          </p>
        </div>
      </div>
      <p className="text-gray-700 mb-6">
        Are you sure you want to delete this advertisement enquiry? All data
        will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// Toast Component
const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-in ${
        type === "success"
          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
          : "bg-gradient-to-r from-red-600 to-pink-600 text-white"
      }`}
    >
      {type === "success" ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className="text-sm font-bold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-80 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Add animation styles
const styles = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AdvertisementEnquiries;
