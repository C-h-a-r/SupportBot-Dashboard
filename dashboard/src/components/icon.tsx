import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: IconSvgElement;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function Icon({
  icon,
  className,
  size = 18,
  strokeWidth = 1.75,
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      className={cn("shrink-0", className)}
      strokeWidth={strokeWidth}
    />
  );
}
