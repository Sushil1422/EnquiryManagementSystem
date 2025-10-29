const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  enquiries: {
    getAll: () => ipcRenderer.invoke("enquiries.getAll"),
    add: (data) => ipcRenderer.invoke("enquiries.add", data),
    update: (id, updates) =>
      ipcRenderer.invoke("enquiries.update", id, updates),
    delete: (id) => ipcRenderer.invoke("enquiries.delete", id),
  },
  users: {
    getAll: () => ipcRenderer.invoke("users.getAll"),
    add: (data) => ipcRenderer.invoke("users.add", data),
    update: (id, updates) => ipcRenderer.invoke("users.update", id, updates),
    delete: (id) => ipcRenderer.invoke("users.delete", id),
  },
  advertisements: {
    getAll: () => ipcRenderer.invoke("advertisements.getAll"),
    add: (data) => ipcRenderer.invoke("advertisements.add", data),
    bulkAdd: (data) => ipcRenderer.invoke("advertisements.bulkAdd", data),
    update: (id, updates) =>
      ipcRenderer.invoke("advertisements.update", id, updates),
    delete: (id) => ipcRenderer.invoke("advertisements.delete", id),
  },
});

console.log("✅ Preload script loaded - Electron API available");
