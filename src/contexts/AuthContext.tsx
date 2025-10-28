import React, { createContext, useContext, useState, useEffect } from "react";

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
  isLoading: boolean; // ✅ Added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_current_user";
const USERS_STORAGE_KEY = "auth_users";

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
  getAllUsers: (): User[] => {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      if (!users) {
        // Initialize with default admin
        const defaultUsers = [DEFAULT_ADMIN];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
      return JSON.parse(users);
    } catch (error) {
      console.error("Error reading users:", error);
      return [DEFAULT_ADMIN];
    }
  },

  // Save users
  saveUsers: (users: User[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  // Find user by username
  findUserByUsername: (username: string): User | null => {
    const users = authUtils.getAllUsers();
    return users.find((u) => u.username === username && u.isActive) || null;
  },

  // Validate credentials
  validateCredentials: (username: string, password: string): User | null => {
    const user = authUtils.findUserByUsername(username);
    if (user && user.password === password && user.isActive) {
      return user;
    }
    return null;
  },

  // Add new user
  addUser: (userData: Omit<User, "id" | "createdAt">): User => {
    const users = authUtils.getAllUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    authUtils.saveUsers(users);
    return newUser;
  },

  // Update user
  updateUser: (id: string, updates: Partial<User>): boolean => {
    const users = authUtils.getAllUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    users[index] = { ...users[index], ...updates };
    authUtils.saveUsers(users);
    return true;
  },

  // Delete user
  deleteUser: (id: string): boolean => {
    const users = authUtils.getAllUsers();
    const filteredUsers = users.filter((u) => u.id !== id);
    if (filteredUsers.length === users.length) return false;
    authUtils.saveUsers(filteredUsers);
    return true;
  },

  // Check if username exists
  usernameExists: (username: string, excludeId?: string): boolean => {
    const users = authUtils.getAllUsers();
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
  const [isLoading, setIsLoading] = useState(true); // ✅ Added loading state

  useEffect(() => {
    // ✅ Check for existing session on mount
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Simulate a small delay to check session (optional, can be removed)
        await new Promise((resolve) => setTimeout(resolve, 300));

        const user = authUtils.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false); // ✅ Set loading to false after check
      }
    };

    initializeAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true); // ✅ Set loading during login

      const user = authUtils.validateCredentials(username, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        authUtils.setCurrentUser(user);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false); // ✅ Clear loading after login attempt
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
        isLoading, // ✅ Export isLoading
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
