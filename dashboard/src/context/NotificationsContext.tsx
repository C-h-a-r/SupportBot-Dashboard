import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  type DashboardNotification,
} from "@/api/client";

interface NotificationsContextValue {
  items: DashboardNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      if (res.data) {
        setItems(res.data.items);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      /* ignore when logged out or API down */
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const res = await api.markNotificationsRead("all");
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = useCallback(
    async (id: string) => {
      try {
        const res = await api.dismissNotification(id);
        setItems((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount(res.data?.unreadCount ?? 0);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      refresh,
      markAllRead,
      dismiss,
    }),
    [items, unreadCount, loading, refresh, markAllRead, dismiss],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
