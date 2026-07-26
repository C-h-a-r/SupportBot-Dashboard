import { useCallback, useEffect, useMemo, useState } from "react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { api, type GuildResources } from "@/api/client";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnicodeEmojiPanel } from "@/components/config/unicode-emoji-panel";
import {
  emojiCdnUrl,
  formatCustomEmoji,
  parseEmojiValue,
  resolveEmojiPreview,
  type GuildEmojiOption,
} from "@/lib/emoji-format";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  id: string;
  label: string;
  description?: string;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}

function EmojiPreview({
  value,
  guildEmojis,
  size = "md",
}: {
  value: unknown;
  guildEmojis: GuildEmojiOption[];
  size?: "md" | "lg";
}) {
  const parsed = resolveEmojiPreview(value, guildEmojis);
  const imgSize = size === "lg" ? "size-10" : "size-7";
  const textSize = size === "lg" ? "text-3xl" : "text-2xl";

  if (parsed.kind === "empty") {
    return (
      <span className="text-sm text-muted-foreground">No emoji selected</span>
    );
  }

  if (parsed.kind === "custom" && parsed.id) {
    return (
      <span className="inline-flex items-center gap-3">
        <img
          src={emojiCdnUrl(parsed.id, parsed.animated)}
          alt={parsed.name ?? "custom emoji"}
          className={cn(imgSize, "shrink-0 rounded-md")}
          loading="lazy"
        />
        <span className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-medium">:{parsed.name}:</span>
          <span className="font-mono text-xs text-muted-foreground">
            {parsed.value}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={cn(textSize, "leading-none")} title={parsed.value}>
      {parsed.value}
    </span>
  );
}

export function EmojiPicker({
  id,
  label,
  description,
  value,
  onChange,
  readOnly,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"server" | "unicode">("server");
  const [resources, setResources] = useState<GuildResources | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const loadGuildEmojis = useCallback(async (refresh = false) => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.getGuildResources(refresh);
      if (res.data) {
        setResources(res.data);
        if (!Array.isArray(res.data.emojis)) {
          setLoadError(
            "Server response is missing emojis. Restart the bot after updating.",
          );
        }
      } else {
        setLoadError("No guild data returned.");
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load server emojis",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadGuildEmojis(true);
  }, [open, loadGuildEmojis]);

  const guildEmojis = useMemo(
    () => (Array.isArray(resources?.emojis) ? resources.emojis : []),
    [resources],
  );

  const filteredGuild = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guildEmojis;
    return guildEmojis.filter((e) => e.name.toLowerCase().includes(q));
  }, [guildEmojis, query]);

  const current = String(value ?? "");
  const parsed = parseEmojiValue(current);

  function selectUnicode(emoji: string) {
    onChange(emoji);
    setOpen(false);
  }

  function selectGuild(emoji: GuildEmojiOption) {
    onChange(formatCustomEmoji(emoji.name, emoji.id, emoji.animated));
    setOpen(false);
  }

  function clearEmoji() {
    onChange("");
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <EmojiPreview value={value} guildEmojis={guildEmojis} size="lg" />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={readOnly}
            onClick={() => setOpen(true)}
          >
            Choose emoji
          </Button>
          {current ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={readOnly}
              onClick={clearEmoji}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(90vh,720px)] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="space-y-1 border-b border-border px-5 py-4">
            <DialogTitle>Choose emoji</DialogTitle>
            <DialogDescription>
              Server emojis save as{" "}
              <code className="rounded bg-muted px-1 text-xs">&lt;:name:id&gt;</code>
              . Standard emojis save as Unicode characters.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "server" | "unicode")}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="mx-5 mt-3 grid h-9 w-auto grid-cols-2">
              <TabsTrigger value="server">Server</TabsTrigger>
              <TabsTrigger value="unicode">All emojis</TabsTrigger>
            </TabsList>

            <TabsContent value="server" className="mt-0 flex-1 px-5 pb-4 pt-3">
              <div className="relative mb-3">
                <Icon
                  icon={Search01Icon}
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 border-border bg-secondary/30 pl-9"
                />
              </div>

              {resources ? (
                <p className="mb-2 text-xs text-muted-foreground">
                  {resources.guildName} · {guildEmojis.length} custom emoji
                  {guildEmojis.length === 1 ? "" : "s"}
                </p>
              ) : null}

              <ScrollArea className="h-[min(50vh,320px)] rounded-lg border border-border/50 bg-secondary/20">
                {loading ? (
                  <div className="grid grid-cols-6 gap-2 p-3 sm:grid-cols-8">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : loadError ? (
                  <div className="space-y-3 p-4 text-center">
                    <p className="text-sm text-destructive">{loadError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void loadGuildEmojis(true)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredGuild.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    {guildEmojis.length === 0
                      ? "No custom emojis in this server, or the bot needs the Guild Emojis intent (restart after update)."
                      : "No emojis match your search."}
                  </p>
                ) : (
                  <div className="grid grid-cols-6 gap-1.5 p-2 sm:grid-cols-8">
                    {filteredGuild.map((emoji) => {
                      const selected =
                        parsed.kind === "custom" && parsed.id === emoji.id;
                      return (
                        <button
                          key={emoji.id}
                          type="button"
                          title={`:${emoji.name}:`}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-lg border border-transparent bg-background/50 transition-colors hover:border-primary/30 hover:bg-accent",
                            selected &&
                              "border-primary/50 bg-primary/15 ring-2 ring-primary/30",
                          )}
                          onClick={() => selectGuild(emoji)}
                        >
                          <img
                            src={emoji.url ?? emojiCdnUrl(emoji.id, emoji.animated)}
                            alt={emoji.name}
                            className="size-8 object-contain"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unicode" className="mt-0 px-5 pb-4 pt-3">
              <UnicodeEmojiPanel onPick={selectUnicode} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Input
        value={current}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Unicode or <:name:id>"
        className="border-border bg-secondary/30 font-mono text-xs"
      />
    </div>
  );
}
