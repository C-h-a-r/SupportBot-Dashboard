import { Link } from "react-router-dom";
import type { IconSvgElement } from "@hugeicons/react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface PluginCardProps {
  title: string;
  description: string;
  icon: IconSvgElement;
  href: string;
}

export function PluginCard({
  title,
  description,
  icon,
  href,
}: PluginCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors",
        "hover:border-primary hover:bg-secondary",
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon icon={icon} size={20} />
      </div>
      <h3 className="mb-2 font-semibold tracking-tight">{title}</h3>
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}
