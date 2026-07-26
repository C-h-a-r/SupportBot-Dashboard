import { Link } from "react-router-dom";
import {
  AlertCircleIcon,
  InformationCircleIcon,
  Logout03Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  SEVERITY_STYLES,
  type DashboardAlertPayload,
  type DashboardAlertRenderContext,
  type DashboardAlertSeverity,
} from "@/lib/dashboard-alerts";

function severityIcon(severity: DashboardAlertSeverity) {
  if (severity === "info") return InformationCircleIcon;
  return AlertCircleIcon;
}

interface DashboardAlertCardProps {
  alert: DashboardAlertPayload;
  context: DashboardAlertRenderContext;
}

export function DashboardAlertCard({ alert, context }: DashboardAlertCardProps) {
  const styles = SEVERITY_STYLES[alert.severity];
  const extraGuilds = alert.meta?.extraGuilds ?? [];
  const guildStatus = alert.meta?.status;
  const moduleProgress = alert.meta?.progress;

  return (
    <Alert
      variant="destructive"
      className={`${styles.border} ${styles.bg} text-foreground`}
    >
      <Icon icon={severityIcon(alert.severity)} size={18} className={styles.icon} />
      <AlertTitle className={styles.title}>{alert.title}</AlertTitle>
      <AlertDescription className="space-y-3 text-sm text-muted-foreground">
        <p>{alert.message}</p>

        {alert.category === "guild" && guildStatus === "missing_config" ? (
          <p>
            Open{" "}
            <Link
              to="/configs?file=supportbot"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Bot config
            </Link>{" "}
            and set <strong className="text-foreground">Server (guild) ID</strong>{" "}
            (enable Developer Mode in Discord, then right-click your server → Copy
            Server ID).
          </p>
        ) : null}

        {alert.category === "modules" && moduleProgress ? (
          <p className="text-xs">
            Progress: <span className="text-foreground">{moduleProgress}</span>
          </p>
        ) : null}

        {extraGuilds.length > 0 ? (
          <ul className="space-y-2">
            {extraGuilds.map((g) => (
              <li
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-3 py-2"
              >
                <span>
                  <span className="font-medium text-foreground">{g.name}</span>
                  <span className="ml-2 font-mono text-xs">{g.id}</span>
                </span>
                {context.canLeaveGuild ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={context.leavingGuildId === g.id}
                    onClick={() => void context.onLeaveGuild(g.id)}
                  >
                    <Icon icon={Logout03Icon} size={14} className="mr-1.5" />
                    {context.leavingGuildId === g.id ? "Leaving…" : "Leave server"}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}

        {context.actionError ? (
          <p className="text-destructive">{context.actionError}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {alert.action ? (
            <Button asChild size="sm" variant="secondary">
              <Link to={alert.action.href}>{alert.action.label}</Link>
            </Button>
          ) : null}
          {alert.category === "guild" ? (
            <p className="text-xs">
              The dashboard stays online while you fix this. Some features may be
              limited until setup is complete.
            </p>
          ) : null}
        </div>
      </AlertDescription>
    </Alert>
  );
}
