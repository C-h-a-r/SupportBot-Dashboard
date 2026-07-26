import { useEffect, useRef, useState } from "react";
import { ImageUpload01Icon } from "@hugeicons/core-free-icons";
import { api } from "@/api/client";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBranding } from "@/context/BrandingContext";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

interface DashboardBrandingSettingsProps {
  canEdit: boolean;
}

export function DashboardBrandingSettings({ canEdit }: DashboardBrandingSettingsProps) {
  const { branding, setBrandingLocal } = useBranding();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(branding.title);
  const [pageTitle, setPageTitle] = useState(branding.pageTitle);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setTitle(branding.title);
    setPageTitle(branding.pageTitle);
  }, [branding.title, branding.pageTitle]);

  const faviconPreview =
    branding.hasFavicon && branding.faviconUrl
      ? `${branding.faviconUrl}${branding.updatedAt ? `?v=${branding.updatedAt}` : ""}`
      : null;

  async function saveText() {
    if (!canEdit) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await api.updateBranding({ title, pageTitle });
      if (res.data) setBrandingLocal(res.data);
      setMessage(res.message || "Branding saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onFaviconSelected(file: File | null) {
    if (!canEdit || !file) return;
    setUploading(true);
    setMessage("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await api.uploadBrandingFavicon(dataUrl);
      if (res.data) setBrandingLocal(res.data);
      setMessage(res.message || "Favicon uploaded.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeFavicon() {
    if (!canEdit) return;
    setUploading(true);
    setMessage("");
    try {
      const res = await api.removeBrandingFavicon();
      if (res.data) setBrandingLocal(res.data);
      setMessage(res.message || "Favicon removed.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setUploading(false);
    }
  }

  async function resetAll() {
    if (!canEdit) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await api.resetBranding();
      if (res.data) setBrandingLocal(res.data);
      setMessage(res.message || "Reset to defaults.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSaving(false);
    }
  }

  const textDirty =
    title.trim() !== branding.title || pageTitle.trim() !== branding.pageTitle;

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <div>
        <p className="text-sm font-medium">Branding</p>
        <p className="text-xs text-muted-foreground">
          Sidebar title, browser tab title, and favicon — saved on the server for
          everyone using this dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="brand-title">Sidebar title</Label>
          <Input
            id="brand-title"
            value={title}
            disabled={!canEdit}
            maxLength={64}
            onChange={(e) => setTitle(e.target.value)}
            className="border-border bg-secondary/30"
            placeholder="SupportBot"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand-page-title">Browser tab title</Label>
          <Input
            id="brand-page-title"
            value={pageTitle}
            disabled={!canEdit}
            maxLength={80}
            onChange={(e) => setPageTitle(e.target.value)}
            className="border-border bg-secondary/30"
            placeholder="SupportBot Dashboard"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Favicon</Label>
        <p className="text-xs text-muted-foreground">
          PNG, ICO, SVG, JPEG, or WebP — max 512 KB. Shown in the browser tab and
          beside the sidebar title.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary/30">
            {faviconPreview ? (
              <img
                src={faviconPreview}
                alt="Favicon preview"
                className="size-full object-contain p-1"
              />
            ) : (
              <Icon
                icon={ImageUpload01Icon}
                size={22}
                className="text-muted-foreground"
              />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/webp,.ico"
            className="hidden"
            disabled={!canEdit || uploading}
            onChange={(e) => void onFaviconSelected(e.target.files?.[0] ?? null)}
          />
          {canEdit ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload favicon"}
              </Button>
              {branding.hasFavicon ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => void removeFavicon()}
                >
                  Remove
                </Button>
              ) : null}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">View only</span>
          )}
        </div>
      </div>

      {canEdit ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={saving || !textDirty}
            onClick={() => void saveText()}
          >
            {saving ? "Saving…" : "Save titles"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving || uploading}
            onClick={() => void resetAll()}
          >
            Reset branding
          </Button>
        </div>
      ) : null}

      {message ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
