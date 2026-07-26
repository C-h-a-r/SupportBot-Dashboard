import { Link } from "react-router-dom";
import {
  ArrowRight01Icon,
  Download04Icon,
  Rocket01Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import type { BotStats } from "@/api/client";
import { formatUptime } from "@/api/client";
import { Icon } from "@/components/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewAsideProps {
  stats: BotStats;
}

export function OverviewAside({ stats }: OverviewAsideProps) {
  const activity = [
    {
      id: "ping",
      label: "Gateway latency",
      detail: `${stats.bot.ping}ms`,
      badge: stats.bot.ping < 200 ? "Good" : "High",
      badgeClass:
        stats.bot.ping < 200
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-amber-500/15 text-amber-400",
    },
    {
      id: "uptime",
      label: "Bot uptime",
      detail: formatUptime(stats.bot.uptime),
      badge: "Live",
      badgeClass: "bg-primary/20 text-primary",
    },
    {
      id: "ram",
      label: "Memory usage",
      detail: `${stats.hosting.ram_used} / ${stats.hosting.ram_total}`,
      badge: `${stats.hosting.ram_percent}%`,
      badgeClass: "bg-sky-500/15 text-sky-400",
    },
  ];

  return (
    <aside className="hidden w-[min(100%,320px)] shrink-0 space-y-4 xl:block">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold">
            Connected servers ({stats.servers})
          </CardTitle>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
            <span className="text-lg leading-none">+</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(6, stats.servers) }).map((_, i) => (
              <Avatar
                key={i}
                className="size-9 border-2 border-card ring-0"
              >
                <AvatarImage src={stats.bot.avatar} alt="" />
                <AvatarFallback className="bg-primary/25 text-[10px] text-primary">
                  {String(i + 1)}
                </AvatarFallback>
              </Avatar>
            ))}
            {stats.servers > 6 ? (
              <div className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-medium text-muted-foreground">
                +{stats.servers - 6}
              </div>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {stats.users.toLocaleString()} members across your guilds
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border bg-secondary">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Icon icon={Rocket01Icon} size={22} />
            </div>
            <div>
              <p className="font-semibold">Keep SupportBot up to date</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Check for releases and install updates from settings.
              </p>
            </div>
            <Button asChild size="sm" className="w-full">
              <Link to="/settings">
                <Icon icon={Download04Icon} size={16} className="mr-2" />
                Open settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">System activity</CardTitle>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
            <span className="text-base leading-none">⋯</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-1 p-0 pb-2">
          {activity.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-secondary/40"
            >
              <Avatar className="size-9">
                <AvatarImage src={stats.bot.avatar} alt={stats.bot.username} />
                <AvatarFallback className="bg-secondary text-xs">
                  SB
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.detail}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.badgeClass}`}
              >
                {item.badge}
              </span>
            </div>
          ))}
          <Button
            asChild
            variant="ghost"
            className="mx-2 mt-1 w-[calc(100%-1rem)] justify-between text-xs text-muted-foreground"
          >
            <Link to="/system">
              All system details
              <Icon icon={ArrowRight01Icon} size={14} />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
            <Icon icon={Settings02Icon} size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">v{stats.bot.version}</p>
            <p className="text-xs text-muted-foreground">CPU {stats.hosting.cpu_load}</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
