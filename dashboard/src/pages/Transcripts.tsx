import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowExpand01Icon,
  Copy01Icon,
  Delete02Icon,
  Download04Icon,
  File02Icon,
  Link01Icon,
  RefreshIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { api } from "@/api/client";
import { Icon } from "@/components/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TranscriptAppearanceEditor } from "@/components/transcripts/transcript-appearance-editor";
import { TranscriptSettingsPanel } from "@/components/transcripts/transcript-settings-panel";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type TranscriptsTab = "browse" | "appearance" | "settings";

function canManageTranscripts(role: string | undefined, hasTranscripts: boolean) {
  return hasTranscripts && role !== "viewer";
}

interface TranscriptItem {
  id: string;
  filename: string;
  createdAt: string;
  size?: number;
  ticketName?: string | null;
}

function formatBytes(bytes?: number) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Transcripts() {
  const { user, hasPermission } = useAuth();
  const canManage = canManageTranscripts(user?.role, hasPermission("transcripts"));

  const [tab, setTab] = useState<TranscriptsTab>("browse");
  const [list, setList] = useState<TranscriptItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewError, setViewError] = useState("");
  const [listError, setListError] = useState("");
  const [query, setQuery] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publicAccessEnabled, setPublicAccessEnabled] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await api.listTranscripts();
      const items = (res.data ?? []) as TranscriptItem[];
      setList(items);
      setSelectedId((prev) => {
        if (prev && items.some((t) => t.id === prev)) return prev;
        return items[0]?.id ?? null;
      });
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Failed to load transcripts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (tab !== "browse") return;
    api
      .getTranscriptSettings()
      .then((res) => {
        setPublicAccessEnabled(Boolean(res.data?.publicAccess?.enabled));
      })
      .catch(() => setPublicAccessEnabled(false));
  }, [tab]);

  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (t) =>
        t.id.includes(q) ||
        t.filename.toLowerCase().includes(q) ||
        (t.ticketName && t.ticketName.toLowerCase().includes(q)),
    );
  }, [list, query]);

  const selected = useMemo(
    () => list.find((t) => t.id === selectedId) ?? null,
    [list, selectedId],
  );

  const viewUrl = selectedId
    ? `/api/system/transcripts/${encodeURIComponent(selectedId)}/view`
    : null;

  const downloadUrl = selectedId
    ? `/api/system/transcripts/${encodeURIComponent(selectedId)}/download`
    : null;

  const publicUrl =
    selectedId && publicAccessEnabled
      ? `${window.location.origin}/transcripts/${encodeURIComponent(selectedId)}`
      : null;

  function selectTranscript(id: string) {
    setViewError("");
    setSelectedId(id);
    setIframeKey((k) => k + 1);
  }

  function openInNewTab() {
    if (!viewUrl) return;
    window.open(viewUrl, "_blank", "noopener,noreferrer");
  }

  function openPublicInNewTab() {
    if (!publicUrl) return;
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  }

  async function copyPublicLink() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setViewError("Could not copy link to clipboard.");
    }
  }

  async function handleDelete() {
    if (!selectedId || !canManage) return;
    const label =
      selected?.ticketName?.trim() || `channel ${selectedId}`;
    if (
      !window.confirm(
        `Delete the transcript for ${label}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setViewError("");
    try {
      await api.deleteTranscript(selectedId);
      await loadList();
    } catch (err) {
      setViewError(
        err instanceof Error ? err.message : "Failed to delete transcript",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownload() {
    if (!downloadUrl || !selected) return;
    setDownloading(true);
    setViewError("");
    try {
      const res = await fetch(downloadUrl, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ||
            `Download failed (${res.status})`,
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = selected.filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setViewError(
        err instanceof Error ? err.message : "Failed to download transcript",
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transcripts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse saved transcripts or customize how new ones look when tickets close.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            <Button
              type="button"
              variant={tab === "browse" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setTab("browse")}
            >
              Library
            </Button>
            <Button
              type="button"
              variant={tab === "appearance" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setTab("appearance")}
            >
              Appearance
            </Button>
            <Button
              type="button"
              variant={tab === "settings" ? "secondary" : "ghost"}
              size="sm"
              className="h-8"
              onClick={() => setTab("settings")}
            >
              Settings
            </Button>
          </div>
          {tab === "browse" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadList()}
              disabled={loading}
            >
              <Icon icon={RefreshIcon} size={16} className={cn(loading && "animate-spin")} />
              Refresh
            </Button>
          ) : null}
        </div>
      </div>

      {tab === "appearance" ? (
        <TranscriptAppearanceEditor />
      ) : tab === "settings" ? (
        <TranscriptSettingsPanel />
      ) : (
        <>
      {listError ? (
        <Alert variant="destructive">
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(240px,320px)_1fr]">
        <Card className="flex min-h-[420px] flex-col border-border bg-card">
          <CardHeader className="space-y-3 pb-3">
            <CardTitle className="text-base font-medium">
              Saved transcripts
              {!loading && list.length > 0 ? (
                <span className="ml-2 font-normal text-muted-foreground">
                  ({list.length})
                </span>
              ) : null}
            </CardTitle>
            <div className="relative">
              <Icon
                icon={Search01Icon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search by ticket name or channel ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-0 pb-4">
            <ScrollArea className="h-[min(520px,calc(100svh-16rem))] px-4">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                  <Icon icon={File02Icon} size={32} className="opacity-40" />
                  <p>
                    {list.length === 0
                      ? "No transcripts yet. They appear when tickets are closed."
                      : "No transcripts match your search."}
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {filtered.map((item) => {
                    const active = item.id === selectedId;
                    const label = item.ticketName?.trim() || `Channel ${item.id}`;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => selectTranscript(item.id)}
                          className={cn(
                            "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                            active
                              ? "border-primary/50 bg-primary/10"
                              : "border-transparent bg-secondary/30 hover:bg-secondary/50",
                          )}
                        >
                          <p className="truncate text-sm font-medium">{label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatWhen(item.createdAt)}
                            {item.size != null ? ` · ${formatBytes(item.size)}` : ""}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex min-h-[420px] flex-col overflow-hidden border-border bg-card">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0 pb-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base font-medium">
                {selected
                  ? selected.ticketName?.trim() || `Channel ${selected.id}`
                  : "Preview"}
              </CardTitle>
              {selected ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {formatWhen(selected.createdAt)}
                  {selected.size != null ? ` · ${formatBytes(selected.size)}` : ""}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {publicUrl ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void copyPublicLink()}
                  >
                    <Icon icon={Copy01Icon} size={16} />
                    {linkCopied ? "Copied" : "Copy link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPublicInNewTab}
                  >
                    <Icon icon={Link01Icon} size={16} />
                    Public page
                  </Button>
                </>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                disabled={!viewUrl}
                onClick={openInNewTab}
              >
                <Icon icon={ArrowExpand01Icon} size={16} />
                Open tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!downloadUrl || downloading}
                onClick={() => void handleDownload()}
              >
                <Icon icon={Download04Icon} size={16} />
                {downloading ? "Saving…" : "Download"}
              </Button>
              {canManage ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!selectedId || deleting}
                  className="text-destructive hover:text-destructive"
                  onClick={() => void handleDelete()}
                >
                  <Icon icon={Delete02Icon} size={16} />
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-2 p-4 pt-0">
            {viewError ? (
              <Alert variant="destructive">
                <AlertDescription>{viewError}</AlertDescription>
              </Alert>
            ) : null}
            {selected && viewUrl ? (
              <iframe
                key={iframeKey}
                title={`Transcript ${selected.id}`}
                src={viewUrl}
                className="min-h-[min(560px,calc(100svh-18rem))] w-full flex-1 rounded-lg border border-border bg-background"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                <Icon icon={File02Icon} size={40} className="opacity-30" />
                <p>Select a transcript from the list to preview it here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        </>
      )}
    </div>
  );
}