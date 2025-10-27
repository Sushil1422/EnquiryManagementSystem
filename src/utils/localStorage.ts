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
  getAllEnquiries: (): EnquiryData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  },

  saveEnquiry: (enquiry: Omit<EnquiryData, "id" | "createdAt" | "updatedAt">): EnquiryData => {
    try {
      const enquiries = storageUtils.getAllEnquiries();
      const newEnquiry: EnquiryData = {
        ...enquiry,
        id: `ENQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
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

  updateEnquiry: (id: string, updatedData: Partial<EnquiryData>): EnquiryData | null => {
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

  deleteEnquiry: (id: string): boolean => {
    try {
      // Check permission first
      if (!checkDeletePermission()) {
        alert("You don't have permission to delete enquiries. Only administrators can delete records.");
        return false;
      }

      const enquiries = storageUtils.getAllEnquiries();
      const filteredEnquiries = enquiries.filter((enq) => enq.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEnquiries));
      console.log("Enquiry deleted successfully. Remaining:", filteredEnquiries.length);
      return true;
    } catch (error) {
      console.error("Error deleting from localStorage:", error);
      return false;
    }
  },

  getEnquiryById: (id: string): EnquiryData | null => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.find((enq) => enq.id === id) || null;
  },

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

  getStatistics: () => {
    const enquiries = storageUtils.getAllEnquiries();
    return {
      total: enquiries.length,
      confirmed: enquiries.filter((e) => e.status === "Confirmed").length,
      pending: enquiries.filter((e) => e.status === "Pending").length,
      inProcess: enquiries.filter((e) => e.status === "In Process").length,
    };
  },

  exportData: (): string => {
    const enquiries = storageUtils.getAllEnquiries();
    return JSON.stringify(enquiries, null, 2);
  },

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
        headers.map((header) => `"${enq[header as keyof EnquiryData] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `enquiries_backup_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

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

  clearAllData: (): void => {
    if (window.confirm("Are you sure you want to delete all enquiries? This action cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      console.log("All data cleared");
    }
  },

  getEnquiriesByDateRange: (startDate: string, endDate: string): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.filter((enq) => {
      const createdDate = new Date(enq.createdAt);
      return createdDate >= new Date(startDate) && createdDate <= new Date(endDate);
    });
  },

  getEnquiriesByStatus: (status: string): EnquiryData[] => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.filter((enq) => enq.status === status);
  },

  isAadharExists: (aadhar: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    const cleanAadhar = aadhar.replace(/\s/g, "");
    return enquiries.some((enq) => enq.aadharNumber.replace(/\s/g, "") === cleanAadhar);
  },

  isPANExists: (pan: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.some((enq) => enq.panNumber.toUpperCase() === pan.toUpperCase());
  },

  isMobileExists: (mobile: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.some((enq) => enq.mobile === mobile);
  },

  isEmailExists: (email: string): boolean => {
    const enquiries = storageUtils.getAllEnquiries();
    return enquiries.some((enq) => enq.email.toLowerCase() === email.toLowerCase());
  },
};

export const generateUniqueId = (): string => {
  return `ENQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};