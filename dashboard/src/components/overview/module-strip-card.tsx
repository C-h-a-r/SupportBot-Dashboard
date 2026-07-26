import { Link } from "react-router-dom";
import {
  ArrowRight01Icon,
  Link01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type ModuleStatus = "todo" | "progress" | "done";

const statusStyles: Record<
  ModuleStatus,
  { dot: string; badge: string; label: string }
> = {
  todo: {
    dot: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-400",
    label: "Needs setup",
  },
  progress: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-400",
    label: "In progress",
  },
  done: {
    dot: "bg-sky-400",
    badge: "bg-sky-500/15 text-sky-400",
    label: "Active",
  },
};

interface ModuleStripCardProps {
  title: string;
  subtitle: string;
  icon: IconSvgElement;
  href: string;
  status: ModuleStatus;
  meta?: string;
}

export function ModuleStripCard({
  title,
  subtitle,
  icon,
  href,
  status,
  meta = "Open in dashboard",
}: ModuleStripCardProps) {
  const s = statusStyles[status];

  return (
    <Link
      to={href}
      className={cn(
        "group flex min-w-[280px] flex-1 flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition-colors",
        "hover:border-primary hover:bg-secondary",
        "sm:min-w-[300px] lg:min-w-0",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", s.dot)} />
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>

      <div>
        <h3 className="font-semibold leading-snug tracking-tight">{title}</h3>
        <span
          className={cn(
            "mt-2 inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
            s.badge,
          )}
        >
          {s.label}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon icon={icon} size={16} />
          </div>
          <span className="text-xs text-muted-foreground">{meta}</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon icon={Link01Icon} size={14} className="opacity-60" />
          <Icon
            icon={Settings02Icon}
            size={14}
            className="opacity-60 group-hover:text-primary"
          />
          <Icon
            icon={ArrowRight01Icon}
            size={14}
            className="text-primary opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
      </div>
    </Link>
  );
}
