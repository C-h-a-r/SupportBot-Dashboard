import type { ReactNode } from "react";
import type { GuildHealthStatus, GuildSummary } from "@/api/client";

export type DashboardAlertSeverity = "error" | "warning" | "info";

export interface DashboardAlertAction {
  label: string;
  href: string;
}

export interface DashboardAlertGuildMeta {
  status?: GuildHealthStatus;
  configuredGuildId?: string | null;
  configuredGuild?: GuildSummary | null;
  extraGuilds?: GuildSummary[];
}

export interface DashboardAlertModuleMeta {
  moduleId?: string;
  status?: "todo" | "progress" | "done";
  passed?: number;
  total?: number;
  progress?: string | null;
}

export interface DashboardAlertPayload {
  id: string;
  severity: DashboardAlertSeverity;
  category: string;
  title: string;
  message: string;
  action?: DashboardAlertAction;
  meta?: DashboardAlertGuildMeta & DashboardAlertModuleMeta & Record<string, unknown>;
}

export interface DashboardAlertRenderContext {
  canLeaveGuild: boolean;
  onLeaveGuild: (guildId: string) => Promise<void>;
  leavingGuildId: string | null;
  actionError: string;
}

export interface ClientAlertProvider {
  id: string;
  evaluate: () => DashboardAlertPayload[] | Promise<DashboardAlertPayload[]>;
}

export interface DashboardAlertDefinition extends DashboardAlertPayload {
  /** Optional custom body rendered below the message */
  body?: ReactNode;
}

export const SEVERITY_STYLES: Record<
  DashboardAlertSeverity,
  { border: string; bg: string; icon: string; title: string }
> = {
  error: {
    border: "border-destructive/40",
    bg: "bg-destructive/10",
    icon: "text-destructive",
    title: "text-destructive",
  },
  warning: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    icon: "text-amber-500",
    title: "text-amber-200",
  },
  info: {
    border: "border-sky-500/40",
    bg: "bg-sky-500/10",
    icon: "text-sky-400",
    title: "text-sky-100",
  },
};
