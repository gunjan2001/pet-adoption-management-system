// src/lib/api/auth.api.ts
import type { AuthResponse, LoginInput, RegisterInput, User } from "@/types";
import api from "./httpClient";

export const authApi = {
  /** Register a new user — returns token + user */
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      return res.data;
    } catch (error) {
      console.error("Register API error:", error);
      throw error; // Re-throw to let caller handle
    }
  },

  /** Login — returns token + user */
  login: async (data: LoginInput): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      return res.data;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },

  googleAuth: async (credential: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/google", { credential });
    return data;
  },

  /** Get the currently logged-in user's profile */
  getProfile: async (): Promise<User> => {
    try {
      const res = await api.get<{ success: true; user: User }>("/auth/me");
      return res.data.user;
    } catch (error) {
      console.error("Get profile API error:", error);
      throw error;
    }
  },

  /** Update the current user's profile */
  updateProfile: async (
    data: Partial<Pick<User, "name" | "phone" | "address">>
  ): Promise<User> => {
    try {
      const res = await api.patch<{ success: true; user: User }>("/auth/me", data);
      return res.data.user;
    } catch (error) {
      console.error("Update profile API error:", error);
      throw error;
    }
  },
};
