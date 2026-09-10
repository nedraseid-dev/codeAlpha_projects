import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { authApi } from "../api";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const storedUser = localStorage.getItem("user");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    storedUser ? (JSON.parse(storedUser) as User) : null
  );

  const persist = useCallback((token: string, u: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user: u } = await authApi.login(email, password);
      persist(token, u);
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { token, user: u } = await authApi.register(name, email, password);
      persist(token, u);
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
