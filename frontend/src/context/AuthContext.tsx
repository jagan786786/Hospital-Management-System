import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

type User = {
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (accessToken: string, refreshToken: string, role: string) => void;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Attach accessToken to axios
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Refresh token on first load
  useEffect(() => {
    const init = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
        localStorage.setItem("accessToken", response.data.accessToken);
        setUser({ role: localStorage.getItem("role") || "guest" });
      } catch (err) {
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (accessToken: string, refreshToken: string, role: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);
    setUser({ role });
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axios.post(`${API_URL}/auth/logout`, { token: refreshToken });
      }
    } catch (err) {
      console.error("Logout error", err);
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
