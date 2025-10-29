const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// ✅ Determine if we're in development or production
const isDev = !app.isPackaged;

// ✅ Data file path
const DATA_FILE = path.join(app.getPath("userData"), "data.json");

console.log("📁 Data will be stored at:", DATA_FILE);
console.log("🔧 Running in:", isDev ? "DEVELOPMENT" : "PRODUCTION");

// ✅ Initialize data structure
const initData = () => ({
  enquiries: [],
  users: [],
  advertisements: [],
});

// ✅ Read database
const readDatabase = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const rawData = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(rawData);
      console.log("📖 Loaded database:", {
        enquiries: data.enquiries?.length || 0,
        users: data.users?.length || 0,
        advertisements: data.advertisements?.length || 0,
      });
      return data;
    }
  } catch (error) {
    console.error("❌ Error reading database:", error);
  }
  console.log("📄 Creating new database");
  return initData();
};

// ✅ Write database
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    console.log("💾 Database saved:", {
      enquiries: data.enquiries?.length || 0,
      users: data.users?.length || 0,
      advertisements: data.advertisements?.length || 0,
    });
    return true;
  } catch (error) {
    console.error("❌ Error writing database:", error);
    return false;
  }
};

// ✅ Create window
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      // ✅ Enable DevTools in production for debugging
      devTools: true,
    },
  });

  // ✅ Load URL based on environment
  if (isDev) {
    console.log("🔧 Loading from DEV server: http://localhost:5173");
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    console.log(
      "📦 Loading from FILE:",
      path.join(__dirname, "../dist/index.html")
    );

    // ✅ CORRECT production path
    const indexPath = path.join(__dirname, "../dist/index.html");

    console.log("📂 Index path exists?", fs.existsSync(indexPath));
    console.log("📂 Full path:", indexPath);

    mainWindow.loadFile(indexPath);

    // ✅ Open DevTools in production to see errors
    // mainWindow.webContents.openDevTools();
  }

  // ✅ Log any errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("❌ Failed to load:", errorCode, errorDescription);
    }
  );

  mainWindow.webContents.on("crashed", () => {
    console.error("❌ Renderer process crashed");
  });

  mainWindow.on("unresponsive", () => {
    console.error("❌ Window is unresponsive");
  });
}

app.whenReady().then(() => {
  // Initialize database file
  if (!fs.existsSync(DATA_FILE)) {
    writeDatabase(initData());
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ==========================================
// 🧾 ENQUIRIES HANDLERS
// ==========================================

ipcMain.handle("enquiries.getAll", async () => {
  console.log("🔵 IPC: enquiries.getAll called");
  try {
    const db = readDatabase();
    console.log("🔵 Returning", db.enquiries.length, "enquiries");
    return { success: true, data: db.enquiries };
  } catch (error) {
    console.error("❌ enquiries.getAll error:", error);
    return { success: false, error: error.message, data: [] };
  }
});

ipcMain.handle("enquiries.add", async (event, enquiry) => {
  console.log("🟢 IPC: enquiries.add called");
  console.log("🟢 Received enquiry:", enquiry);
  try {
    const db = readDatabase();
    console.log("🟢 Current enquiries count:", db.enquiries.length);

    db.enquiries.push(enquiry);
    console.log("🟢 After push:", db.enquiries.length);

    const writeSuccess = writeDatabase(db);
    console.log("🟢 Write success:", writeSuccess);

    if (writeSuccess) {
      console.log("✅ Successfully added enquiry:", enquiry.id);
      return { success: true, data: enquiry };
    } else {
      throw new Error("Failed to write database");
    }
  } catch (error) {
    console.error("❌ enquiries.add error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("enquiries.update", async (event, id, updates) => {
  console.log("🟡 IPC: enquiries.update called for", id);
  try {
    const db = readDatabase();
    const index = db.enquiries.findIndex((e) => e.id === id);

    if (index === -1) {
      console.log("❌ Enquiry not found:", id);
      return { success: false, error: "Enquiry not found" };
    }

    db.enquiries[index] = {
      ...db.enquiries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    writeDatabase(db);
    console.log("✅ Updated enquiry:", id);
    return { success: true, data: db.enquiries[index] };
  } catch (error) {
    console.error("❌ enquiries.update error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("enquiries.delete", async (event, id) => {
  console.log("🔴 IPC: enquiries.delete called for", id);
  try {
    const db = readDatabase();
    const originalLength = db.enquiries.length;
    db.enquiries = db.enquiries.filter((e) => e.id !== id);

    if (db.enquiries.length === originalLength) {
      console.log("❌ Enquiry not found:", id);
      return { success: false, error: "Enquiry not found" };
    }

    writeDatabase(db);
    console.log("✅ Deleted enquiry:", id);
    return { success: true };
  } catch (error) {
    console.error("❌ enquiries.delete error:", error);
    return { success: false, error: error.message };
  }
});

// ==========================================
// 👤 USERS HANDLERS
// ==========================================

ipcMain.handle("users.getAll", async () => {
  try {
    const db = readDatabase();
    return { success: true, data: db.users };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
});

ipcMain.handle("users.add", async (event, user) => {
  try {
    const db = readDatabase();
    db.users.push(user);
    writeDatabase(db);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("users.update", async (event, id, updates) => {
  try {
    const db = readDatabase();
    const index = db.users.findIndex((u) => u.id === id);

    if (index === -1) {
      return { success: false, error: "User not found" };
    }

    db.users[index] = { ...db.users[index], ...updates };
    writeDatabase(db);
    return { success: true, data: db.users[index] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("users.delete", async (event, id) => {
  try {
    const db = readDatabase();
    const index = db.users.findIndex((u) => u.id === id);

    if (index !== -1) {
      db.users[index].isActive = false;
      writeDatabase(db);
      return { success: true };
    }

    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==========================================
// 📢 ADVERTISEMENTS HANDLERS
// ==========================================

ipcMain.handle("advertisements.getAll", async () => {
  try {
    const db = readDatabase();
    return { success: true, data: db.advertisements };
  } catch (error) {
    return { success: false, error: error.message, data: [] };
  }
});

ipcMain.handle("advertisements.add", async (event, ad) => {
  try {
    const db = readDatabase();
    db.advertisements.push(ad);
    writeDatabase(db);
    return { success: true, data: ad };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("advertisements.bulkAdd", async (event, ads) => {
  try {
    const db = readDatabase();
    db.advertisements.push(...ads);
    writeDatabase(db);
    return { success: true, data: ads };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("advertisements.update", async (event, id, updates) => {
  try {
    const db = readDatabase();
    const index = db.advertisements.findIndex((a) => a.id === id);

    if (index === -1) {
      return { success: false, error: "Advertisement not found" };
    }

    db.advertisements[index] = { ...db.advertisements[index], ...updates };
    writeDatabase(db);
    return { success: true, data: db.advertisements[index] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("advertisements.delete", async (event, id) => {
  try {
    const db = readDatabase();
    const originalLength = db.advertisements.length;
    db.advertisements = db.advertisements.filter((a) => a.id !== id);

    if (db.advertisements.length === originalLength) {
      return { success: false, error: "Advertisement not found" };
    }

    writeDatabase(db);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
