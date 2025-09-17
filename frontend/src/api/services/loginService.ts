import api from "../axios"; // your Axios instance
import { LoginPayload, LoginResponse } from "@/types/auth";

// Login
export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
};

// Refresh token
export const refreshToken = async (token: string): Promise<{ accessToken: string }> => {
  const response = await api.post<{ accessToken: string }>("/auth/refresh", { token });
  return response.data;
};

// Logout
export const logoutUser = async (token: string) => {
  const response = await api.post("/auth/logout", { token });
  return response.data;
};
