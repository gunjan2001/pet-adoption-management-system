// src/contexts/AuthContext.tsx
import { TOKEN_KEY, USER_KEY } from "@/const";
import { authApi } from "@/lib/api/auth.api";
import { LoginInput, RegisterInput, User } from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user:            User | null;
  token:           string | null;
  isLoading:       boolean;
  isAuthenticated: boolean;   // ← matches App.tsx usage
  isAdmin:         boolean;
  login:           (data: LoginInput)    => Promise<void>;
  register:        (data: RegisterInput) => Promise<void>;
  logout:          () => void;
  refreshUser:     () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true on first mount

  // ── Persist helpers ────────────────────────────────────────────────────────
  const persistAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ── Rehydrate from localStorage on first render ────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        clearAuth();
      }
    }
    setIsLoading(false);
  }, [clearAuth]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (data: LoginInput) => {
      const res = await authApi.login(data);
      persistAuth(res.token, res.user);
    },
    [persistAuth]
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      const res = await authApi.register(data);
      persistAuth(res.token, res.user);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authApi.getProfile();
      setUser(fresh);
      localStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  // ── Memoized value ─────────────────────────────────────────────────────────
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      isAdmin:         user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
};

export default AuthContext;
