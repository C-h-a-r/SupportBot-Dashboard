import { useCallback, useEffect, useState } from "react";
import { AlertCircleIcon, FloppyDiskIcon } from "@hugeicons/core-free-icons";
import { api } from "@/api/client";
import { ConfigFieldInput } from "@/components/config/config-field";
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
import { Skeleton } from "@/components/ui/skeleton";
import { schemaFromObject } from "@/lib/generic-config-schema";
import { getByPath, setByPath } from "@/lib/config-utils";
import { useAuth } from "@/context/AuthContext";
import { notifyConfigSave } from "@/lib/notify-config-save";

interface AddonConfigEditorProps {
  filename: string;
}

export function AddonConfigEditor({ filename }: AddonConfigEditorProps) {
  const { canEditConfig } = useAuth();
  const readOnly = !canEditConfig("supportbot");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [original, setOriginal] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.getAddonConfigJson(filename);
      const raw = (res.data ?? {}) as Record<string, unknown>;
      setData(raw);
      setOriginal(structuredClone(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, [filename]);

  useEffect(() => {
    load();
  }, [load]);

  const schema = data ? schemaFromObject(data) : null;

  function patch(path: string, value: unknown) {
    setData((prev) => (prev ? setByPath(prev, path, value) : prev));
  }

  async function handleSave() {
    if (readOnly || !data) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await notifyConfigSave(() =>
        api.saveAddonConfig(filename, data),
      );
      setMessage(res.message || "Saved.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!data || !schema) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Failed to load"}</AlertDescription>
      </Alert>
    );
  }

  const dirty =
    original && JSON.stringify(data) !== JSON.stringify(original);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {dirty ? (
          <span className="text-xs text-amber-500">Unsaved changes</span>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading || saving}
        >
          Reload
        </Button>
        {!readOnly ? (
          <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
            <Icon icon={FloppyDiskIcon} size={16} className="mr-1.5" />
            {saving ? "Saving…" : "Save"}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">View only</span>
        )}
      </div>

      {error ? (
        <Alert variant="destructive">
          <Icon icon={AlertCircleIcon} size={18} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="border-primary/30 bg-primary/10 text-primary">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {schema.map((section) => (
        <Card key={section.title} className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{section.title}</CardTitle>
            {section.description ? (
              <CardDescription>{section.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.path}
                className={
                  field.type === "textarea" || field.type === "stringList"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                <ConfigFieldInput
                  field={field}
                  value={getByPath(data, field.path)}
                  readOnly={readOnly}
                  onChange={(v) => patch(field.path, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
