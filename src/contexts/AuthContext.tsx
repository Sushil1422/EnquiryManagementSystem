import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../utils/database";

export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "user";
  fullName: string;
  email?: string;
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  canDelete: () => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_current_user";

// Default admin credentials
const DEFAULT_ADMIN: User = {
  id: "admin-001",
  username: "admin",
  password: "admin123", // In production, this should be hashed
  role: "admin",
  fullName: "System Administrator",
  email: "admin@example.com",
  createdAt: new Date().toISOString(),
  isActive: true,
};

export const authUtils = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const users = await db.users.getAll();

      // If no users exist, create default admin
      if (!users || users.length === 0) {
        await db.users.add(DEFAULT_ADMIN);
        return [DEFAULT_ADMIN];
      }

      // Convert isActive from number to boolean for SQLite compatibility
      return users.map((u: any) => ({
        ...u,
        isActive: Boolean(u.isActive),
      }));
    } catch (error) {
      console.error("Error reading users:", error);
      // Fallback to localStorage for web version
      try {
        const usersStr = localStorage.getItem("auth_users");
        if (usersStr) {
          return JSON.parse(usersStr);
        }
      } catch (e) {
        console.error("Fallback to localStorage failed:", e);
      }
      return [DEFAULT_ADMIN];
    }
  },

  // Find user by username
  findUserByUsername: async (username: string): Promise<User | null> => {
    const users = await authUtils.getAllUsers();
    return users.find((u) => u.username === username && u.isActive) || null;
  },

  // Validate credentials
  validateCredentials: async (
    username: string,
    password: string
  ): Promise<User | null> => {
    const user = await authUtils.findUserByUsername(username);
    if (user && user.password === password && user.isActive) {
      return user;
    }
    return null;
  },

  // Add new user
  addUser: async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await db.users.add(newUser);
      if (result.success) {
        return newUser;
      }
      throw new Error(result.error || "Failed to add user");
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const result = await db.users.update(id, updates);
      return result.success;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  },

  // Delete user (soft delete by setting isActive to false)
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      const result = await db.users.delete(id);
      return result.success;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  },

  // Check if username exists
  usernameExists: async (
    username: string,
    excludeId?: string
  ): Promise<boolean> => {
    const users = await authUtils.getAllUsers();
    return users.some(
      (u) => u.username === username && (!excludeId || u.id !== excludeId)
    );
  },

  // Get current user from session
  getCurrentUser: (): User | null => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Save current user to session
  setCurrentUser: (user: User | null): void => {
    if (user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },

  // Check if user has delete permission
  canDelete: (user: User | null): boolean => {
    return user?.role === "admin";
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check session storage first (faster)
        const sessionUser = authUtils.getCurrentUser();
        if (sessionUser) {
          // Verify user still exists and is active in database
          const dbUser = await authUtils.findUserByUsername(
            sessionUser.username
          );
          if (
            dbUser &&
            dbUser.isActive &&
            dbUser.password === sessionUser.password
          ) {
            setCurrentUser(dbUser);
            setIsAuthenticated(true);
            // Update session with latest user data
            authUtils.setCurrentUser(dbUser);
          } else {
            // User no longer valid, clear session
            authUtils.setCurrentUser(null);
          }
        }

        // Ensure default admin exists
        await authUtils.getAllUsers();
      } catch (error) {
        console.error("Error initializing auth:", error);
        authUtils.setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const user = await authUtils.validateCredentials(username, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        authUtils.setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    authUtils.setCurrentUser(null);
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === "admin";
  };

  const canDelete = (): boolean => {
    return currentUser?.role === "admin";
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAdmin,
        canDelete,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
