import { useCallback, useEffect, useRef, useState } from "react";
import { FloppyDiskIcon } from "@hugeicons/core-free-icons";
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
import { getByPath, setByPath } from "@/lib/config-utils";
import { transcriptTemplateSchema } from "@/lib/transcript-template-schema";
import { normalizeGoogleFontValue } from "@/lib/google-fonts";
import type { TranscriptTemplate } from "@/lib/transcript-template-types";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const PREVIEW_DEBOUNCE_MS = 450;

function canEditTemplate(role: string | undefined, hasTranscripts: boolean) {
  return hasTranscripts && role !== "viewer";
}

export function TranscriptAppearanceEditor() {
  const { user, hasPermission } = useAuth();
  const readOnly = !canEditTemplate(user?.role, hasPermission("transcripts"));

  const [data, setData] = useState<TranscriptTemplate | null>(null);
  const [original, setOriginal] = useState<TranscriptTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.getTranscriptTemplate();
      const tpl = (res.data ?? null) as TranscriptTemplate | null;
      if (tpl) {
        const normalized = {
          ...tpl,
          Typography: {
            ...tpl.Typography,
            FontFamily: normalizeGoogleFontValue(tpl.Typography?.FontFamily),
          },
        };
        setData(normalized);
        setOriginal(structuredClone(normalized));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshPreview = useCallback(async (tpl: TranscriptTemplate) => {
    setPreviewLoading(true);
    try {
      const html = await api.previewTranscriptTemplate(tpl);
      setPreviewHtml(html);
    } catch {
      setPreviewHtml(
        "<!DOCTYPE html><body style='padding:2rem;font-family:sans-serif'><p>Preview failed to load.</p></body>",
      );
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void refreshPreview(data);
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [data, refreshPreview]);

  function patch(path: string, value: unknown) {
    setData((prev) =>
      prev ? (setByPath(prev as Record<string, unknown>, path, value) as TranscriptTemplate) : prev,
    );
  }

  async function handleSave() {
    if (readOnly || !data) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await api.saveTranscriptTemplate(data);
      setMessage(res.message || "Saved.");
      setOriginal(structuredClone(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    data && original && JSON.stringify(data) !== JSON.stringify(original);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || "Failed to load template"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Customize how new ticket transcripts look. Existing saved transcripts are not
          changed.
        </p>
        <div className="flex items-center gap-2">
          {dirty ? (
            <span className="text-xs text-amber-500">Unsaved changes</span>
          ) : null}
          {!readOnly ? (
            <Button size="sm" onClick={handleSave} disabled={saving || !dirty}>
              <Icon icon={FloppyDiskIcon} size={16} className="mr-1.5" />
              {saving ? "Saving…" : "Save appearance"}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">View only</span>
          )}
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="border-primary/30 bg-primary/10 text-primary">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <ScrollableEditor data={data} readOnly={readOnly} onPatch={patch} />

        <Card className="flex min-h-[520px] flex-col overflow-hidden border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Live preview</CardTitle>
            <CardDescription>
              Sample ticket with your current settings
              {previewLoading ? " · updating…" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-4 pt-0">
            <iframe
              title="Transcript template preview"
              srcDoc={previewHtml}
              className={cn(
                "h-[min(640px,calc(100svh-14rem))] w-full rounded-lg border border-border bg-background",
                previewLoading && "opacity-60",
              )}
              sandbox="allow-same-origin"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScrollableEditor({
  data,
  readOnly,
  onPatch,
}: {
  data: TranscriptTemplate;
  readOnly: boolean;
  onPatch: (path: string, value: unknown) => void;
}) {
  return (
    <div className="max-h-[min(720px,calc(100svh-12rem))] space-y-4 overflow-y-auto pr-1">
      {transcriptTemplateSchema.map((section) => (
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
                  field.type === "textarea" ? "sm:col-span-2" : ""
                }
              >
                <ConfigFieldInput
                  field={field}
                  value={getByPath(data as Record<string, unknown>, field.path)}
                  readOnly={readOnly}
                  onChange={(v) => onPatch(field.path, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
