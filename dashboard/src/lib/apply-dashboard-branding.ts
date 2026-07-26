import type { DashboardBranding } from "@/lib/branding-types";

const FAVICON_LINK_ID = "supportbot-dashboard-favicon";

export function applyDashboardBranding(branding: DashboardBranding) {
  if (branding.pageTitle) {
    document.title = branding.pageTitle;
  }

  let link = document.getElementById(FAVICON_LINK_ID) as HTMLLinkElement | null;
  if (branding.faviconUrl) {
    const href = `${branding.faviconUrl}${branding.updatedAt ? `?v=${branding.updatedAt}` : ""}`;
    if (!link) {
      link = document.createElement("link");
      link.id = FAVICON_LINK_ID;
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  } else if (link) {
    link.remove();
  }
}
