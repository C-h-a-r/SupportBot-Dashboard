import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/client";
import {
  canEditConfig,
  canViewConfig,
  displayDiscordName,
  hasPermission,
  type DashboardPermissions,
  type DashboardUser,
} from "../lib/permissions";

interface AuthContextValue {
  user: DashboardUser | null;
  permissions: DashboardPermissions | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithDiscord: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  hasPermission: (key: string) => boolean;
  canViewConfig: (file: string) => boolean;
  canEditConfig: (file: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await api.me();
      if (res.data) {
        setUser(res.data);
        return true;
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const loginWithDiscord = useCallback(() => {
    window.location.href = "/api/auth/discord";
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const permissions = user?.permissions ?? null;

  const checkPermission = useCallback(
    (key: string) => hasPermission(permissions, key),
    [permissions],
  );

  const checkViewConfig = useCallback(
    (file: string) => canViewConfig(permissions, file),
    [permissions],
  );

  const checkEditConfig = useCallback(
    (file: string) => canEditConfig(permissions, file),
    [permissions],
  );

  const value = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated: !!user,
      loading,
      loginWithDiscord,
      logout,
      refreshSession,
      hasPermission: checkPermission,
      canViewConfig: checkViewConfig,
      canEditConfig: checkEditConfig,
    }),
    [
      user,
      permissions,
      loading,
      loginWithDiscord,
      logout,
      refreshSession,
      checkPermission,
      checkViewConfig,
      checkEditConfig,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { displayDiscordName };
