import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  //   Download,
  AlertCircle,
  //   Info,
  //   FileDown,
} from "lucide-react";
import { advertisementStorage } from "../utils/advertisementStorage";
import { useAuth } from "../contexts/AuthContext";

const ImportAdvertisement: React.FC = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "xlsx" || fileExtension === "xls") {
        setFile(selectedFile);
        setImportResult(null);
        showToast("File selected successfully", "success");
      } else {
        showToast("Please select a valid Excel file (.xlsx or .xls)", "error");
        e.target.value = "";
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast("Please select a file first", "error");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        showToast("Excel file is empty", "error");
        setImporting(false);
        return;
      }

      // Map Excel data to our format with proper type conversion
      const enquiries = jsonData.map((row: any) => ({
        name: String(row.Name || row.name || "").trim(),
        phoneNo: String(
          row["Phone No"] ||
            row["Phone Number"] ||
            row.phoneNo ||
            row.phone ||
            ""
        ).replace(/\D/g, ""),
        email: String(row.Email || row.email || "").trim(),
        aadharNo:
          row["Aadhar No"] || row.aadharNo || row.aadhar
            ? String(row["Aadhar No"] || row.aadharNo || row.aadhar).replace(
                /\D/g,
                ""
              )
            : "",
        panNo:
          row["PAN No"] || row.panNo || row.pan
            ? String(row["PAN No"] || row.panNo || row.pan)
                .trim()
                .toUpperCase()
            : "",
      }));

      // Bulk import
      const result = advertisementStorage.addBulkAdvertisementEnquiries(
        enquiries,
        currentUser?.username
      );

      setImportResult(result);

      if (result.success > 0) {
        showToast(`Successfully imported ${result.success} records`, "success");
      }

      if (result.failed > 0) {
        showToast(`Failed to import ${result.failed} records`, "error");
      }
    } catch (error) {
      console.error("Error importing file:", error);
      showToast("Error processing Excel file", "error");
    } finally {
      setImporting(false);
    }
  };
  //   const downloadTemplate = () => {
  //   const template = [
  //      {
  //        Name: "John Doe",
  //        "Phone No": "9876543210",
  //        Email: "john@example.com",
  //        "Aadhar No": "123456789012",
  //        "PAN No": "ABCDE1234F",
  //      },
  //    {
  //        Name: "Jane Smith",
  //       "Phone No": "9876543211",
  //      Email: "jane@example.com",
  //       "Aadhar No": "",
  //       "PAN No": "",
  //     },
  //     ];

  //     const ws = XLSX.utils.json_to_sheet(template);
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, "Advertisement Enquiries");
  //     XLSX.writeFile(wb, "advertisement-template.xlsx");
  //     showToast("Template downloaded successfully", "success");
  //   };

  const clearFile = () => {
    setFile(null);
    setImportResult(null);
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Upload className="w-8 h-8 text-green-600" />
            Import Advertisement Enquiries
          </h1>
          <p className="text-gray-600 mt-2">
            Upload Excel file to import advertisement enquiry data in bulk
          </p>
        </div>
        {/* Info Card
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Excel File Requirements
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>
                    <strong>Mandatory Columns:</strong> Name, Phone No, Email
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>
                    <strong>Optional Columns:</strong> Aadhar No, PAN No
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Phone number must be 10 digits starting with 6-9</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Valid email format required</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>Aadhar: 12 digits, PAN: Format ABCDE1234F</span>
                </li>
              </ul>
            </div>
          </div>
        </div> */}
        {/* Download Template Button
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            <FileDown size={20} />
            Download Excel Template
          </button>
        </div> */}
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-green-500 transition-all duration-300">
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {file ? file.name : "Choose Excel File"}
              </h3>
              <p className="text-gray-600 mb-4">
                Click to browse or drag and drop your file here
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: .xlsx, .xls
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-6 flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Import Data
                </>
              )}
            </button>
          </div>
        </div>
        {/* Import Results */}
        {importResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              Import Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-6 bg-green-50 rounded-xl border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Successfully Imported
                    </p>
                    <p className="text-3xl font-bold text-green-700 mt-1">
                      {importResult.success}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="p-6 bg-red-50 rounded-xl border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">
                      Failed to Import
                    </p>
                    <p className="text-3xl font-bold text-red-700 mt-1">
                      {importResult.failed}
                    </p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Error Details ({importResult.errors.length})
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {importResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg text-sm text-red-700 border border-red-200"
                    >
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Toast Component
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
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-in ${
        type === "success"
          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
          : "bg-gradient-to-r from-red-600 to-pink-600 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <XCircle size={16} />
      </button>
    </div>
  );
};

export default ImportAdvertisement;
