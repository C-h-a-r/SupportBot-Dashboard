import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api/client";
import type { SetupStatus } from "@/lib/setup-types";

interface SetupContextValue {
  status: SetupStatus | null;
  loading: boolean;
  error: string;
  complete: boolean;
  refresh: () => Promise<void>;
}

const SetupContext = createContext<SetupContextValue | null>(null);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const res = await api.getSetupStatus();
      setStatus(res.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load setup status");
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const value = useMemo(
    () => ({
      status,
      loading,
      error,
      complete: Boolean(status?.complete),
      refresh,
    }),
    [status, loading, error, refresh],
  );

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
}

export function useSetup() {
  const ctx = useContext(SetupContext);
  if (!ctx) throw new Error("useSetup must be used within SetupProvider");
  return ctx;
}
