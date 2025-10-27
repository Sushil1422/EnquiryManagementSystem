import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { currentUser, isLoading } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Debug log
  console.log("ProtectedRoute - currentUser:", currentUser);

  // If not logged in, redirect to login
  if (!currentUser) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
