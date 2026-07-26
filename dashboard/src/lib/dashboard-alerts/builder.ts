import { api } from "@/api/client";
import type {
  ClientAlertProvider,
  DashboardAlertPayload,
  DashboardAlertSeverity,
} from "./types";

const SEVERITY_ORDER: Record<DashboardAlertSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
};

function sortAlerts(alerts: DashboardAlertPayload[]) {
  return [...alerts].sort((a, b) => {
    const sa = SEVERITY_ORDER[a.severity] ?? 9;
    const sb = SEVERITY_ORDER[b.severity] ?? 9;
    if (sa !== sb) return sa - sb;
    return a.title.localeCompare(b.title);
  });
}

function dedupeAlerts(alerts: DashboardAlertPayload[]) {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    if (seen.has(alert.id)) return false;
    seen.add(alert.id);
    return true;
  });
}

/**
 * Client-side alert registry. Server alerts come from GET /api/alerts;
 * register providers here for browser-only checks (feature flags, UI hints, etc.).
 *
 * Example:
 *   dashboardAlertBuilder.register({
 *     id: "local-hint",
 *     evaluate: () => [{
 *       id: "local:hint",
 *       severity: "info",
 *       category: "local",
 *       title: "Tip",
 *       message: "You can customise accent colour in Settings.",
 *     }],
 *   });
 */
class DashboardAlertBuilder {
  private clientProviders = new Map<string, ClientAlertProvider>();

  register(provider: ClientAlertProvider) {
    this.clientProviders.set(provider.id, provider);
    return this;
  }

  unregister(id: string) {
    this.clientProviders.delete(id);
  }

  private async evaluateClientProviders() {
    const alerts: DashboardAlertPayload[] = [];
    for (const provider of this.clientProviders.values()) {
      const result = await provider.evaluate();
      if (Array.isArray(result) && result.length) {
        alerts.push(...result);
      }
    }
    return alerts;
  }

  async loadAll(): Promise<DashboardAlertPayload[]> {
    const [serverRes, clientAlerts] = await Promise.all([
      api.getAlerts().catch(() => ({ data: [] as DashboardAlertPayload[] })),
      this.evaluateClientProviders(),
    ]);

    const serverAlerts = serverRes.data ?? [];
    return sortAlerts(dedupeAlerts([...serverAlerts, ...clientAlerts]));
  }
}

export const dashboardAlertBuilder = new DashboardAlertBuilder();
