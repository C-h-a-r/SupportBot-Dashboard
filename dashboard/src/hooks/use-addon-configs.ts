import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/api/client";

export function useAddonConfigs() {
  const location = useLocation();
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.listAddonConfigs();
      setFiles(res.data ?? []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  return { files, loading, refresh };
}
