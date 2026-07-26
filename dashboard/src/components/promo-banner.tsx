import { Link } from "react-router-dom";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { useBotStats } from "@/context/BotStatsContext";

export function PromoBanner() {
  const { stats } = useBotStats();
  const version = stats?.bot.version ?? "26.1.1";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-lg space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon={SparklesIcon} size={16} />
            <span>SupportBot {version}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Manage tickets, configs & transcripts
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Configure your bot from one place. Edit settings visually, review
            ticket transcripts, and monitor live stats.
          </p>
          <Button asChild variant="secondary" className="mt-2">
            <Link to="/configs">Open settings</Link>
          </Button>
        </div>

        <div className="hidden shrink-0 md:block">
          <div className="flex size-36 items-center justify-center rounded-2xl border border-border bg-secondary text-6xl">
            🤖
          </div>
        </div>
      </div>
    </div>
  );
}
