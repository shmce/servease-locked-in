import { toast } from "sonner";

export function notifyBackendRequired(feature: string, endpoint?: string) {
  toast.error(`${feature} needs backend support`, {
    description: endpoint
      ? `Required endpoint: ${endpoint}`
      : "No backend endpoint is available for this action yet.",
  });
}
