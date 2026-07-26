import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Cancel01Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";
import { useNotifications } from "@/context/NotificationsContext";
import { Icon } from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DashboardNotification } from "@/api/client";
import { cn } from "@/lib/utils";

function formatRelativeTime(ts: number) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function typeDotClass(type: DashboardNotification["type"]) {
  switch (type) {
    case "error":
      return "bg-destructive";
    case "update":
      return "bg-amber-500";
    case "bot":
      return "bg-emerald-500";
    default:
      return "bg-primary";
  }
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { items, unreadCount, loading, markAllRead, dismiss, refresh } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      void refresh();
      if (unreadCount > 0) void markAllRead();
    }
  };

  const onSelect = (n: DashboardNotification) => {
    setOpen(false);
    if (n.href) navigate(n.href);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 text-muted-foreground"
          aria-label="Notifications"
        >
          <Icon icon={Notification01Icon} size={18} />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="max-h-[min(360px,50vh)]">
          {loading && items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet. Bot restarts and update checks will appear
              here.
            </p>
          ) : (
            <ul className="py-1">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "group flex gap-2 border-b border-border/40 px-3 py-2.5 last:border-0",
                    !n.read && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      typeDotClass(n.type),
                    )}
                  />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => onSelect(n)}
                  >
                    <p className="text-sm font-medium leading-tight">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {n.message}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/80">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
                    aria-label="Dismiss"
                    onClick={(e) => {
                      e.stopPropagation();
                      void dismiss(n.id);
                    }}
                  >
                    <Icon icon={Cancel01Icon} size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link to="/settings" onClick={() => setOpen(false)}>
              Open settings (updates)
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
