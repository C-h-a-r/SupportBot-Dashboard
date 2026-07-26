import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import {
  dashboardAlertBuilder,
  type DashboardAlertPayload,
} from "@/lib/dashboard-alerts";
import { DashboardAlertCard } from "./dashboard-alert-card";

const REFRESH_MS = 15_000;

export function DashboardAlerts() {
  const { hasPermission } = useAuth();
  const canLeave = hasPermission("settings.update");
  const [alerts, setAlerts] = useState<DashboardAlertPayload[]>([]);
  const [leavingGuildId, setLeavingGuildId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const next = await dashboardAlertBuilder.loadAll();
      setAlerts(next);
      setActionError("");
    } catch {
      /* ignore — banners are best-effort */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  async function leaveGuild(guildId: string) {
    if (!canLeave) return;
    setLeavingGuildId(guildId);
    setActionError("");
    try {
      await api.leaveGuild(guildId);
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not leave server");
    } finally {
      setLeavingGuildId(null);
    }
  }

  if (alerts.length === 0) return null;

  const renderContext = {
    canLeaveGuild: canLeave,
    onLeaveGuild: leaveGuild,
    leavingGuildId,
    actionError,
  };

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <DashboardAlertCard key={alert.id} alert={alert} context={renderContext} />
      ))}
    </div>
  );
}
