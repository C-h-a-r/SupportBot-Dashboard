import type { IconSvgElement } from "@hugeicons/react";
import { CommandIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface CommandEntry {
  key: string;
  Command?: string;
  Description?: string;
  Enabled?: boolean;
  Permission?: string[];
}

interface CommandsEditorProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

function isCommandBlock(v: unknown): v is CommandEntry {
  return (
    v !== null &&
    typeof v === "object" &&
    "Command" in (v as Record<string, unknown>)
  );
}

export function getCommandEntries(
  data: Record<string, unknown>,
): CommandEntry[] {
  return Object.entries(data)
    .filter(([, v]) => isCommandBlock(v))
    .map(([key, v]) => ({ key, ...(v as CommandEntry) }));
}

export function CommandsEditor({ data, onChange }: CommandsEditorProps) {
  const entries = getCommandEntries(data);

  function updateEntry(
    key: string,
    patch: Partial<CommandEntry>,
  ) {
    const current = data[key] as Record<string, unknown>;
    onChange({
      ...data,
      [key]: { ...current, ...patch },
    });
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No commands found in this config.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <Card key={entry.key} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon icon={CommandIcon as IconSvgElement} size={18} />
            </div>
            <CardTitle className="text-base">{entry.key}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${entry.key}-enabled`}>Enabled</Label>
              <Switch
                id={`${entry.key}-enabled`}
                checked={entry.Enabled !== false}
                onCheckedChange={(checked) =>
                  updateEntry(entry.key, { Enabled: checked })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slash command</Label>
              <Input
                value={entry.Command ?? ""}
                onChange={(e) =>
                  updateEntry(entry.key, { Command: e.target.value })
                }
                className="border-border bg-secondary/30 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={entry.Description ?? ""}
                onChange={(e) =>
                  updateEntry(entry.key, { Description: e.target.value })
                }
                className="border-border bg-secondary/30"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
