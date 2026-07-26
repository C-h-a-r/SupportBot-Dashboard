import { useCallback, useEffect, useState } from "react";
import {
  Download04Icon,
  Loading03Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { api, type UpdateCheckResult } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
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
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_ACCENT_HEX,
  getStoredAccentHex,
  resetAccentTheme,
  saveAccentTheme,
} from "@/lib/accent-theme";
import { normalizeHex } from "@/lib/normalize-hex";
import { DashboardBrandingSettings } from "@/components/settings/dashboard-branding-settings";

export default function Settings() {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("settings.update");
  const [check, setCheck] = useState<UpdateCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [accentHex, setAccentHex] = useState(
    () => getStoredAccentHex() ?? DEFAULT_ACCENT_HEX,
  );
  const [accentSaved, setAccentSaved] = useState("");

  const loadCheck = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.checkForUpdates();
      if (res.data) setCheck(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check for updates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCheck();
  }, [loadCheck]);

  async function handleUpdate() {
    if (!check?.updateAvailable) return;
    setUpdating(true);
    setError("");
    setNotice("");
    try {
      const res = await api.runUpdate(check.latest);
      setNotice(
        res.message ||
          "Update installed. Restart your server (stop and run npm start again) to finish applying changes.",
      );
      await loadCheck();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Application updates and maintenance — config files are edited under each module in the sidebar.
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Dashboard appearance</CardTitle>
          <CardDescription>
            Customise branding for all users, and pick an accent colour for this
            browser only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DashboardBrandingSettings canEdit={canUpdate} />

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium">Accent colour</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Buttons, links, and highlights — saved in this browser only.
            </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="accent-colour">Accent colour</Label>
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={accentHex}
                  onChange={(hex) => {
                    setAccentHex(hex);
                    saveAccentTheme(hex);
                    setAccentSaved("Accent updated.");
                  }}
                />
                <Input
                  id="accent-colour"
                  value={accentHex}
                  onChange={(e) => setAccentHex(e.target.value)}
                  onBlur={() => {
                    const next = normalizeHex(accentHex, DEFAULT_ACCENT_HEX);
                    setAccentHex(next);
                    saveAccentTheme(next);
                    setAccentSaved("Accent updated.");
                  }}
                  className="w-32 border-border bg-secondary/30 font-mono uppercase"
                  maxLength={7}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetAccentTheme();
                setAccentHex(DEFAULT_ACCENT_HEX);
                setAccentSaved("Reset to default purple.");
              }}
            >
              Reset to default
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground"
            >
              Primary button
            </span>
            <span className="rounded-md bg-primary/15 px-3 py-1.5 text-primary">
              Highlight
            </span>
            <span className="rounded-md bg-accent px-3 py-1.5 text-accent-foreground">
              Accent surface
            </span>
          </div>
          {accentSaved ? (
            <p className="text-xs text-muted-foreground">{accentSaved}</p>
          ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Software updates</CardTitle>
          <CardDescription>
            Checks{" "}
            <a
              href="https://github.com/C-h-a-r/SupportBot-Dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              SupportBot-Dashboard
            </a>{" "}
            on the release branch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : check ? (
            <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Installed: </span>
                  <span className="font-mono font-medium">v{check.current}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Latest: </span>
                  <span className="font-mono font-medium">v{check.latest}</span>
                </p>
              </div>
              {check.updateAvailable ? (
                <p className="text-sm text-amber-500">
                  A newer version is available. Update downloads bot files while keeping your Configs and Data.
                </p>
              ) : (
                <p className="text-sm text-emerald-500">You are on the latest release.</p>
              )}
            </div>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {notice ? (
            <Alert>
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadCheck}
              disabled={loading || updating}
            >
              <Icon icon={RefreshIcon} size={16} className="mr-2" />
              Check again
            </Button>
            {check?.updateAvailable && canUpdate ? (
              <Button type="button" onClick={handleUpdate} disabled={updating}>
                {updating ? (
                  <Icon
                    icon={Loading03Icon}
                    size={16}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <Icon icon={Download04Icon} size={16} className="mr-2" />
                )}
                {updating ? "Installing…" : "Update now"}
              </Button>
            ) : null}
            {check?.updateAvailable && !canUpdate ? (
              <p className="text-xs text-muted-foreground">
                You can check for updates but cannot install them with your role.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
