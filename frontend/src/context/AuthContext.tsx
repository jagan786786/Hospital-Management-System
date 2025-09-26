// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type RoleType = {
  role?: string;
  role_name?: string;
};

type EmployeeType = {
  primary_role_type: RoleType;
  secondary_role_type: RoleType[];
};

type UserType = {
  id: string;
  name: string;
  roles: string; // must match backend
  type: string; // employee | patient
  employee_type?: EmployeeType; // ✅ add it
};

type AuthContextType = {
  user: UserType | null;
  loading: boolean;
  login: (
    accessToken: string,
    refreshToken: string,
    userInfo: UserType
  ) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log(
      "AuthProvider: Loaded user from localStorage:",
      JSON.parse(storedUser)
    );
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, rawUser: any) => {
    // ✅ Normalize user to UserType
    const transformedUser: UserType = {
      id: rawUser._id ?? rawUser.id,
      name: rawUser.name,
      type: rawUser.type,
      roles: rawUser.roles?.primary_role_type?.role_name ?? "User",
    };

    // ✅ Store tokens + user
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(transformedUser));

    // ✅ Update context state
    setUser(transformedUser);
  };

  const logout = () => {
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
