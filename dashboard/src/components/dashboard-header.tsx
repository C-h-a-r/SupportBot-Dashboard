import {
  ArrowDown01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { DashboardSearch } from "@/components/dashboard-search";
import { useBotStats } from "@/context/BotStatsContext";
import { Icon } from "@/components/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { displayDiscordName, useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
  const { stats } = useBotStats();
  const { user, logout } = useAuth();
  const botName = stats?.bot.username ?? "SupportBot";
  const accountName = user ? displayDiscordName(user) : botName;
  const accountAvatar = user?.avatar ?? stats?.bot.avatar;
  const inviteUrl = stats?.bot.inviteUrl;
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground md:hidden" />

      <p className="hidden shrink-0 text-sm font-medium text-muted-foreground lg:block">
        {dateLabel}
      </p>

      <DashboardSearch className="min-w-0 flex-1" />

      <div className="ml-auto flex items-center gap-2">
        {inviteUrl ? (
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-9 text-muted-foreground sm:inline-flex"
            asChild
          >
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Invite bot to a server"
              title="Invite bot to a server"
            >
              <Icon icon={PlusSignIcon} size={18} />
            </a>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="hidden size-9 text-muted-foreground sm:inline-flex"
            disabled
            aria-label="Invite bot to a server"
            title="Invite link available when the bot is online"
          >
            <Icon icon={PlusSignIcon} size={18} />
          </Button>
        )}
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 rounded-full px-2 hover:bg-secondary"
            >
              <Avatar className="size-7">
                <AvatarImage src={accountAvatar} alt={accountName} />
                <AvatarFallback className="bg-primary/20 text-xs text-primary">
                  {accountName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[100px] truncate text-sm font-medium sm:inline">
                {accountName}
              </span>
              <Icon icon={ArrowDown01Icon} size={16} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user ? (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {user.username}
                {user.id ? ` · ${user.id}` : ""}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onClick={() => {
                void logout();
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
