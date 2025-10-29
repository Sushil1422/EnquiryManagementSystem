import { db } from './database';

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

export const advertisementStorage = {
  getAllAdvertisementEnquiries: async (): Promise<AdvertisementEnquiry[]> => {
    try {
      return await db.advertisements.getAll();
    } catch (error) {
      console.error("Error loading advertisement enquiries:", error);
      return [];
    }
  },

  addAdvertisementEnquiry: async (enquiry: Omit<AdvertisementEnquiry, "id" | "importedAt">): Promise<boolean> => {
    try {
      const newEnquiry: AdvertisementEnquiry = {
        ...enquiry,
        id: `ADV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        importedAt: new Date().toISOString(),
      };
      const result = await db.advertisements.add(newEnquiry);
      return result.success;
    } catch (error) {
      console.error("Error adding advertisement enquiry:", error);
      return false;
    }
  },

  addBulkAdvertisementEnquiries: async (
    enquiries: Omit<AdvertisementEnquiry, "id" | "importedAt">[],
    importedBy?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    const result = { success: 0, failed: 0, errors: [] as string[] };
    const existingEnquiries = await db.advertisements.getAll();
    const newEnquiries: AdvertisementEnquiry[] = [];

    enquiries.forEach((enquiry, index) => {
      try {
        const normalizedEnquiry = {
          name: String(enquiry.name || "").trim(),
          phoneNo: String(enquiry.phoneNo || "").replace(/\D/g, ""),
          email: String(enquiry.email || "").trim(),
          aadharNo: enquiry.aadharNo ? String(enquiry.aadharNo).replace(/\D/g, "") : "",
          panNo: enquiry.panNo ? String(enquiry.panNo).trim().toUpperCase() : "",
        };

        const validation = advertisementStorage.validateEnquiry(normalizedEnquiry);
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(`Row ${index + 2}: ${validation.errors.join(", ")}`);
          return;
        }

        const isDuplicate = existingEnquiries.some(
          (e: AdvertisementEnquiry) => e.phoneNo === normalizedEnquiry.phoneNo
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
      if (newEnquiries.length > 0) {
        await db.advertisements.bulkAdd(newEnquiries);
      }
    } catch (error) {
      console.error("Error saving bulk enquiries:", error);
      result.errors.push("Failed to save to database");
    }

    return result;
  },

  updateAdvertisementEnquiry: async (
    id: string,
    updates: Partial<AdvertisementEnquiry>
  ): Promise<boolean> => {
    try {
      const normalizedUpdates = {
        name: updates.name ? String(updates.name).trim() : undefined,
        phoneNo: updates.phoneNo ? String(updates.phoneNo).replace(/\D/g, "") : undefined,
        email: updates.email ? String(updates.email).trim() : undefined,
        aadharNo: updates.aadharNo ? String(updates.aadharNo).replace(/\D/g, "") : undefined,
        panNo: updates.panNo ? String(updates.panNo).trim().toUpperCase() : undefined,
      };

      // Remove undefined values
      Object.keys(normalizedUpdates).forEach(
        key => normalizedUpdates[key as keyof typeof normalizedUpdates] === undefined && delete normalizedUpdates[key as keyof typeof normalizedUpdates]
      );

      const result = await db.advertisements.update(id, normalizedUpdates);
      return result.success;
    } catch (error) {
      console.error("Error updating advertisement enquiry:", error);
      return false;
    }
  },

  deleteAdvertisementEnquiry: async (id: string): Promise<boolean> => {
    try {
      const result = await db.advertisements.delete(id);
      return result.success;
    } catch (error) {
      console.error("Error deleting advertisement enquiry:", error);
      return false;
    }
  },

  validateEnquiry(enquiry: Partial<AdvertisementEnquiry>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const name = String(enquiry.name || "").trim();
    const phoneNo = String(enquiry.phoneNo || "").trim();
    const email = String(enquiry.email || "").trim();
    const aadharNo = enquiry.aadharNo ? String(enquiry.aadharNo).trim() : "";
    const panNo = enquiry.panNo ? String(enquiry.panNo).trim() : "";

    if (!name) {
      errors.push("Name is required");
    } else if (name.length < 2) {
      errors.push("Name must be at least 2 characters");
    }

    if (!phoneNo) {
      errors.push("Phone number is required");
    } else {
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = phoneNo.replace(/\D/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        errors.push("Invalid phone number (must be 10 digits starting with 6-9)");
      }
    }

    if (!email) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email address");
      }
    }

    if (aadharNo) {
      const aadharRegex = /^\d{12}$/;
      const cleanAadhar = aadharNo.replace(/\D/g, "");
      if (!aadharRegex.test(cleanAadhar)) {
        errors.push("Invalid Aadhar number (must be 12 digits)");
      }
    }

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

  downloadCSV: async () => {
    try {
      const enquiries = await db.advertisements.getAll();
      const headers = ["ID", "Name", "Phone No", "Email", "Aadhar No", "PAN No", "Imported At"];
      const rows = enquiries.map((e: AdvertisementEnquiry) => [
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
        ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(",")),
      ].join("\n");

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
    } catch (error) {
      console.error("Error downloading CSV:", error);
      throw error;
    }
  },

  getStatistics: async () => {
    try {
      const enquiries = await db.advertisements.getAll();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        total: enquiries.length,
        todayImported: enquiries.filter((e: AdvertisementEnquiry) => {
          const importDate = new Date(e.importedAt);
          importDate.setHours(0, 0, 0, 0);
          return importDate.getTime() === today.getTime();
        }).length,
        withAadhar: enquiries.filter((e: AdvertisementEnquiry) => e.aadharNo && e.aadharNo.length > 0).length,
        withPAN: enquiries.filter((e: AdvertisementEnquiry) => e.panNo && e.panNo.length > 0).length,
      };
    } catch (error) {
      return {
        total: 0,
        todayImported: 0,
        withAadhar: 0,
        withPAN: 0,
      };
    }
  },
};