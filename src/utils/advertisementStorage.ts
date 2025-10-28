export interface AdvertisementEnquiry {
  id: string;
  name: string;
  phoneNo: string;
  email: string;
  aadharNo?: string;
  panNo?: string;
  importedAt: string;
  importedBy?: string;
}

const STORAGE_KEY = "advertisement_enquiries";

export const advertisementStorage = {
  // Get all advertisement enquiries
  getAllAdvertisementEnquiries(): AdvertisementEnquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading advertisement enquiries:", error);
      return [];
    }
  },

  // Add single advertisement enquiry
  addAdvertisementEnquiry(enquiry: Omit<AdvertisementEnquiry, "id" | "importedAt">): boolean {
    try {
      const enquiries = this.getAllAdvertisementEnquiries();
      const newEnquiry: AdvertisementEnquiry = {
        ...enquiry,
        id: `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        importedAt: new Date().toISOString(),
      };
      enquiries.push(newEnquiry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
      return true;
    } catch (error) {
      console.error("Error adding advertisement enquiry:", error);
      return false;
    }
  },

  // Add multiple advertisement enquiries (bulk import)
  addBulkAdvertisementEnquiries(
    enquiries: Omit<AdvertisementEnquiry, "id" | "importedAt">[],
    importedBy?: string
  ): { success: number; failed: number; errors: string[] } {
    const result = { success: 0, failed: 0, errors: [] as string[] };
    const existingEnquiries = this.getAllAdvertisementEnquiries();
    const newEnquiries: AdvertisementEnquiry[] = [];

    enquiries.forEach((enquiry, index) => {
      try {
        // Normalize data - convert numbers to strings and trim
        const normalizedEnquiry = {
          name: String(enquiry.name || "").trim(),
          phoneNo: String(enquiry.phoneNo || "").replace(/\D/g, ""), // Remove non-digits
          email: String(enquiry.email || "").trim(),
          aadharNo: enquiry.aadharNo ? String(enquiry.aadharNo).replace(/\D/g, "") : "",
          panNo: enquiry.panNo ? String(enquiry.panNo).trim().toUpperCase() : "",
        };

        // Validate required fields
        const validation = this.validateEnquiry(normalizedEnquiry);
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(`Row ${index + 2}: ${validation.errors.join(", ")}`);
          return;
        }

        // Check for duplicates (by phone number)
        const isDuplicate = existingEnquiries.some(
          (e) => e.phoneNo === normalizedEnquiry.phoneNo
        ) || newEnquiries.some((e) => e.phoneNo === normalizedEnquiry.phoneNo);

        if (isDuplicate) {
          result.failed++;
          result.errors.push(`Row ${index + 2}: Duplicate phone number ${normalizedEnquiry.phoneNo}`);
          return;
        }

        newEnquiries.push({
          ...normalizedEnquiry,
          id: `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          importedAt: new Date().toISOString(),
          importedBy,
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${index + 2}: ${error}`);
      }
    });

    try {
      const allEnquiries = [...existingEnquiries, ...newEnquiries];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allEnquiries));
    } catch (error) {
      console.error("Error saving bulk enquiries:", error);
      result.errors.push("Failed to save to storage");
    }

    return result;
  },

  // Validate enquiry data
  validateEnquiry(enquiry: Partial<AdvertisementEnquiry>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Convert all values to strings for validation
    const name = String(enquiry.name || "").trim();
    const phoneNo = String(enquiry.phoneNo || "").trim();
    const email = String(enquiry.email || "").trim();
    const aadharNo = enquiry.aadharNo ? String(enquiry.aadharNo).trim() : "";
    const panNo = enquiry.panNo ? String(enquiry.panNo).trim() : "";

    // Name validation
    if (!name) {
      errors.push("Name is required");
    } else if (name.length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    // Phone number validation
    if (!phoneNo) {
      errors.push("Phone number is required");
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = phoneNo.replace(/\D/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        errors.push("Invalid phone number (must be 10 digits starting with 6-9)");
      }
    }

    // Email validation
    if (!email) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email address");
      }
    }

    // Aadhar validation (optional)
    if (aadharNo) {
      const aadharRegex = /^\d{12}$/;
      const cleanAadhar = aadharNo.replace(/\D/g, "");
      if (!aadharRegex.test(cleanAadhar)) {
        errors.push("Invalid Aadhar number (must be 12 digits)");
      }
    }

    // PAN validation (optional)
    if (panNo) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      const cleanPan = panNo.toUpperCase().trim();
      if (!panRegex.test(cleanPan)) {
        errors.push("Invalid PAN number (format: ABCDE1234F)");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Delete advertisement enquiry
  deleteAdvertisementEnquiry(id: string): boolean {
    try {
      const enquiries = this.getAllAdvertisementEnquiries();
      const filtered = enquiries.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting advertisement enquiry:", error);
      return false;
    }
  },

  // Update advertisement enquiry
  updateAdvertisementEnquiry(
    id: string,
    updates: Partial<AdvertisementEnquiry>
  ): boolean {
    try {
      const enquiries = this.getAllAdvertisementEnquiries();
      const index = enquiries.findIndex((e) => e.id === id);
      if (index === -1) return false;

      // Normalize the updates
      const normalizedUpdates = {
        ...updates,
        name: updates.name ? String(updates.name).trim() : enquiries[index].name,
        phoneNo: updates.phoneNo ? String(updates.phoneNo).replace(/\D/g, "") : enquiries[index].phoneNo,
        email: updates.email ? String(updates.email).trim() : enquiries[index].email,
        aadharNo: updates.aadharNo ? String(updates.aadharNo).replace(/\D/g, "") : enquiries[index].aadharNo,
        panNo: updates.panNo ? String(updates.panNo).trim().toUpperCase() : enquiries[index].panNo,
      };

      // Validate updates
      const updatedEnquiry = { ...enquiries[index], ...normalizedUpdates };
      const validation = this.validateEnquiry(updatedEnquiry);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      enquiries[index] = updatedEnquiry;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));
      return true;
    } catch (error) {
      console.error("Error updating advertisement enquiry:", error);
      return false;
    }
  },

  // Clear all advertisement enquiries
  clearAllAdvertisementEnquiries(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing advertisement enquiries:", error);
      return false;
    }
  },

  // Export to CSV
  exportToCSV(): string {
    const enquiries = this.getAllAdvertisementEnquiries();
    const headers = ["ID", "Name", "Phone No", "Email", "Aadhar No", "PAN No", "Imported At"];
    const rows = enquiries.map((e) => [
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

    return csvContent;
  },

  // Download CSV
  downloadCSV(): void {
    const csvContent = this.exportToCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `advertisement-enquiries-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Get statistics
  getStatistics() {
    const enquiries = this.getAllAdvertisementEnquiries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: enquiries.length,
      todayImported: enquiries.filter((e) => {
        const importDate = new Date(e.importedAt);
        importDate.setHours(0, 0, 0, 0);
        return importDate.getTime() === today.getTime();
      }).length,
      withAadhar: enquiries.filter((e) => e.aadharNo && e.aadharNo.length > 0).length,
      withPAN: enquiries.filter((e) => e.panNo && e.panNo.length > 0).length,
    };
  },
};