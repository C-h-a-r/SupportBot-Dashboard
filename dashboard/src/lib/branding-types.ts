export interface DashboardBranding {
  title: string;
  pageTitle: string;
  hasFavicon: boolean;
  faviconUrl: string | null;
  updatedAt: number | null;
}

export const DEFAULT_BRANDING: DashboardBranding = {
  title: "SupportBot",
  pageTitle: "SupportBot Dashboard",
  hasFavicon: false,
  faviconUrl: null,
  updatedAt: null,
};
