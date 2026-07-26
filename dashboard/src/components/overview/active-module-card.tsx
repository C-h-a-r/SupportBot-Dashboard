import { Link } from "react-router-dom";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { ModuleStatus } from "@/components/overview/module-strip-card";

const BADGE_CLASS: Record<ModuleStatus, string> = {
  todo: "bg-rose-500/15 text-rose-400",
  progress: "bg-amber-500/15 text-amber-400",
  done: "bg-emerald-500/15 text-emerald-400",
};

interface ActiveModuleCardProps {
  title: string;
  icon: IconSvgElement;
  href: string;
  badge?: string;
  status?: ModuleStatus;
}

export function ActiveModuleCard({
  title,
  icon,
  href,
  badge = "Configured",
  status = "done",
}: ActiveModuleCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors",
        "hover:border-primary hover:bg-secondary",
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon icon={icon} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        <span
          className={cn(
            "mt-1 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold",
            BADGE_CLASS[status],
          )}
        >
          {badge}
        </span>
      </div>
    </Link>
  );
}
