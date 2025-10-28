const STORAGE_KEY = "enquiry_management_data";

export interface EnquiryData {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

// Helper function to get current user
const getCurrentUser = () => {
  try {
    const currentUserStr = localStorage.getItem("ems_current_user");
    if (!currentUserStr) return null;
    return JSON.parse(currentUserStr);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Helper function to check delete permission
const checkDeletePermission = (): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error("No user logged in");
    return false;
  }

  if (currentUser.role !== "admin") {
    console.error("User does not have permission to delete");
    return false;
  }

  return true;
};

export const storageUtils = {
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

  // Save new enquiry to localStorage
  saveEnquiry: (
    enquiry: Omit<EnquiryData, "id" | "createdAt" | "updatedAt">
  ): EnquiryData => {
    try {
      const enquiries = storageUtils.getAllEnquiries();
      const newEnquiry: EnquiryData = {
        ...enquiry,
        id: `ENQ-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      enquiries.push(newEnquiry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
      console.log("Enquiry saved successfully:", newEnquiry);
      return newEnquiry;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      throw error;
    }
  },

  // Update existing enquiry
  updateEnquiry: (
    id: string,
    updatedData: Partial<EnquiryData>
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

  // Delete enquiry (with permission check)
  deleteEnquiry: (id: string): boolean => {
    try {
      // Check permission first
      if (!checkDeletePermission()) {
        alert(
          "You don't have permission to delete enquiries. Only administrators can delete records."
        );
        return false;
      }

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

  // Export data as JSON
  exportData: (): string => {
    const enquiries = storageUtils.getAllEnquiries();
    return JSON.stringify(enquiries, null, 2);
  },

  // Download CSV backup
  downloadCSVBackup: (): void => {
    const enquiries = storageUtils.getAllEnquiries();
    if (enquiries.length === 0) {
      alert("No enquiries to export");
      return;
    }

    const headers = Object.keys(enquiries[0]);
    const csvContent = [
      headers.join(","),
      ...enquiries.map((enq) =>
        headers
          .map((header) => `"${enq[header as keyof EnquiryData] || ""}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `enquiries_backup_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Import data from JSON
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

  // Enhanced Aadhar check with excludeId parameter
  isAadharExists: (aadhar: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    const cleanAadhar = aadhar.replace(/\s/g, "");
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId &&
        enq.aadharNumber.replace(/\s/g, "") === cleanAadhar
    );
  },

  // Enhanced PAN check with excludeId parameter
  isPANExists: (pan: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    const cleanPAN = pan.toUpperCase().trim();
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId &&
        enq.panNumber.toUpperCase().trim() === cleanPAN
    );
  },

  // Enhanced Mobile check with excludeId parameter
  isMobileExists: (mobile: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.some(
      (enq) => enq.id !== excludeId && enq.mobile === mobile
    );
  },

  // Enhanced Email check with excludeId parameter
  isEmailExists: (email: string, excludeId?: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    const cleanEmail = email.toLowerCase().trim();
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId &&
        enq.email.toLowerCase().trim() === cleanEmail
    );
  },

  // Check for any duplicates in form data
  checkDuplicates: (
    formData: Partial<EnquiryData>,
    excludeId?: string
  ): {
    field: string;
    message: string;
  }[] => {
    const duplicates: { field: string; message: string }[] = [];

    if (
      formData.aadharNumber &&
      storageUtils.isAadharExists(formData.aadharNumber, excludeId)
    ) {
      duplicates.push({
        field: "aadharNumber",
        message: "This Aadhar number is already registered",
      });
    }

    if (
      formData.panNumber &&
      storageUtils.isPANExists(formData.panNumber, excludeId)
    ) {
      duplicates.push({
        field: "panNumber",
        message: "This PAN number is already registered",
      });
    }

    if (
      formData.mobile &&
      storageUtils.isMobileExists(formData.mobile, excludeId)
    ) {
      duplicates.push({
        field: "mobile",
        message: "This mobile number is already registered",
      });
    }

    if (
      formData.email &&
      storageUtils.isEmailExists(formData.email, excludeId)
    ) {
      duplicates.push({
        field: "email",
        message: "This email address is already registered",
      });
    }

    return duplicates;
  },

  // Get existing enquiry details by Aadhar or PAN
  getExistingEnquiry: (
    aadhar?: string,
    pan?: string,
    mobile?: string,
    email?: string
  ): EnquiryData | null => {
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

    if (mobile) {
      const found = enquiries.find((enq) => enq.mobile === mobile);
      if (found) return found;
    }

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const found = enquiries.find(
        (enq) => enq.email.toLowerCase().trim() === cleanEmail
      );
      if (found) return found;
    }

    return null;
  },

  // Get today's follow-ups
  getTodayFollowUps: (): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return enquiries.filter((enq) => {
      if (!enq.callBackDate) return false;
      const callBackDate = new Date(enq.callBackDate);
      callBackDate.setHours(0, 0, 0, 0);
      return callBackDate.getTime() === today.getTime();
    });
  },

  // Get all upcoming follow-ups
  getAllFollowUps: (): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return enquiries.filter((enq) => {
      if (!enq.callBackDate) return false;
      const callBackDate = new Date(enq.callBackDate);
      callBackDate.setHours(0, 0, 0, 0);
      return callBackDate >= today;
    });
  },

  // Get overdue follow-ups
  getOverdueFollowUps: (): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return enquiries.filter((enq) => {
      if (!enq.callBackDate) return false;
      const callBackDate = new Date(enq.callBackDate);
      callBackDate.setHours(0, 0, 0, 0);
      return callBackDate < today;
    });
  },

  // Validate unique fields before saving
  validateUniqueFields: (
    formData: Partial<EnquiryData>,
    excludeId?: string
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (
      formData.aadharNumber &&
      storageUtils.isAadharExists(formData.aadharNumber, excludeId)
    ) {
      errors.push("Aadhar number already exists");
    }

    if (
      formData.panNumber &&
      storageUtils.isPANExists(formData.panNumber, excludeId)
    ) {
      errors.push("PAN number already exists");
    }

    if (
      formData.mobile &&
      storageUtils.isMobileExists(formData.mobile, excludeId)
    ) {
      errors.push("Mobile number already exists");
    }

    if (
      formData.email &&
      storageUtils.isEmailExists(formData.email, excludeId)
    ) {
      errors.push("Email address already exists");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Bulk import enquiries with duplicate checking
  bulkImportEnquiries: (
    enquiries: Omit<EnquiryData, "id" | "createdAt" | "updatedAt">[]
  ): {
    success: number;
    failed: number;
    errors: { index: number; error: string }[];
  } => {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as { index: number; error: string }[],
    };

    enquiries.forEach((enquiry, index) => {
      try {
        // Check for duplicates
        const validation = storageUtils.validateUniqueFields(enquiry);
        if (!validation.isValid) {
          result.failed++;
          result.errors.push({
            index,
            error: validation.errors.join(", "),
          });
          return;
        }

        // Save enquiry
        storageUtils.saveEnquiry(enquiry);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    });

    return result;
  },

  // Get enquiries count by state
  getEnquiriesByState: (): { [state: string]: number } => {
    const enquiries = storageUtils.getAllEnquiries();
    const stateCount: { [state: string]: number } = {};

    enquiries.forEach((enq) => {
      if (enq.enquiryState) {
        stateCount[enq.enquiryState] =
          (stateCount[enq.enquiryState] || 0) + 1;
      }
    });

    return stateCount;
  },

  // Get enquiries count by profession
  getEnquiriesByProfession: (): { [profession: string]: number } => {
    const enquiries = storageUtils.getAllEnquiries();
    const professionCount: { [profession: string]: number } = {};

    enquiries.forEach((enq) => {
      const profession =
        enq.profession === "Other" && enq.customProfession
          ? enq.customProfession
          : enq.profession;
      if (profession) {
        professionCount[profession] = (professionCount[profession] || 0) + 1;
      }
    });

    return professionCount;
  },

  // Advanced search with multiple filters
  advancedSearch: (filters: {
    searchTerm?: string;
    status?: string;
    state?: string;
    profession?: string;
    dateFrom?: string;
    dateTo?: string;
  }): EnquiryData[] => {
    let enquiries = storageUtils.getAllEnquiries();

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      enquiries = enquiries.filter(
        (enq) =>
          enq.fullName.toLowerCase().includes(term) ||
          enq.mobile.includes(filters.searchTerm!) ||
          enq.email.toLowerCase().includes(term) ||
          enq.id.toLowerCase().includes(term)
      );
    }

    if (filters.status) {
      enquiries = enquiries.filter((enq) => enq.status === filters.status);
    }

    if (filters.state) {
      enquiries = enquiries.filter(
        (enq) => enq.enquiryState === filters.state
      );
    }

    if (filters.profession) {
      enquiries = enquiries.filter(
        (enq) => enq.profession === filters.profession
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      enquiries = enquiries.filter(
        (enq) => new Date(enq.createdAt) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      enquiries = enquiries.filter(
        (enq) => new Date(enq.createdAt) <= toDate
      );
    }

    return enquiries;
  },
};

// Generate unique ID
export const generateUniqueId = (): string => {
  return `ENQ-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

// Export helper functions
export const canDeleteEnquiry = (): boolean => {
  return checkDeletePermission();
};

export const getCurrentUserInfo = () => {
  return getCurrentUser();
};