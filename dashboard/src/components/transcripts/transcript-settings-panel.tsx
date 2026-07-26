import { useCallback, useEffect, useState } from "react";
import { FloppyDiskIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { api } from "@/api/client";
import { Icon } from "@/components/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface TranscriptSettingsState {
  autoDelete: { enabled: boolean; afterDays: number };
  publicAccess: { enabled: boolean };
}

function canManageTranscripts(role: string | undefined, hasTranscripts: boolean) {
  return hasTranscripts && role !== "viewer";
}

export function TranscriptSettingsPanel() {
  const { user, hasPermission } = useAuth();
  const readOnly = !canManageTranscripts(user?.role, hasPermission("transcripts"));

  const [settings, setSettings] = useState<TranscriptSettingsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.getTranscriptSettings();
      const data = res.data;
      if (data) {
        setSettings({
          autoDelete: {
            enabled: Boolean(data.autoDelete?.enabled),
            afterDays: data.autoDelete?.afterDays ?? 30,
          },
          publicAccess: {
            enabled: Boolean(data.publicAccess?.enabled),
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!settings || readOnly) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await api.updateTranscriptSettings(settings);
      if (res.data) {
        setSettings({
          autoDelete: {
            enabled: res.data.autoDelete.enabled,
            afterDays: res.data.autoDelete.afterDays,
          },
          publicAccess: {
            enabled: res.data.publicAccess.enabled,
          },
        });
      }
      setMessage(res.message ?? "Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handlePurge() {
    if (readOnly) return;
    setPurging(true);
    setError("");
    setMessage("");
    try {
      const res = await api.purgeTranscripts();
      setMessage(
        res.message ??
          (res.data?.skipped
            ? "Auto-delete is disabled."
            : `Removed ${res.data?.deleted ?? 0} transcript(s).`),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purge failed");
    } finally {
      setPurging(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Could not load transcript settings.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {readOnly ? (
        <Alert>
          <AlertDescription>
            You have view-only access. An admin or editor can change these settings.
          </AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Auto-delete</CardTitle>
          <CardDescription>
            Remove transcript files automatically after they reach a certain age. The
            server checks hourly and whenever you open the library.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-border accent-primary"
              checked={settings.autoDelete.enabled}
              disabled={readOnly}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        autoDelete: { ...s.autoDelete, enabled: e.target.checked },
                      }
                    : s,
                )
              }
            />
            <span className="text-sm">
              <span className="font-medium">Enable auto-delete</span>
              <span className="mt-0.5 block text-muted-foreground">
                Deletes HTML files in Data/Transcripts based on last modified time.
              </span>
            </span>
          </label>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="transcript-after-days">
              Delete after (days)
            </label>
            <Input
              id="transcript-after-days"
              type="number"
              min={1}
              max={3650}
              disabled={readOnly || !settings.autoDelete.enabled}
              value={settings.autoDelete.afterDays}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        autoDelete: {
                          ...s.autoDelete,
                          afterDays: Math.min(
                            3650,
                            Math.max(1, parseInt(e.target.value, 10) || 1),
                          ),
                        },
                      }
                    : s,
                )
              }
              className="max-w-[8rem]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={readOnly || purging}
            onClick={() => void handlePurge()}
          >
            <Icon icon={RefreshIcon} size={16} className={cn(purging && "animate-spin")} />
            Run cleanup now
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Public transcripts</CardTitle>
          <CardDescription>
            When enabled, anyone with the link can view a transcript at{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {typeof window !== "undefined"
                ? `${window.location.origin}/transcripts/:id`
                : "/transcripts/:id"}
            </code>{" "}
            without signing in. Channel IDs are numeric but not secret—only enable if
            you are comfortable sharing links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 size-4 rounded border-border accent-primary"
              checked={settings.publicAccess.enabled}
              disabled={readOnly}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        publicAccess: { enabled: e.target.checked },
                      }
                    : s,
                )
              }
            />
            <span className="text-sm">
              <span className="font-medium">Allow public transcript URLs</span>
              <span className="mt-0.5 block text-muted-foreground">
                Dashboard preview and download still require login.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {!readOnly ? (
        <Button type="button" disabled={saving} onClick={() => void handleSave()}>
          <Icon icon={FloppyDiskIcon} size={16} />
          {saving ? "Saving…" : "Save settings"}
        </Button>
      ) : null}
    </div>
  );
}
