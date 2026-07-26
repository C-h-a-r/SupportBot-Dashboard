import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { api, type StoredDashboardUser } from "@/api/client";
import { Icon } from "@/components/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import {
  CONFIG_FILE_LABELS,
  CONFIG_FILES,
  defaultPermissionsForRole,
  displayDiscordName,
  ROLE_HINTS,
  ROLE_LABELS,
  type DashboardPermissions,
  type DashboardRole,
} from "@/lib/permissions";

const ASSIGNABLE_ROLES: DashboardRole[] = [
  "admin",
  "moderator",
  "editor",
  "viewer",
  "custom",
];

type EditorState = {
  mode: "add" | "edit";
  id: string;
  username: string;
  globalName: string;
  role: DashboardRole;
  enabled: boolean;
  permissions: DashboardPermissions;
  yamlOwner: boolean;
};

function emptyEditor(): EditorState {
  return {
    mode: "add",
    id: "",
    username: "",
    globalName: "",
    role: "viewer",
    enabled: true,
    permissions: defaultPermissionsForRole("viewer"),
    yamlOwner: false,
  };
}

function PermissionEditor({
  permissions,
  onChange,
  disabled,
}: {
  permissions: DashboardPermissions;
  onChange: (next: DashboardPermissions) => void;
  disabled?: boolean;
}) {
  const set = (patch: Partial<DashboardPermissions>) =>
    onChange({ ...permissions, ...patch });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["Dashboard overview", "overview"],
            ["Logs", "logs"],
            ["Transcripts", "transcripts"],
          ] as const
        ).map(([label, key]) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
          >
            <span className="text-sm">{label}</span>
            <Switch
              checked={permissions[key]}
              disabled={disabled}
              onCheckedChange={(checked) => set({ [key]: checked })}
            />
          </label>
        ))}
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="text-sm">Settings — view</span>
          <Switch
            checked={permissions.settings.view}
            disabled={disabled}
            onCheckedChange={(view) =>
              set({ settings: { ...permissions.settings, view } })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="text-sm">Settings — install updates</span>
          <Switch
            checked={permissions.settings.update}
            disabled={disabled}
            onCheckedChange={(update) =>
              set({ settings: { ...permissions.settings, update } })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="text-sm">Users — view</span>
          <Switch
            checked={permissions.users.view}
            disabled={disabled}
            onCheckedChange={(view) =>
              set({ users: { ...permissions.users, view } })
            }
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="text-sm">Users — manage</span>
          <Switch
            checked={permissions.users.manage}
            disabled={disabled}
            onCheckedChange={(manage) =>
              set({ users: { ...permissions.users, manage } })
            }
          />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Configuration files</p>
        <div className="space-y-2">
          {CONFIG_FILES.map((file) => (
            <div
              key={file}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
            >
              <span className="text-sm">{CONFIG_FILE_LABELS[file]}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  View
                  <Switch
                    checked={permissions.configs[file].view}
                    disabled={disabled}
                    onCheckedChange={(view) =>
                      onChange({
                        ...permissions,
                        configs: {
                          ...permissions.configs,
                          [file]: { ...permissions.configs[file], view },
                        },
                      })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Edit
                  <Switch
                    checked={permissions.configs[file].edit}
                    disabled={disabled}
                    onCheckedChange={(edit) =>
                      onChange({
                        ...permissions,
                        configs: {
                          ...permissions.configs,
                          [file]: {
                            ...permissions.configs[file],
                            edit,
                            view: edit ? true : permissions.configs[file].view,
                          },
                        },
                      })
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function accessSummary(u: StoredDashboardUser) {
  if (u.permissions.users.manage) return "Full + user management";
  if (u.permissions.settings.update) return "Configs + settings updates";
  if (Object.values(u.permissions.configs).some((c) => c.edit)) {
    return "Can edit configs";
  }
  return "View only";
}

export default function Users() {
  const { user: currentUser, hasPermission } = useAuth();
  const canManage = hasPermission("users.manage");

  const [users, setUsers] = useState<StoredDashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.listDashboardUsers();
      if (res.data) setUsers(res.data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.yamlOwner !== b.yamlOwner) return a.yamlOwner ? -1 : 1;
        return (a.username || a.id).localeCompare(b.username || b.id);
      }),
    [users],
  );

  function openAdd() {
    setEditor(emptyEditor());
  }

  function openEdit(u: StoredDashboardUser) {
    setEditor({
      mode: "edit",
      id: u.id,
      username: u.username || "",
      globalName: u.globalName || "",
      role: u.yamlOwner ? "owner" : u.role,
      enabled: u.enabled,
      permissions:
        u.role === "custom"
          ? u.permissions
          : defaultPermissionsForRole(u.role),
      yamlOwner: u.yamlOwner,
    });
  }

  function setRole(role: DashboardRole) {
    if (!editor) return;
    setEditor({
      ...editor,
      role,
      permissions: defaultPermissionsForRole(role, editor.permissions),
    });
  }

  async function saveEditor() {
    if (!editor || !canManage) return;
    setSaving(true);
    setError("");
    try {
      if (editor.mode === "add") {
        await api.addDashboardUser({
          id: editor.id.trim(),
          role: editor.role,
          username: editor.username || undefined,
          globalName: editor.globalName || undefined,
          enabled: editor.enabled,
          permissions:
            editor.role === "custom" ? editor.permissions : undefined,
        });
      } else {
        await api.updateDashboardUser(editor.id, {
          role: editor.yamlOwner ? undefined : editor.role,
          enabled: editor.enabled,
          username: editor.username || undefined,
          globalName: editor.globalName || undefined,
          permissions:
            editor.role === "custom" ? editor.permissions : undefined,
        });
      }
      setEditor(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save user");
    } finally {
      setSaving(false);
    }
  }

  async function removeUser(id: string) {
    if (!canManage) return;
    if (!window.confirm("Remove this user from the dashboard?")) return;
    setError("");
    try {
      await api.removeDashboardUser(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove user");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Control who can sign in and what they can view or edit. Owners in{" "}
            <code className="rounded bg-primary/10 px-1 text-xs text-primary">
              api.yml
            </code>{" "}
            always have full access.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openAdd}>
            <Icon icon={Add01Icon} size={16} className="mr-2" />
            Add user
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base">Dashboard access</CardTitle>
          <CardDescription>
            {sortedUsers.length} user{sortedUsers.length === 1 ? "" : "s"}
            {canManage ? " — use edit to change permissions" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users…</p>
          ) : (
            <div className="divide-y divide-border/60">
              {sortedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-[200px] flex-1 items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={u.avatar} alt={u.username} />
                      <AvatarFallback>
                        {(u.username || u.id).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {displayDiscordName(u)}
                        {u.id === currentUser?.id ? " (you)" : ""}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.id}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {ROLE_LABELS[u.yamlOwner ? "owner" : u.role]}
                  </Badge>
                  <p className="max-w-[200px] text-xs text-muted-foreground">
                    {accessSummary(u)}
                  </p>
                  {u.enabled ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/15">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                  {canManage ? (
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(u)}
                        aria-label="Edit user"
                      >
                        <Icon icon={Edit02Icon} size={16} />
                      </Button>
                      {!u.yamlOwner ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeUser(u.id)}
                          aria-label="Remove user"
                        >
                          <Icon icon={Delete02Icon} size={16} />
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editor)}
        onOpenChange={(open) => !open && setEditor(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editor?.mode === "add" ? "Add dashboard user" : "Edit user"}
            </DialogTitle>
            <DialogDescription>
              {editor?.yamlOwner
                ? "This user is an owner in api.yml. Role and removal are managed in the config file."
                : ROLE_HINTS[editor?.role ?? "viewer"]}
            </DialogDescription>
          </DialogHeader>

          {editor ? (
            <div className="space-y-4">
              {editor.mode === "add" ? (
                <div className="space-y-2">
                  <Label htmlFor="discord-id">Discord user ID</Label>
                  <Input
                    id="discord-id"
                    value={editor.id}
                    onChange={(e) =>
                      setEditor({ ...editor, id: e.target.value })
                    }
                    placeholder="829112572816130058"
                  />
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Display name (optional)</Label>
                  <Input
                    value={editor.globalName}
                    onChange={(e) =>
                      setEditor({ ...editor, globalName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username (optional)</Label>
                  <Input
                    value={editor.username}
                    onChange={(e) =>
                      setEditor({ ...editor, username: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editor.role}
                  disabled={editor.yamlOwner}
                  onValueChange={(v) => setRole(v as DashboardRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editor.yamlOwner ? (
                      <SelectItem value="owner">Owner</SelectItem>
                    ) : (
                      ASSIGNABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm">Account enabled</span>
                <Switch
                  checked={editor.enabled}
                  disabled={editor.yamlOwner}
                  onCheckedChange={(enabled) =>
                    setEditor({ ...editor, enabled })
                  }
                />
              </label>

              {editor.role === "custom" && !editor.yamlOwner ? (
                <PermissionEditor
                  permissions={editor.permissions}
                  onChange={(permissions) =>
                    setEditor({ ...editor, permissions })
                  }
                />
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditor(null)}>
              Cancel
            </Button>
            <Button
              disabled={
                saving ||
                !canManage ||
                (editor?.mode === "add" &&
                  !/^\d{17,20}$/.test(editor.id.trim()))
              }
              onClick={() => void saveEditor()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
