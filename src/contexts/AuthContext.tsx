import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  email?: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isActive: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: () => boolean;
  canDelete: () => boolean;
  canEdit: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = "ems_users";
const CURRENT_USER_KEY = "ems_current_user";

const initializeDefaultUser = () => {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  if (!users) {
    const defaultAdmin: User = {
      id: "admin-001",
      username: "admin",
      password: "admin123",
      fullName: "System Administrator",
      email: "admin@example.com",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]));
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDefaultUser();

    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    try {
      const usersData = localStorage.getItem(USERS_STORAGE_KEY);
      if (!usersData) return false;

      const users: User[] = JSON.parse(usersData);
      const user = users.find(
        (u) =>
          u.username === username &&
          u.password === password &&
          u.isActive === true
      );

      if (user) {
        setCurrentUser(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        console.log("Login successful:", user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const isAdmin = () => {
    return currentUser?.role === "admin";
  };

  const canDelete = () => {
    return currentUser?.role === "admin";
  };

  const canEdit = () => {
    return currentUser !== null;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAdmin,
        canDelete,
        canEdit,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const authUtils = {
  getAllUsers: (): User[] => {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  },

  addUser: (userData: Omit<User, "id" | "createdAt" | "updatedAt">): User => {
    const users = authUtils.getAllUsers();
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  updateUser: (id: string, updates: Partial<User>): boolean => {
    try {
      const users = authUtils.getAllUsers();
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return false;

      users[index] = {
        ...users[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      const currentUser = localStorage.getItem(CURRENT_USER_KEY);
      if (currentUser) {
        const parsedUser = JSON.parse(currentUser);
        if (parsedUser.id === id) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[index]));
        }
      }

      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  },

  deleteUser: (id: string): boolean => {
    try {
      const users = authUtils.getAllUsers();
      const filteredUsers = users.filter((u) => u.id !== id);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  },

  usernameExists: (username: string, excludeId?: string): boolean => {
    const users = authUtils.getAllUsers();
    return users.some(
      (u) => u.username === username && u.id !== excludeId && u.isActive
    );
  },
};
