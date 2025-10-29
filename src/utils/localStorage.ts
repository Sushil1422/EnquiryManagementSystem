import { db } from './database';


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
  // Get all enquiries
  getAllEnquiries: async (): Promise<EnquiryData[]> => {
    try {
      const enquiries = await db.enquiries.getAll();
      return enquiries || [];
    } catch (error) {
      console.error("Error reading enquiries:", error);
      return [];
    }
  },

  // Save new enquiry
  saveEnquiry: async (
    enquiry: Omit<EnquiryData, "id" | "createdAt" | "updatedAt">
  ): Promise<EnquiryData> => {
    try {
      const newEnquiry: EnquiryData = {
        ...enquiry,
        id: `ENQ-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const result = await db.enquiries.add(newEnquiry);
      
      if (result.success) {
        console.log("Enquiry saved successfully:", newEnquiry);
        return newEnquiry;
      } else {
        throw new Error(result.error || "Failed to save enquiry");
      }
    } catch (error) {
      console.error("Error saving enquiry:", error);
      throw error;
    }
  },

  // Update existing enquiry
  updateEnquiry: async (
    id: string,
    updatedData: Partial<EnquiryData>
  ): Promise<EnquiryData | null> => {
    try {
      const dataToUpdate = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      
      const result = await db.enquiries.update(id, dataToUpdate);
      
      if (result.success) {
        const enquiries = await db.enquiries.getAll();
        const updated = enquiries.find((enq: EnquiryData) => enq.id === id);
        console.log("Enquiry updated successfully:", updated);
        return updated || null;
      }
      
      return null;
    } catch (error) {
      console.error("Error updating enquiry:", error);
      throw error;
    }
  },

  // Delete enquiry (with permission check)
  deleteEnquiry: async (id: string): Promise<boolean> => {
    try {
      // Check permission first
      if (!checkDeletePermission()) {
        alert(
          "You don't have permission to delete enquiries. Only administrators can delete records."
        );
        return false;
      }

      const result = await db.enquiries.delete(id);
      
      if (result.success) {
        const remaining = await db.enquiries.getAll();
        console.log("Enquiry deleted successfully. Remaining:", remaining.length);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      return false;
    }
  },

  // Get enquiry by ID
  getEnquiryById: async (id: string): Promise<EnquiryData | null> => {
    const enquiries = await storageUtils.getAllEnquiries();
    return enquiries.find((enq) => enq.id === id) || null;
  },

  // Search enquiries
  searchEnquiries: async (searchTerm: string): Promise<EnquiryData[]> => {
    const enquiries = await storageUtils.getAllEnquiries();
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
  getStatistics: async () => {
    const enquiries = await storageUtils.getAllEnquiries();
    return {
      total: enquiries.length,
      confirmed: enquiries.filter((e) => e.status === "Confirmed").length,
      pending: enquiries.filter((e) => e.status === "Pending").length,
      inProcess: enquiries.filter((e) => e.status === "In Process").length,
    };
  },

  // Export data as JSON
  exportData: async (): Promise<string> => {
    const enquiries = await storageUtils.getAllEnquiries();
    return JSON.stringify(enquiries, null, 2);
  },

  // Download CSV backup
  downloadCSVBackup: async (): Promise<void> => {
    const enquiries = await storageUtils.getAllEnquiries();
    if (enquiries.length === 0) {
      alert("No enquiries to export");
      return;
    }

    const headers = [
      "ID", "Full Name", "Mobile", "Alternate Mobile", "Email", "Address",
      "Aadhar Number", "PAN Number", "Demat Account 1", "Demat Account 2",
      "State", "Source", "Interest Level", "Status", "Profession",
      "Custom Profession", "Market Knowledge", "How Did You Know",
      "Custom Source", "Call Back Date", "Deposit Inward", "Deposit Outward",
      "Created At", "Updated At"
    ];

    const rows = enquiries.map((e: EnquiryData) => [
      e.id,
      e.fullName,
      e.mobile,
      e.alternateMobile || "",
      e.email,
      e.address || "",
      e.aadharNumber || "",
      e.panNumber || "",
      e.demateAccount1 || "",
      e.demateAccount2 || "",
      e.enquiryState,
      e.sourceOfEnquiry || "",
      e.interestedStatus || "",
      e.status,
      e.profession,
      e.customProfession || "",
      e.knowledgeOfShareMarket || "",
      e.howDidYouKnow || "",
      e.customHowDidYouKnow || "",
      e.callBackDate || "",
      e.depositInwardDate || "",
      e.depositOutwardDate || "",
      e.createdAt,
      e.updatedAt || "",
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
      `enquiries_backup_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Import data from JSON
  importData: async (jsonData: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        // Import each enquiry
        for (const enquiry of data) {
          await db.enquiries.add(enquiry);
        }
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
  clearAllData: async (): Promise<void> => {
    if (
      window.confirm(
        "Are you sure you want to delete all enquiries? This action cannot be undone."
      )
    ) {
      const enquiries = await storageUtils.getAllEnquiries();
      for (const enq of enquiries) {
        await db.enquiries.delete(enq.id);
      }
      console.log("All data cleared");
    }
  },

  // Get enquiries by date range
  getEnquiriesByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<EnquiryData[]> => {
    const enquiries = await storageUtils.getAllEnquiries();
    return enquiries.filter((enq) => {
      const createdDate = new Date(enq.createdAt);
      return (
        createdDate >= new Date(startDate) && createdDate <= new Date(endDate)
      );
    });
  },

  // Get enquiries by status
  getEnquiriesByStatus: async (status: string): Promise<EnquiryData[]> => {
    const enquiries = await storageUtils.getAllEnquiries();
    return enquiries.filter((enq) => enq.status === status);
  },

  // Enhanced Aadhar check with excludeId parameter
  isAadharExists: async (aadhar: string, excludeId?: string): Promise<boolean> => {
    const enquiries = await storageUtils.getAllEnquiries();
    const cleanAadhar = aadhar.replace(/\s/g, "");
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId &&
        enq.aadharNumber.replace(/\s/g, "") === cleanAadhar
    );
  },

  // Enhanced PAN check with excludeId parameter
  isPANExists: async (pan: string, excludeId?: string): Promise<boolean> => {
    const enquiries = await storageUtils.getAllEnquiries();
    const cleanPAN = pan.toUpperCase().trim();
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId &&
        enq.panNumber.toUpperCase().trim() === cleanPAN
    );
  },

  // Enhanced Mobile check with excludeId parameter
  isMobileExists: async (mobile: string, excludeId?: string): Promise<boolean> => {
    const enquiries = await storageUtils.getAllEnquiries();
    return enquiries.some(
      (enq) => enq.id !== excludeId && enq.mobile === mobile
    );
  },

  // Enhanced Email check with excludeId parameter
  isEmailExists: async (email: string, excludeId?: string): Promise<boolean> => {
    const enquiries = await storageUtils.getAllEnquiries();
    const cleanEmail = email.toLowerCase().trim();
    return enquiries.some(
      (enq) =>
        enq.id !== excludeId &&
        enq.email.toLowerCase().trim() === cleanEmail
    );
  },

  // Check for any duplicates in form data
  checkDuplicates: async (
    formData: Partial<EnquiryData>,
    excludeId?: string
  ): Promise<{
    field: string;
    message: string;
  }[]> => {
    const duplicates: { field: string; message: string }[] = [];

    if (formData.aadharNumber) {
      const exists = await storageUtils.isAadharExists(formData.aadharNumber, excludeId);
      if (exists) {
        duplicates.push({
          field: "aadharNumber",
          message: "This Aadhar number is already registered",
        });
      }
    }

    if (formData.panNumber) {
      const exists = await storageUtils.isPANExists(formData.panNumber, excludeId);
      if (exists) {
        duplicates.push({
          field: "panNumber",
          message: "This PAN number is already registered",
        });
      }
    }

    if (formData.mobile) {
      const exists = await storageUtils.isMobileExists(formData.mobile, excludeId);
      if (exists) {
        duplicates.push({
          field: "mobile",
          message: "This mobile number is already registered",
        });
      }
    }

    if (formData.email) {
      const exists = await storageUtils.isEmailExists(formData.email, excludeId);
      if (exists) {
        duplicates.push({
          field: "email",
          message: "This email address is already registered",
        });
      }
    }

    return duplicates;
  },

  // Get existing enquiry details by Aadhar or PAN
  getExistingEnquiry: async (
    aadhar?: string,
    pan?: string,
    mobile?: string,
    email?: string
  ): Promise<EnquiryData | null> => {
    const enquiries = await storageUtils.getAllEnquiries();

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
  getTodayFollowUps: async (): Promise<EnquiryData[]> => {
    const enquiries = await storageUtils.getAllEnquiries();
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
  getAllFollowUps: async (): Promise<EnquiryData[]> => {
    const enquiries = await storageUtils.getAllEnquiries();
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
  getOverdueFollowUps: async (): Promise<EnquiryData[]> => {
    const enquiries = await storageUtils.getAllEnquiries();
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
  validateUniqueFields: async (
    formData: Partial<EnquiryData>,
    excludeId?: string
  ): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];

    if (formData.aadharNumber) {
      const exists = await storageUtils.isAadharExists(formData.aadharNumber, excludeId);
      if (exists) {
        errors.push("Aadhar number already exists");
      }
    }

    if (formData.panNumber) {
      const exists = await storageUtils.isPANExists(formData.panNumber, excludeId);
      if (exists) {
        errors.push("PAN number already exists");
      }
    }

    if (formData.mobile) {
      const exists = await storageUtils.isMobileExists(formData.mobile, excludeId);
      if (exists) {
        errors.push("Mobile number already exists");
      }
    }

    if (formData.email) {
      const exists = await storageUtils.isEmailExists(formData.email, excludeId);
      if (exists) {
        errors.push("Email address already exists");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Bulk import enquiries with duplicate checking
  bulkImportEnquiries: async (
    enquiries: Omit<EnquiryData, "id" | "createdAt" | "updatedAt">[]
  ): Promise<{
    success: number;
    failed: number;
    errors: { index: number; error: string }[];
  }> => {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as { index: number; error: string }[],
    };

    for (let index = 0; index < enquiries.length; index++) {
      const enquiry = enquiries[index];
      try {
        // Check for duplicates
        const validation = await storageUtils.validateUniqueFields(enquiry);
        if (!validation.isValid) {
          result.failed++;
          result.errors.push({
            index,
            error: validation.errors.join(", "),
          });
          continue;
        }

        // Save enquiry
        await storageUtils.saveEnquiry(enquiry);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }

    return result;
  },

  // Get enquiries count by state
  getEnquiriesByState: async (): Promise<{ [state: string]: number }> => {
    const enquiries = await storageUtils.getAllEnquiries();
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
  getEnquiriesByProfession: async (): Promise<{ [profession: string]: number }> => {
    const enquiries = await storageUtils.getAllEnquiries();
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
  advancedSearch: async (filters: {
    searchTerm?: string;
    status?: string;
    state?: string;
    profession?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<EnquiryData[]> => {
    let enquiries = await storageUtils.getAllEnquiries();

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