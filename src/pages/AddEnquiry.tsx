import React, { useState, useEffect } from "react";
import "./animation.css";
import "react-datepicker/dist/react-datepicker.css";

// Types
interface FormData {
  fullName: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  address: string;
  aadharNumber: string;
  panNumber: string;
  demateAccount1: string;
  demateAccount2: string;
  enquiryState: string;
  sourceOfEnquiry: string;
  interestedStatus: string;
  howDidYouKnow: string;
  customHowDidYouKnow: string;
  callBackDate: string;
  depositInwardDate: string;
  depositOutwardDate: string;
  status: string;
  profession: string;
  customProfession: string;
  knowledgeOfShareMarket: string;
}

interface EnquiryData extends FormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface FormErrors {
  [key: string]: string;
}

// LocalStorage Keys
const STORAGE_KEY = "enquiry_management_data";

// ========== LocalStorage Utility Functions ==========
const storageUtils = {
  // Get all enquiries from localStorage
  getAllEnquiries: (): EnquiryData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  // Save enquiry to localStorage
  saveEnquiry: (enquiry: FormData): EnquiryData => {
    try {
      const enquiries = storageUtils.getAllEnquiries();
      const newEnquiry: EnquiryData = {
        ...enquiry,
        id: generateUniqueId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      enquiries.push(newEnquiry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
      console.log("Enquiry saved successfully:", newEnquiry);
      console.log("Total enquiries:", enquiries.length);
      return newEnquiry;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      throw error;
    }
  },

  // Update existing enquiry
  updateEnquiry: (
    id: string,
    updatedData: Partial<FormData>
  ): EnquiryData | null => {
    try {
      const enquiries = storageUtils.getAllEnquiries();
      const index = enquiries.findIndex((enq) => enq.id === id);
      if (index === -1) return null;
      enquiries[index] = {
        ...enquiries[index],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
      console.log("Enquiry updated successfully:", enquiries[index]);
      return enquiries[index];
    } catch (error) {
      console.error("Error updating localStorage:", error);
      throw error;
    }
  },

  // Delete enquiry
  deleteEnquiry: (id: string): boolean => {
    try {
      const enquiries = storageUtils.getAllEnquiries();
      const filteredEnquiries = enquiries.filter((enq) => enq.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEnquiries));
      console.log(
        "Enquiry deleted successfully. Remaining:",
        filteredEnquiries.length
      );
      return true;
    } catch (error) {
      console.error("Error deleting from localStorage:", error);
      return false;
    }
  },

  // Get enquiry by ID
  getEnquiryById: (id: string): EnquiryData | null => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.find((enq) => enq.id === id) || null;
  },

  // Search enquiries
  searchEnquiries: (searchTerm: string): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    const lowerSearchTerm = searchTerm.toLowerCase();
    return enquiries.filter(
      (enq) =>
        enq.fullName.toLowerCase().includes(lowerSearchTerm) ||
        enq.mobile.includes(searchTerm) ||
        enq.email.toLowerCase().includes(lowerSearchTerm) ||
        enq.id.toLowerCase().includes(lowerSearchTerm)
    );
  },

  // Get statistics
  getStatistics: () => {
    const enquiries = storageUtils.getAllEnquiries();
    return {
      total: enquiries.length,
      confirmed: enquiries.filter((e) => e.status === "Confirmed").length,
      pending: enquiries.filter((e) => e.status === "Pending").length,
      inProcess: enquiries.filter((e) => e.status === "In Process").length,
    };
  },

  // Export data as JSON (for backup)
  exportData: (): string => {
    const enquiries = storageUtils.getAllEnquiries();
    return JSON.stringify(enquiries, null, 2);
  },

  // Import data from JSON (for restore)
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log("Data imported successfully:", data.length, "records");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  },

  // Clear all data
  clearAllData: (): void => {
    if (
      window.confirm(
        "Are you sure you want to delete all enquiries? This action cannot be undone."
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      console.log("All data cleared");
    }
  },

  // Get enquiries by date range
  getEnquiriesByDateRange: (
    startDate: string,
    endDate: string
  ): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.filter((enq) => {
      const createdDate = new Date(enq.createdAt);
      return (
        createdDate >= new Date(startDate) && createdDate <= new Date(endDate)
      );
    });
  },

  // Get enquiries by status
  getEnquiriesByStatus: (status: string): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.filter((enq) => enq.status === status);
  },

  // Enhanced Aadhar check with better formatting
  isAadharExists: (aadhar: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    const cleanAadhar = aadhar.replace(/\s/g, "");
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId &&
        enq.aadharNumber.replace(/\s/g, "") === cleanAadhar
    );
  },

  // Enhanced PAN check
  isPANExists: (pan: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    const cleanPAN = pan.toUpperCase().trim();
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId && enq.panNumber.toUpperCase().trim() === cleanPAN
    );
  },

  // Enhanced Mobile check
  isMobileExists: (mobile: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.some(
      (enq) => enq.id !== excludeId && enq.mobile === mobile
    );
  },

  // Enhanced Email check
  isEmailExists: (email: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    const cleanEmail = email.toLowerCase().trim();
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId && enq.email.toLowerCase().trim() === cleanEmail
    );
  },

  // Check for any duplicates
  checkDuplicates: (
    formData: Partial<FormData>
  ): {
    field: string;
    message: string;
  }[] => {
    const duplicates: { field: string; message: string }[] = [];

    if (
      formData.aadharNumber &&
      storageUtils.isAadharExists(formData.aadharNumber)
    ) {
      duplicates.push({
        field: "aadharNumber",
        message: "This Aadhar number is already registered",
      });
    }

    if (formData.panNumber && storageUtils.isPANExists(formData.panNumber)) {
      duplicates.push({
        field: "panNumber",
        message: "This PAN number is already registered",
      });
    }

    if (formData.mobile && storageUtils.isMobileExists(formData.mobile)) {
      duplicates.push({
        field: "mobile",
        message: "This mobile number is already registered",
      });
    }

    if (formData.email && storageUtils.isEmailExists(formData.email)) {
      duplicates.push({
        field: "email",
        message: "This email address is already registered",
      });
    }

    return duplicates;
  },

  // Get existing enquiry details by Aadhar or PAN
  getExistingEnquiry: (aadhar?: string, pan?: string): EnquiryData | null => {
    const enquiries = storageUtils.getAllEnquiries();

    if (aadhar) {
      const cleanAadhar = aadhar.replace(/\s/g, "");
      const found = enquiries.find(
        (enq) => enq.aadharNumber.replace(/\s/g, "") === cleanAadhar
      );
      if (found) return found;
    }

    if (pan) {
      const cleanPAN = pan.toUpperCase().trim();
      const found = enquiries.find(
        (enq) => enq.panNumber.toUpperCase().trim() === cleanPAN
      );
      if (found) return found;
    }

    return null;
  },
};

// Generate unique ID
const generateUniqueId = (): string => {
  return `ENQ-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

// ========== Validation Functions ==========
const ValidationHelpers = {
  // Validate Full Name
  validateFullName: (name: string): string => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (name.trim().length < 3) {
      return "Name must be at least 3 characters";
    }
    if (!/^[a-zA-Z\s.]+$/.test(name)) {
      return "Name can only contain letters, spaces, and dots";
    }
    if (name.trim().length > 100) {
      return "Name must not exceed 100 characters";
    }
    return "";
  },

  // Validate Mobile Number
  validateMobile: (mobile: string, fieldName: string = "Mobile"): string => {
    if (!mobile.trim()) {
      return `${fieldName} number is required`;
    }
    if (!/^\d{10}$/.test(mobile)) {
      return `${fieldName} number must be exactly 10 digits`;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return `${fieldName} number must start with 6, 7, 8, or 9`;
    }
    return "";
  },

  // Validate Email
  validateEmail: (email: string): string => {
    if (!email.trim()) {
      return "Email address is required";
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    if (email.length > 100) {
      return "Email must not exceed 100 characters";
    }
    return "";
  },

  // Validate Aadhar Number
  validateAadhar: (aadhar: string): string => {
    if (!aadhar.trim()) {
      return "Aadhar number is required";
    }
    const cleanAadhar = aadhar.replace(/\s/g, "");
    if (!/^\d{12}$/.test(cleanAadhar)) {
      return "Aadhar number must be exactly 12 digits";
    }
    if (cleanAadhar === "000000000000" || cleanAadhar === "111111111111") {
      return "Invalid Aadhar number format";
    }
    return "";
  },

  // Validate PAN Number
  validatePAN: (pan: string): string => {
    if (!pan.trim()) {
      return "PAN number is required";
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan.toUpperCase())) {
      return "Invalid PAN format (e.g., ABCDE1234F)";
    }
    const fourthChar = pan.charAt(3).toUpperCase();
    const validFourthChars = ["P", "C", "H", "F", "A", "T", "B", "L", "J", "G"];
    if (!validFourthChars.includes(fourthChar)) {
      return "Invalid PAN number - 4th character must be P, C, H, F, A, T, B, L, J, or G";
    }
    return "";
  },

  // Validate Address
  validateAddress: (address: string): string => {
    if (!address.trim()) {
      return "Address is required";
    }
    if (address.trim().length < 10) {
      return "Address must be at least 10 characters";
    }
    if (address.trim().length > 500) {
      return "Address must not exceed 500 characters";
    }
    return "";
  },

  // Validate Demat Account
  validateDematAccount: (
    account: string,
    isRequired: boolean = true
  ): string => {
    if (!account.trim()) {
      return isRequired ? "Demat account ID is required" : "";
    }
    if (account.trim().length < 16) {
      return "Demat account ID must be at least 16 characters";
    }
    if (account.trim().length > 16) {
      return "Demat account ID must not exceed 16 characters";
    }
    if (!/^[A-Z0-9]+$/.test(account.toUpperCase())) {
      return "Demat account ID can only contain letters and numbers";
    }
    return "";
  },

  // Validate Date
  validateDate: (
    date: string,
    fieldName: string,
    isFutureAllowed: boolean = true
  ): string => {
    if (!date) {
      return `${fieldName} is required`;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(selectedDate.getTime())) {
      return `Invalid ${fieldName.toLowerCase()}`;
    }
    if (!isFutureAllowed && selectedDate < today) {
      return `${fieldName} cannot be in the past`;
    }
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    if (selectedDate > twoYearsFromNow) {
      return `${fieldName} cannot be more than 2 years in the future`;
    }
    return "";
  },
};

// Reusable Field Component
const Field: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  error?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  pattern?: string;
}> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required,
  placeholder,
  type = "text",
  error,
  icon,
  maxLength,
  pattern,
}) => {
  const isDuplicate = error?.includes("⚠️");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={name}
        className="flex items-center text-gray-700 text-sm font-medium"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          pattern={pattern}
          className={`w-full h-11 border rounded-lg px-3 ${
            icon ? "pl-10" : ""
          } text-sm text-gray-900 placeholder-gray-400 
          transition-all duration-200
          ${
            error
              ? isDuplicate
                ? "border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500 bg-yellow-50"
                : "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500"
              : "border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500"
          }
          hover:border-gray-400 focus:outline-none`}
        />
        {maxLength && value.length > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {error && (
        <span
          className={`text-xs flex items-center gap-1 ${
            isDuplicate ? "text-yellow-600 font-medium" : "text-red-500"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

// Textarea Field Component
const TextAreaField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  rows?: number;
}> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required,
  placeholder,
  error,
  rows = 4,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={name}
        className="flex items-center text-gray-700 text-sm font-medium"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 
        transition-all duration-200 resize-none
        ${
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500"
            : "border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500"
        }
        hover:border-gray-400 focus:outline-none`}
      />
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

// Dropdown Field Component
const DropdownField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
}> = ({ label, name, value, onChange, options, required, error, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5 w-full relative">
      <label
        htmlFor={name}
        className="flex items-center text-gray-700 text-sm font-medium"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full h-11 px-3 ${
            icon ? "pl-10" : ""
          } border rounded-lg text-left text-sm
          transition-all duration-200
          ${
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500"
              : "border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500"
          }
          hover:border-gray-400 focus:outline-none ${
            value ? "text-gray-900" : "text-gray-400"
          }`}
        >
          <span className="truncate">{value || "Select an option"}</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm hover:bg-green-50 transition-colors
                  ${
                    value === option
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700"
                  }
                  ${
                    index !== options.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }
                  first:rounded-t-lg last:rounded-b-lg`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

// Date Field Component
const DateField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  min?: string;
}> = ({ label, name, value, onChange, required, error, icon, min }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={name}
        className="flex items-center text-gray-700 text-sm font-medium"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          className={`w-full h-11 border rounded-lg px-3 ${
            icon ? "pl-10" : ""
          } text-sm text-gray-900
          ${
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-500"
              : "border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-500"
          }
          hover:border-gray-400 focus:outline-none transition-all duration-200`}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

// Toast Notification Component
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

// Duplicate Warning Modal Component
const DuplicateWarningModal: React.FC<{
  existingEnquiry: EnquiryData;
  duplicateField: string;
  onClose: () => void;
}> = ({ existingEnquiry, duplicateField, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Duplicate {duplicateField.toUpperCase()} Detected
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              This {duplicateField} already exists in our system
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-3">
            Existing Enquiry Details:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Enquiry ID:</span>
              <span className="font-medium text-gray-900">
                {existingEnquiry.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">
                {existingEnquiry.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mobile:</span>
              <span className="font-medium text-gray-900">
                {existingEnquiry.mobile}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900 truncate max-w-xs">
                {existingEnquiry.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Aadhar:</span>
              <span className="font-medium text-gray-900">
                {existingEnquiry.aadharNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PAN:</span>
              <span className="font-medium text-gray-900">
                {existingEnquiry.panNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-gray-900">
                {existingEnquiry.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">
                {new Date(existingEnquiry.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-red-700">
            <strong>Important:</strong> Each Aadhar and PAN number must be
            unique. Please verify the information or update the existing enquiry
            instead of creating a new one.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AddEnquiry: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    address: "",
    aadharNumber: "",
    panNumber: "",
    demateAccount1: "",
    demateAccount2: "",
    enquiryState: "",
    sourceOfEnquiry: "",
    interestedStatus: "",
    howDidYouKnow: "",
    customHowDidYouKnow: "",
    callBackDate: "",
    depositInwardDate: "",
    depositOutwardDate: "",
    status: "",
    profession: "",
    customProfession: "",
    knowledgeOfShareMarket: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateEnquiry, setDuplicateEnquiry] = useState<EnquiryData | null>(
    null
  );
  const [duplicateField, setDuplicateField] = useState<string>("");
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    inProcess: 0,
  });

  // Load statistics on component mount
  useEffect(() => {
    const statistics = storageUtils.getStatistics();
    setStats(statistics);
  }, []);

  // Format mobile number
  const formatMobile = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    return digits;
  };

  // Format Aadhar number (XXXX XXXX XXXX)
  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3").trim();
  };

  // Format PAN number
  const formatPAN = (value: string) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
  };

  // Handle field changes
  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    if (field === "mobile" || field === "alternateMobile") {
      formattedValue = formatMobile(value);
    } else if (field === "aadharNumber") {
      formattedValue = formatAadhar(value);
    } else if (field === "panNumber") {
      formattedValue = formatPAN(value);
    } else if (field === "demateAccount1" || field === "demateAccount2") {
      formattedValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 20);
    }
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle field blur for real-time validation
  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Validate individual field
  const validateField = (field: keyof FormData) => {
    const value = formData[field];
    let error = "";

    switch (field) {
      case "fullName":
        error = ValidationHelpers.validateFullName(value);
        break;

      case "mobile":
        error = ValidationHelpers.validateMobile(value);
        if (!error && storageUtils.isMobileExists(value)) {
          error = "⚠️ This mobile number is already registered";
        }
        break;

      case "alternateMobile":
        if (value) {
          error = ValidationHelpers.validateMobile(value, "Alternate mobile");
          if (!error && value === formData.mobile) {
            error = "Alternate mobile cannot be same as primary mobile";
          }
        }
        break;

      case "email":
        error = ValidationHelpers.validateEmail(value);
        if (!error && storageUtils.isEmailExists(value)) {
          error = "⚠️ This email is already registered";
        }
        break;

      case "address":
        error = ValidationHelpers.validateAddress(value);
        break;

      case "aadharNumber":
        error = ValidationHelpers.validateAadhar(value);
        if (!error && storageUtils.isAadharExists(value)) {
          error = "⚠️ This Aadhar number is already registered";
          const existing = storageUtils.getExistingEnquiry(value);
          if (existing) {
            setDuplicateEnquiry(existing);
            setDuplicateField("Aadhar");
          }
        }
        break;

      case "panNumber":
        error = ValidationHelpers.validatePAN(value);
        if (!error && storageUtils.isPANExists(value)) {
          error = "⚠️ This PAN number is already registered";
          const existing = storageUtils.getExistingEnquiry(undefined, value);
          if (existing) {
            setDuplicateEnquiry(existing);
            setDuplicateField("PAN");
          }
        }
        break;

      case "demateAccount1":
        error = ValidationHelpers.validateDematAccount(value, true);
        break;

      case "demateAccount2":
        if (value) {
          error = ValidationHelpers.validateDematAccount(value, false);
          if (!error && value === formData.demateAccount1) {
            error = "Demat Account 2 cannot be same as Demat Account 1";
          }
        }
        break;

      case "callBackDate":
        error = ValidationHelpers.validateDate(value, "Call back date");
        break;

      case "depositInwardDate":
        error = ValidationHelpers.validateDate(value, "Deposit inward date");
        break;

      case "depositOutwardDate":
        error = ValidationHelpers.validateDate(value, "Deposit outward date");
        if (!error && formData.depositInwardDate) {
          const inward = new Date(formData.depositInwardDate);
          const outward = new Date(value);
          if (outward < inward) {
            error = "Deposit outward date cannot be before inward date";
          }
        }
        break;

      case "enquiryState":
        if (!value) error = "Please select a state";
        break;

      case "sourceOfEnquiry":
        if (!value) error = "Please select source of enquiry";
        break;

      case "interestedStatus":
        if (!value) error = "Please select interested status";
        break;

      case "status":
        if (!value) error = "Please select status";
        break;

      case "profession":
        if (!value) error = "Please select profession";
        break;

      case "knowledgeOfShareMarket":
        if (!value) error = "Please select knowledge level";
        break;

      case "howDidYouKnow":
        if (!value) error = "Please select an option";
        break;

      case "customHowDidYouKnow":
        if (formData.howDidYouKnow === "Other" && !value.trim()) {
          error = "Please specify how you knew about us";
        }
        break;

      case "customProfession":
        if (formData.profession === "Other" && !value.trim()) {
          error = "Please specify your profession";
        }
        break;
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    return error;
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const fieldsToValidate: (keyof FormData)[] = [
      "fullName",
      "mobile",
      "email",
      "address",
      "aadharNumber",
      "panNumber",
      "demateAccount1",
      "enquiryState",
      "sourceOfEnquiry",
      "interestedStatus",
      "status",
      "profession",
      "knowledgeOfShareMarket",
      "howDidYouKnow",
      "callBackDate",
      "depositInwardDate",
      "depositOutwardDate",
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (formData.alternateMobile) {
      const error = validateField("alternateMobile");
      if (error) newErrors.alternateMobile = error;
    }
    if (formData.demateAccount2) {
      const error = validateField("demateAccount2");
      if (error) newErrors.demateAccount2 = error;
    }

    if (formData.howDidYouKnow === "Other") {
      const error = validateField("customHowDidYouKnow");
      if (error) newErrors.customHowDidYouKnow = error;
    }
    if (formData.profession === "Other") {
      const error = validateField("customProfession");
      if (error) newErrors.customProfession = error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Check for duplicates first
    const duplicates = storageUtils.checkDuplicates(formData);

    if (duplicates.length > 0) {
      const duplicateErrors: FormErrors = {};
      duplicates.forEach(({ field, message }) => {
        duplicateErrors[field] = `⚠️ ${message}`;
      });
      setErrors((prev) => ({ ...prev, ...duplicateErrors }));

      const firstDuplicate = duplicates[0];
      const existing =
        storageUtils.getExistingEnquiry(
          firstDuplicate.field === "aadharNumber"
            ? formData.aadharNumber
            : undefined,
          firstDuplicate.field === "panNumber" ? formData.panNumber : undefined
        ) ||
        storageUtils
          .getAllEnquiries()
          .find(
            (enq) =>
              (firstDuplicate.field === "mobile" &&
                enq.mobile === formData.mobile) ||
              (firstDuplicate.field === "email" &&
                enq.email.toLowerCase() === formData.email.toLowerCase())
          );

      if (existing) {
        setDuplicateEnquiry(existing);
        setDuplicateField(firstDuplicate.field);
        setShowDuplicateWarning(true);
      }

      setToast({
        message: `Duplicate found: ${duplicates
          .map((d) => d.field)
          .join(", ")}. Please check the highlighted fields.`,
        type: "error",
      });

      const firstErrorField = duplicates[0].field;
      const element = document.getElementById(firstErrorField);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });

      return;
    }

    if (!validate()) {
      setToast({
        message: "Please fix all validation errors before submitting",
        type: "error",
      });
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const finalDuplicates = storageUtils.checkDuplicates(formData);
      if (finalDuplicates.length > 0) {
        throw new Error(
          "Duplicate data detected. Please verify unique fields."
        );
      }

      const savedEnquiry = storageUtils.saveEnquiry(formData);
      const newStats = storageUtils.getStatistics();
      setStats(newStats);

      console.log("Form submitted and saved:", savedEnquiry);
      setToast({
        message: `✅ Enquiry added successfully! ID: ${savedEnquiry.id}`,
        type: "success",
      });

      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (error) {
      console.error("Error saving enquiry:", error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit enquiry. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const hasData = Object.values(formData).some(
      (value) => value.trim() !== ""
    );
    if (hasData) {
      setShowCancelConfirm(true);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      mobile: "",
      alternateMobile: "",
      email: "",
      address: "",
      aadharNumber: "",
      panNumber: "",
      demateAccount1: "",
      demateAccount2: "",
      enquiryState: "",
      sourceOfEnquiry: "",
      interestedStatus: "",
      howDidYouKnow: "",
      customHowDidYouKnow: "",
      callBackDate: "",
      depositInwardDate: "",
      depositOutwardDate: "",
      status: "",
      profession: "",
      customProfession: "",
      knowledgeOfShareMarket: "",
    });
    setErrors({});
    setTouched({});
    setShowCancelConfirm(false);
  };

  const today = new Date().toISOString().split("T")[0];

  // Icons
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
  const EmailIcon = () => (
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
  const CardIcon = () => (
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
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
  const ClipboardIcon = () => (
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
  const StatusIcon = () => (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
  const BookIcon = () => (
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
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Statistics */}
        <div className="bg-white rounded-t-xl shadow-sm px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Enquiry
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details to create a new enquiry
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-sm">
                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                  Total: {stats.total}
                </div>
                <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium">
                  Confirmed: {stats.confirmed}
                </div>
                <div className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg font-medium">
                  Pending: {stats.pending}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-b-xl shadow-sm border-x border-b border-gray-200"
          noValidate
        >
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Contact Information */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-green-500">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserIcon />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h2>
                </div>
                <Field
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(value) => handleChange("fullName", value)}
                  onBlur={() => handleBlur("fullName")}
                  required
                  placeholder="Enter full name"
                  error={touched.fullName ? errors.fullName : ""}
                  icon={<UserIcon />}
                  maxLength={100}
                />
                <Field
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(value) => handleChange("mobile", value)}
                  onBlur={() => handleBlur("mobile")}
                  required
                  placeholder="Enter 10-digit mobile number"
                  type="tel"
                  error={touched.mobile ? errors.mobile : ""}
                  icon={<PhoneIcon />}
                  maxLength={10}
                />
                <Field
                  label="Alternate Mobile Number"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={(value) => handleChange("alternateMobile", value)}
                  onBlur={() => handleBlur("alternateMobile")}
                  placeholder="Enter alternate number (optional)"
                  type="tel"
                  error={touched.alternateMobile ? errors.alternateMobile : ""}
                  icon={<PhoneIcon />}
                  maxLength={10}
                />
                <Field
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={(value) => handleChange("email", value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="example@email.com"
                  type="email"
                  required
                  error={touched.email ? errors.email : ""}
                  icon={<EmailIcon />}
                  maxLength={100}
                />
                <TextAreaField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={(value) => handleChange("address", value)}
                  onBlur={() => handleBlur("address")}
                  placeholder="Enter complete address"
                  error={touched.address ? errors.address : ""}
                  required
                  rows={3}
                />
                <Field
                  label="Aadhar Number"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={(value) => handleChange("aadharNumber", value)}
                  onBlur={() => handleBlur("aadharNumber")}
                  placeholder="XXXX XXXX XXXX"
                  required
                  error={touched.aadharNumber ? errors.aadharNumber : ""}
                  icon={<CardIcon />}
                  maxLength={14}
                />
                <Field
                  label="PAN Number"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={(value) => handleChange("panNumber", value)}
                  onBlur={() => handleBlur("panNumber")}
                  placeholder="ABCDE1234F"
                  error={touched.panNumber ? errors.panNumber : ""}
                  icon={<CardIcon />}
                  maxLength={10}
                  required
                />
                <Field
                  label="Demat Account ID 1"
                  name="demateAccount1"
                  value={formData.demateAccount1}
                  onChange={(value) => handleChange("demateAccount1", value)}
                  onBlur={() => handleBlur("demateAccount1")}
                  placeholder="Enter account ID"
                  required
                  error={touched.demateAccount1 ? errors.demateAccount1 : ""}
                  icon={<ClipboardIcon />}
                  maxLength={16}
                />
                <Field
                  label="Demat Account ID 2"
                  name="demateAccount2"
                  value={formData.demateAccount2}
                  onChange={(value) => handleChange("demateAccount2", value)}
                  onBlur={() => handleBlur("demateAccount2")}
                  placeholder="Enter account ID (optional)"
                  error={touched.demateAccount2 ? errors.demateAccount2 : ""}
                  icon={<ClipboardIcon />}
                  maxLength={16}
                />
              </div>

              {/* Right Column - Enquiry Details */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-blue-500">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardIcon />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Enquiry Details
                  </h2>
                </div>
                <DropdownField
                  label="Select Enquiry State"
                  name="enquiryState"
                  value={formData.enquiryState}
                  onChange={(value) => handleChange("enquiryState", value)}
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
                    "Andaman and Nicobar Islands",
                    "Chandigarh",
                    "Dadra and Nagar Haveli and Daman and Diu",
                    "Delhi",
                    "Jammu and Kashmir",
                    "Ladakh",
                    "Lakshadweep",
                    "Puducherry",
                  ]}
                  required
                  error={touched.enquiryState ? errors.enquiryState : ""}
                  icon={<ClipboardIcon />}
                />
                <DropdownField
                  label="Source of Enquiry"
                  name="sourceOfEnquiry"
                  value={formData.sourceOfEnquiry}
                  onChange={(value) => handleChange("sourceOfEnquiry", value)}
                  options={[
                    "Phone Call",
                    "Walk-in",
                    "Referral",
                    "Social Media",
                    "Email",
                    "Advertisement",
                  ]}
                  required
                  error={touched.sourceOfEnquiry ? errors.sourceOfEnquiry : ""}
                  icon={<ClipboardIcon />}
                />
                <DropdownField
                  label="Interested Status"
                  name="interestedStatus"
                  value={formData.interestedStatus}
                  onChange={(value) => handleChange("interestedStatus", value)}
                  options={[
                    "100% Interested",
                    "75% Interested",
                    "50% Interested",
                    "25% Interested",
                    "0% Interested",
                  ]}
                  required
                  error={
                    touched.interestedStatus ? errors.interestedStatus : ""
                  }
                  icon={<ClipboardIcon />}
                />
                <DropdownField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  options={["In Process", "Confirmed", "Pending"]}
                  required={true}
                  error={touched.status ? errors.status : ""}
                  icon={<StatusIcon />}
                />
                <DropdownField
                  label="Profession"
                  name="profession"
                  value={formData.profession}
                  onChange={(value) => {
                    handleChange("profession", value);
                    if (value !== "Other") {
                      handleChange("customProfession", "");
                    }
                  }}
                  options={[
                    "Farmer",
                    "Business",
                    "Traider",
                    "Self-Employed",
                    "Student",
                    "Retired",
                    "Other",
                  ]}
                  required={true}
                  error={touched.profession ? errors.profession : ""}
                  icon={<BriefcaseIcon />}
                />
                {formData.profession === "Other" && (
                  <Field
                    label="Specify Profession"
                    name="customProfession"
                    value={formData.customProfession}
                    onChange={(value) =>
                      handleChange("customProfession", value)
                    }
                    onBlur={() => handleBlur("customProfession")}
                    required
                    placeholder="Enter your profession"
                    error={
                      touched.customProfession ? errors.customProfession : ""
                    }
                    icon={<BriefcaseIcon />}
                  />
                )}
                <DropdownField
                  label="Knowledge of Share Market"
                  name="knowledgeOfShareMarket"
                  value={formData.knowledgeOfShareMarket}
                  onChange={(value) =>
                    handleChange("knowledgeOfShareMarket", value)
                  }
                  options={[
                    "Fresher",
                    "Intermediate",
                    "Advanced",
                    "Professional",
                  ]}
                  required={true}
                  error={
                    touched.knowledgeOfShareMarket
                      ? errors.knowledgeOfShareMarket
                      : ""
                  }
                  icon={<BookIcon />}
                />
                <DropdownField
                  label="How did you know about us?"
                  name="howDidYouKnow"
                  value={formData.howDidYouKnow}
                  onChange={(value) => {
                    handleChange("howDidYouKnow", value);
                    if (value !== "Other") {
                      handleChange("customHowDidYouKnow", "");
                    }
                  }}
                  options={[
                    "Google Search",
                    "Facebook",
                    "Instagram",
                    "LinkedIn",
                    "Friend/Family",
                    "Advertisement",
                    "Other",
                  ]}
                  required
                  error={touched.howDidYouKnow ? errors.howDidYouKnow : ""}
                  icon={<ClipboardIcon />}
                />
                {formData.howDidYouKnow === "Other" && (
                  <Field
                    label="Specify Source"
                    name="customHowDidYouKnow"
                    value={formData.customHowDidYouKnow}
                    onChange={(value) =>
                      handleChange("customHowDidYouKnow", value)
                    }
                    onBlur={() => handleBlur("customHowDidYouKnow")}
                    required
                    placeholder="Enter how you knew about us"
                    error={
                      touched.customHowDidYouKnow
                        ? errors.customHowDidYouKnow
                        : ""
                    }
                    icon={<ClipboardIcon />}
                  />
                )}
                <DateField
                  label="Call Back Date"
                  name="callBackDate"
                  value={formData.callBackDate}
                  onChange={(value) => handleChange("callBackDate", value)}
                  error={touched.callBackDate ? errors.callBackDate : ""}
                  required
                  icon={<CalendarIcon />}
                  min={today}
                />
                <DateField
                  label="Deposit Inward Date"
                  name="depositInwardDate"
                  value={formData.depositInwardDate}
                  required
                  onChange={(value) => handleChange("depositInwardDate", value)}
                  error={
                    touched.depositInwardDate ? errors.depositInwardDate : ""
                  }
                  icon={<CalendarIcon />}
                />
                <DateField
                  label="Deposit Outward Date"
                  name="depositOutwardDate"
                  value={formData.depositOutwardDate}
                  onChange={(value) =>
                    handleChange("depositOutwardDate", value)
                  }
                  error={
                    touched.depositOutwardDate ? errors.depositOutwardDate : ""
                  }
                  required
                  icon={<CalendarIcon />}
                  min={formData.depositInwardDate || today}
                />
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Important Note
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    All data is validated and stored securely. Fields marked
                    with * are mandatory.{" "}
                    <strong>
                      Aadhar, PAN, mobile number, and email must be unique
                    </strong>{" "}
                    and cannot be duplicated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg
              hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg
                hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Enquiry"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Discard Changes?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  All unsaved changes will be lost
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Warning Modal */}
      {showDuplicateWarning && duplicateEnquiry && (
        <DuplicateWarningModal
          existingEnquiry={duplicateEnquiry}
          duplicateField={duplicateField}
          onClose={() => {
            setShowDuplicateWarning(false);
            setDuplicateEnquiry(null);
            setDuplicateField("");
          }}
        />
      )}
    </div>
  );
};

// Export utility functions for use in other components
export { storageUtils, generateUniqueId };
export type { EnquiryData };
export default AddEnquiry;
