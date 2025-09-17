import React, { createContext, useContext, useState, useEffect } from "react";
import { logoutUser } from "../api/services/loginService";

export type UserType = {
  id: string;
  name: string;
  role: string;
  type: "employee" | "patient";
  avatar?: string;
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  login: (
    accessToken: string,
    refreshToken: string,
    userInfo: UserType
  ) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = (
    accessToken: string,
    refreshToken: string,
    userInfo: UserType
  ) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const logout = async () => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      try {
        await logoutUser(token);
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
