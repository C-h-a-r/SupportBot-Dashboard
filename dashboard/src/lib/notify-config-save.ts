import { toast } from "sonner";
import type { ApiResponse } from "@/api/client";

export async function notifyConfigSave<T>(
  saveFn: () => Promise<ApiResponse<T>>,
): Promise<ApiResponse<T>> {
  const saveToast = toast.loading("Saving changes…");

  try {
    const res = await saveFn();
    toast.success("Changes saved", { id: saveToast });

    if (res.botRestart) {
      const restartToast = toast.loading("Restarting bot…");
      if (res.botRestart.success) {
        toast.success("Bot started", { id: restartToast });
      } else {
        toast.error(res.botRestart.error ?? "Could not start bot", {
          id: restartToast,
        });
      }
    }

    return res;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Save failed", {
      id: saveToast,
    });
    throw err;
  }
}
