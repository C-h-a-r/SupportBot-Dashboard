import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api/client";
import { applyDashboardBranding } from "@/lib/apply-dashboard-branding";
import { DEFAULT_BRANDING, type DashboardBranding } from "@/lib/branding-types";

interface BrandingContextValue {
  branding: DashboardBranding;
  loading: boolean;
  refreshBranding: () => Promise<void>;
  setBrandingLocal: (next: DashboardBranding) => void;
}

const BrandingContext = createContext<BrandingContextValue | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<DashboardBranding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  const refreshBranding = useCallback(async () => {
    try {
      const res = await api.getBranding();
      if (res.data) {
        setBranding(res.data);
        applyDashboardBranding(res.data);
      }
    } catch {
      setBranding(DEFAULT_BRANDING);
      applyDashboardBranding(DEFAULT_BRANDING);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshBranding();
  }, [refreshBranding]);

  const setBrandingLocal = useCallback((next: DashboardBranding) => {
    setBranding(next);
    applyDashboardBranding(next);
  }, []);

  const value = useMemo(
    () => ({
      branding,
      loading,
      refreshBranding,
      setBrandingLocal,
    }),
    [branding, loading, refreshBranding, setBrandingLocal],
  );

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return ctx;
}
