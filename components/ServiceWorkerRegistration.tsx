"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .catch((error: unknown) => {
        console.error(
          JSON.stringify({
            event: "service_worker_registration_failed",
            message: error instanceof Error ? error.message : "unknown_error",
          }),
        );
      });
  }, []);

  return null;
}
