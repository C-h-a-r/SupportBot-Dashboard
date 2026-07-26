import type { ModuleStatus } from "@/components/overview/module-strip-card";

export interface ModuleStatusInfo {
  status: ModuleStatus;
  subtitle: string;
  passed?: number;
  total?: number;
}

export const STATUS_BADGE: Record<ModuleStatus, string> = {
  todo: "Needs setup",
  progress: "In progress",
  done: "Active",
};

export function getPluginModuleMeta(
  pluginId: string,
  modules?: Record<string, ModuleStatusInfo>,
  fallbackSubtitle = "Configure module",
): ModuleStatusInfo {
  const info = modules?.[pluginId];
  if (info) return info;
  return {
    status: "todo",
    subtitle: fallbackSubtitle,
  };
}
