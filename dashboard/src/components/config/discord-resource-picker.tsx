import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DiscordResourceKind = "channel" | "role" | "category";

interface DiscordResourcePickerProps {
  id: string;
  label: string;
  description?: string;
  kind: DiscordResourceKind;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}

import type { GuildResources } from "@/api/client";

export function DiscordResourcePicker({
  id,
  label,
  description,
  kind,
  value,
  onChange,
  readOnly,
}: DiscordResourcePickerProps) {
  const [resources, setResources] = useState<GuildResources | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getGuildResources()
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setResources(res.data);
          setLoadError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Could not load server list",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    if (!resources) return [];
    if (kind === "role") return resources.roles;
    if (kind === "category") return resources.categories;
    return resources.channels;
  }, [resources, kind]);

  const current = String(value ?? "");
  const matched = options.find((o) => o.id === current);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}

      {resources ? (
        <Select
          value={matched ? current : ""}
          disabled={readOnly || loading}
          onValueChange={(next) => onChange(next)}
        >
          <SelectTrigger id={id} className="border-border bg-secondary/30">
            <SelectValue
              placeholder={
                loading
                  ? "Loading…"
                  : `Select ${kind} from ${resources.guildName}…`
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
                <span className="ml-2 font-mono text-xs text-muted-foreground">
                  {opt.id}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      <Input
        value={current}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          kind === "role"
            ? "Role ID (ROLE_ID)"
            : kind === "category"
              ? "Category ID"
              : "Channel ID"
        }
        className="border-border bg-secondary/30 font-mono text-sm"
      />

      {loadError ? (
        <p className="text-xs text-amber-500">{loadError}</p>
      ) : null}
      {!loadError && !resources && !loading ? (
        <p className="text-xs text-muted-foreground">
          Set General.GuildId and invite the bot to pick from a list.
        </p>
      ) : null}
    </div>
  );
}
