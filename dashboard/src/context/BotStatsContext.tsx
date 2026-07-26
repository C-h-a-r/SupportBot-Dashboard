import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type BotStats } from "@/api/client";

interface BotStatsContextValue {
  stats: BotStats | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

const BotStatsContext = createContext<BotStatsContextValue | null>(null);

export function BotStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await api.stats();
      if (res.data) {
        setStats(res.data);
        setError("");
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const value = useMemo(
    () => ({ stats, loading, error, refresh }),
    [stats, loading, error, refresh],
  );

  return (
    <BotStatsContext.Provider value={value}>{children}</BotStatsContext.Provider>
  );
}

export function useBotStats() {
  const ctx = useContext(BotStatsContext);
  if (!ctx) {
    throw new Error("useBotStats must be used within BotStatsProvider");
  }
  return ctx;
}
