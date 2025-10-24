// Types
export interface FormData {
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

export interface EnquiryData extends FormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// LocalStorage Keys
const STORAGE_KEY = "enquiry_management_data";

// Generate unique ID
export const generateUniqueId = (): string => {
  return `ENQ-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;
};

// ========== LocalStorage Utility Functions ==========
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

  // Download CSV backup
  downloadCSVBackup: () => {
    const enquiries = storageUtils.getAllEnquiries();
    if (enquiries.length === 0) {
      alert("No data to export");
      return;
    }

    // Create CSV content
    const headers = Object.keys(enquiries[0]).join(",");
    const rows = enquiries.map((enq) =>
      Object.values(enq)
        .map((val) => `"${val}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries_backup_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};