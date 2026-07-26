import { useMemo } from "react";
import { BotIcon } from "@hugeicons/core-free-icons";
import { Navigate, useSearchParams } from "react-router-dom";
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
import { useAuth } from "@/context/AuthContext";
import { useBranding } from "@/context/BrandingContext";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_not_configured:
    "Discord OAuth is not configured. Complete setup at /setup first.",
  not_allowed:
    "Your Discord account is not allowed. Ask an owner to add you under Users, or add your ID to OwnerUserIds in Configs/api.yml.",
  invalid_state: "Login session expired. Please try again.",
  missing_code: "Discord did not return an authorization code. Please try again.",
  oauth_failed: "Could not complete Discord sign-in. Check your OAuth settings.",
  access_denied: "You cancelled Discord sign-in.",
};

function errorMessage(code: string | null): string {
  if (!code) return "";
  return ERROR_MESSAGES[code] || "Sign-in failed. Please try again.";
}

export default function Login() {
  const { branding } = useBranding();
  const { isAuthenticated, loading, loginWithDiscord } = useAuth();
  const [searchParams] = useSearchParams();
  const error = useMemo(
    () => errorMessage(searchParams.get("error")),
    [searchParams],
  );

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            {branding.hasFavicon && branding.faviconUrl ? (
              <img
                src={`${branding.faviconUrl}${branding.updatedAt ? `?v=${branding.updatedAt}` : ""}`}
                alt=""
                className="size-11 rounded-xl object-contain"
              />
            ) : (
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon icon={BotIcon} size={22} />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{branding.title}</CardTitle>
              <CardDescription>Sign in to your dashboard</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sign in with Discord. Your application credentials and allowed user
            IDs are configured in{" "}
            <code className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-foreground">
              Configs/api.yml
            </code>
            .
          </p>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            type="button"
            className="w-full"
            disabled={loading}
            onClick={loginWithDiscord}
          >
            {loading ? "Checking session…" : "Continue with Discord"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
