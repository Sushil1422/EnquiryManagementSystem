// ✅ Detect if running inside Electron
const isElectron = (): boolean => {
  try {
    return typeof window !== "undefined" && !!(window as any).electronAPI;
  } catch {
    return false;
  }
};

// ❌ Throw error if not in Electron (force developers to use electron:dev)
const enforceElectron = (operation: string) => {
  if (!isElectron()) {
    const errorMsg = `
❌ ERROR: ${operation} requires Electron!

You're running in browser mode (npm run dev).
Data will NOT persist in browser storage.

✅ USE THIS INSTEAD:
   npm run electron:dev

This ensures data is stored in:
C:\\Users\\<You>\\AppData\\Roaming\\DesktopCRM\\data.json
    `.trim();
    
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error(`${operation} requires Electron mode. Use: npm run electron:dev`);
  }
};

// ✅ Database API (Electron ONLY - no browser fallback)
export const db = {
  // 🧾 Enquiries
  enquiries: {
    async getAll() {
      console.log("🔍 database.ts: enquiries.getAll() called");
      enforceElectron("Get Enquiries");
      
      try {
        console.log("📡 Calling Electron API...");
        const result = await (window as any).electronAPI.enquiries.getAll();
        console.log("📦 Electron returned:", result);
        
        if (result?.success) {
          console.log("✅ Loaded", result.data?.length || 0, "enquiries from file");
          return result.data || [];
        }
        
        console.error("❌ Electron returned error:", result);
        return [];
      } catch (err) {
        console.error("❌ Electron enquiries.getAll failed:", err);
        return [];
      }
    },

    async add(enquiry: any) {
      console.log("➕ database.ts: enquiries.add() called");
      enforceElectron("Add Enquiry");
      
      try {
        console.log("📡 Adding via Electron API...");
        const result = await (window as any).electronAPI.enquiries.add(enquiry);
        console.log("✅ Electron add result:", result);
        return result?.success ? result : { success: false };
      } catch (err) {
        console.error("❌ Electron add failed:", err);
        return { success: false };
      }
    },

    async update(id: string, updates: any) {
      console.log("✏️ database.ts: enquiries.update() called");
      enforceElectron("Update Enquiry");
      
      try {
        const result = await (window as any).electronAPI.enquiries.update(id, updates);
        console.log("✅ Electron update result:", result);
        return result?.success ? result : { success: false };
      } catch (err) {
        console.error("❌ Electron update failed:", err);
        return { success: false };
      }
    },

    async delete(id: string) {
      console.log("🗑️ database.ts: enquiries.delete() called");
      enforceElectron("Delete Enquiry");
      
      try {
        const result = await (window as any).electronAPI.enquiries.delete(id);
        console.log("✅ Electron delete result:", result);
        return result?.success ? result : { success: false };
      } catch (err) {
        console.error("❌ Electron delete failed:", err);
        return { success: false };
      }
    },
  },

  // 👤 Users
  users: {
    async getAll() {
      enforceElectron("Get Users");
      try {
        const result = await (window as any).electronAPI.users.getAll();
        return result?.success ? result.data || [] : [];
      } catch (err) {
        console.error("❌ Electron users.getAll failed:", err);
        return [];
      }
    },

    async add(user: any) {
      enforceElectron("Add User");
      try {
        const result = await (window as any).electronAPI.users.add(user);
        return result?.success ? result : { success: false };
      } catch (err) {
        return { success: false };
      }
    },

    async update(id: string, updates: any) {
      enforceElectron("Update User");
      try {
        const result = await (window as any).electronAPI.users.update(id, updates);
        return result?.success ? result : { success: false };
      } catch (err) {
        return { success: false };
      }
    },

    async delete(id: string) {
      enforceElectron("Delete User");
      try {
        const result = await (window as any).electronAPI.users.delete(id);
        return result?.success ? result : { success: false };
      } catch (err) {
        return { success: false };
      }
    },
  },

  // 📢 Advertisements
  advertisements: {
    async getAll() {
      enforceElectron("Get Advertisements");
      try {
        const result = await (window as any).electronAPI.advertisements.getAll();
        return result?.success ? result.data || [] : [];
      } catch (err) {
        console.error("❌ Electron advertisements.getAll failed:", err);
        return [];
      }
    },

    async add(advertisement: any) {
      enforceElectron("Add Advertisement");
      try {
        const result = await (window as any).electronAPI.advertisements.add(advertisement);
        return result?.success ? result : { success: false };
      } catch (err) {
        return { success: false };
      }
    },

    async bulkAdd(advertisements: any[]) {
      enforceElectron("Bulk Add Advertisements");
      try {
        const result = await (window as any).electronAPI.advertisements.bulkAdd(advertisements);
        return result?.success ? result : { success: false };
      } catch (err) {
        return { success: false };
      }
    },

    async update(id: string, updates: any) {
      enforceElectron("Update Advertisement");
      try {
        const result = await (window as any).electronAPI.advertisements.update(id, updates);
        return result?.success ? result : { success: false };
      } catch (err) {
        return { success: false };
      }
    },

    async delete(id: string) {
      enforceElectron("Delete Advertisement");
      try {
        const result = await (window as any).electronAPI.advertisements.delete(id);
        return result?.success ? result : { success: false };
      } catch (err) {
        return { success: false };
      }
    },
  },
};