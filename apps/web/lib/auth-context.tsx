"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "./api";

export interface User {
  username?: string;
  sub?: string;
  email?: string;
  name?: string;
  email_verified?: string;
  [attribute: string]: string | undefined;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const me = await api.get<User>("/auth/me");
      setUser(me);
      return me;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          await api.post("/auth/refresh", {});
          const me = await api.get<User>("/auth/me");
          setUser(me);
          return me;
        } catch {
          setUser(null);
          return null;
        }
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshUser();
    })();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
