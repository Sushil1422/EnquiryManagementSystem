import React, { useState } from "react";
import {
  Search,
  X,
  FileSpreadsheet,
  Phone,
  Mail,
  CreditCard,
  User as UserIcon,
  Calendar,
  AlertTriangle,
  Trash2,
  Edit,
  Save,
  Filter,
  Download,
} from "lucide-react";
import {
  advertisementStorage,
  type AdvertisementEnquiry,
} from "../utils/advertisementStorage";
import { useAuth } from "../contexts/AuthContext";

const SearchAdvertisementEnquiry: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<AdvertisementEnquiry[]>(
    []
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] =
    useState<AdvertisementEnquiry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<AdvertisementEnquiry | null>(
    null
  );
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<
    "all" | "with-docs" | "without-docs"
  >("all");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      showToast("Please enter a search term", "error");
      return;
    }

    setIsSearching(true);
    setTimeout(async () => {
      try {
        const allEnquiries =
          advertisementStorage.getAllAdvertisementEnquiries();
        const term = searchTerm.toLowerCase();

        let results = (await allEnquiries).filter(
          (enq) =>
            enq.name.toLowerCase().includes(term) ||
            enq.phoneNo.includes(term) ||
            enq.email.toLowerCase().includes(term) ||
            enq.id.toLowerCase().includes(term) ||
            (enq.aadharNo && enq.aadharNo.includes(term)) ||
            (enq.panNo && enq.panNo.toLowerCase().includes(term))
        );

        // Apply filter
        if (filterType === "with-docs") {
          results = results.filter((enq) => enq.aadharNo || enq.panNo);
        } else if (filterType === "without-docs") {
          results = results.filter((enq) => !enq.aadharNo && !enq.panNo);
        }

        setSearchResults(results);
        setHasSearched(true);
      } catch (error) {
        console.error("Error searching:", error);
        showToast("Error performing search", "error");
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setHasSearched(false);
    setFilterType("all");
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
        // Update search results
        setSearchResults(
          searchResults.map((enq) =>
            enq.id === editFormData.id ? editFormData : enq
          )
        );
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
        setSearchResults(
          searchResults.filter((enq) => enq.id !== enquiryToDelete)
        );
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

  const handleExportResults = () => {
    if (searchResults.length === 0) {
      showToast("No results to export", "error");
      return;
    }

    try {
      const headers = [
        "ID",
        "Name",
        "Phone No",
        "Email",
        "Aadhar No",
        "PAN No",
        "Imported At",
      ];
      const rows = searchResults.map((e) => [
        e.id,
        e.name,
        e.phoneNo,
        e.email,
        e.aadharNo || "",
        e.panNo || "",
        new Date(e.importedAt).toLocaleString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `search-results-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Results exported successfully", "success");
    } catch (error) {
      showToast("Failed to export results", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            Search Advertisement Enquiries
          </h1>
          <p className="text-gray-600 mt-2 ml-1">
            Search by name, phone, email, ID, Aadhar, or PAN number
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Search Parameters
            </h2>
          </div>

          {/* Search Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Term
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter name, phone, email, ID, Aadhar, or PAN..."
                  className="w-full h-14 border-2 border-gray-300 rounded-xl pl-12 pr-12 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200 hover:border-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={22} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Filter
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    filterType === "all"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Filter size={16} className="inline mr-2" />
                  All Records
                </button>
                <button
                  onClick={() => setFilterType("with-docs")}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    filterType === "with-docs"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <CreditCard size={16} className="inline mr-2" />
                  With Documents
                </button>
                <button
                  onClick={() => setFilterType("without-docs")}
                  className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                    filterType === "without-docs"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <AlertTriangle size={16} className="inline mr-2" />
                  Without Documents
                </button>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Search Enquiries
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Search Results</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Found {searchResults.length} result(s)
                </p>
              </div>
              {searchResults.length > 0 && (
                <button
                  onClick={handleExportResults}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
                >
                  <Download size={18} />
                  Export
                </button>
              )}
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <AlertTriangle size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-500 mb-6">
                  No advertisement enquiries match your search criteria
                </p>
                <button
                  onClick={clearSearch}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Documents
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Imported
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {searchResults.map((enquiry, i) => (
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
                              {enquiry.aadharNo && (
                                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold shadow-sm">
                                  Aadhar
                                </span>
                              )}
                              {enquiry.panNo && (
                                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold shadow-sm">
                                  PAN
                                </span>
                              )}
                              {!enquiry.aadharNo && !enquiry.panNo && (
                                <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium">
                                  None
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {searchResults.map((enquiry) => (
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
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                        {enquiry.aadharNo && (
                          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                            Aadhar ✓
                          </span>
                        )}
                        {enquiry.panNo && (
                          <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                            PAN ✓
                          </span>
                        )}
                        {!enquiry.aadharNo && !enquiry.panNo && (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs">
                            No Documents
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
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

// Details/Edit Modal Component
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

// Info Field Component
const InfoField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-400 mt-1 flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1.5 font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 break-words">{value}</p>
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
        Are you sure you want to delete this advertisement enquiry?
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

// Inject animation styles
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

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default SearchAdvertisementEnquiry;
