import { HashRouter, Routes, Route, Navigate } from "react-router-dom"; // ✅ Changed BrowserRouter to HashRouter
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddEnquiry from "./pages/AddEnquiry";
import ViewEnquiry from "./pages/ViewEnquiry";
import SearchEnquiry from "./pages/SearchEnquiry";
import TodayFollowUps from "./pages/TodaysFollowUps";
import AllFollowUps from "./pages/AllFollowUps";
import UserManagement from "./pages/UserManagement";
import ImportAdvertisement from "./pages/ImportAdvertisement";
import AdvertisementEnquiries from "./pages/AdvertisementEnquiries";
import SearchAdvertisementEnquiry from "./pages/SearchAdvertisementEnquiry";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider, useSidebar } from "./contexts/SidebarContext";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <HashRouter>
          {" "}
          {/* ✅ Changed from BrowserRouter */}
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route
                path="/add-enquiry"
                element={
                  <AppLayout>
                    <AddEnquiry />
                  </AppLayout>
                }
              />
              <Route
                path="/view-enquiry"
                element={
                  <AppLayout>
                    <ViewEnquiry />
                  </AppLayout>
                }
              />
              <Route
                path="/search-enquiry"
                element={
                  <AppLayout>
                    <SearchEnquiry />
                  </AppLayout>
                }
              />
              <Route
                path="/today-followups"
                element={
                  <AppLayout>
                    <TodayFollowUps />
                  </AppLayout>
                }
              />
              <Route
                path="/all-followups"
                element={
                  <AppLayout>
                    <AllFollowUps />
                  </AppLayout>
                }
              />
              <Route
                path="/user-management"
                element={
                  <AppLayout>
                    <UserManagement />
                  </AppLayout>
                }
              />
              {/* Advertisement Routes */}
              <Route
                path="/import-advertisement"
                element={
                  <AppLayout>
                    <ImportAdvertisement />
                  </AppLayout>
                }
              />
              <Route
                path="/advertisement-enquiries"
                element={
                  <AppLayout>
                    <AdvertisementEnquiries />
                  </AppLayout>
                }
              />
              <Route
                path="/search-advertisement"
                element={
                  <AppLayout>
                    <SearchAdvertisementEnquiry />
                  </AppLayout>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>{" "}
        {/* ✅ Changed from BrowserRouter */}
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
