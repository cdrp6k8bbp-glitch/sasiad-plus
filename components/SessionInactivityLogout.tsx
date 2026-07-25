"use client";

import { useEffect } from "react";
import { signOut } from "@/lib/auth-client";

const INACTIVITY_LIMIT_MS = 5 * 60 * 1000;
const ACTIVITY_STORAGE_KEY = "sasiad-plus:last-activity";
const ACTIVITY_THROTTLE_MS = 1000;

export default function SessionInactivityLogout({
  sessionUserId,
}: {
  sessionUserId: string | null;
}) {
  useEffect(() => {
    if (!sessionUserId) return;

    let timeoutId: number | undefined;
    let lastActivity = Date.now();
    let lastRecordedActivity = 0;
    let isSigningOut = false;

    function readSharedActivity(): number | null {
      try {
        const storedValue = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
        const parsedValue = storedValue ? Number(storedValue) : NaN;
        return Number.isFinite(parsedValue) ? parsedValue : null;
      } catch {
        return null;
      }
    }

    function writeSharedActivity(value: number) {
      try {
        window.localStorage.setItem(ACTIVITY_STORAGE_KEY, String(value));
      } catch {
        // Wylogowanie nadal działa, nawet jeśli przeglądarka blokuje localStorage.
      }
    }

    async function logoutAfterInactivity() {
      if (isSigningOut) return;

      const sharedActivity = readSharedActivity();
      if (sharedActivity && sharedActivity > lastActivity) {
        lastActivity = sharedActivity;
      }

      const remainingTime =
        INACTIVITY_LIMIT_MS - (Date.now() - lastActivity);

      if (remainingTime > 0) {
        scheduleLogout();
        return;
      }

      isSigningOut = true;

      try {
        await signOut();
      } finally {
        window.location.replace("/logowanie?wylogowano=bezczynnosc");
      }
    }

    function scheduleLogout() {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      const remainingTime = Math.max(
        0,
        INACTIVITY_LIMIT_MS - (Date.now() - lastActivity),
      );
      timeoutId = window.setTimeout(logoutAfterInactivity, remainingTime);
    }

    function recordActivity() {
      if (isSigningOut) return;

      const now = Date.now();
      if (now - lastRecordedActivity < ACTIVITY_THROTTLE_MS) return;

      lastRecordedActivity = now;
      lastActivity = now;
      writeSharedActivity(now);
      scheduleLogout();
    }

    function handleSharedActivity(event: StorageEvent) {
      if (event.key !== ACTIVITY_STORAGE_KEY || !event.newValue) return;

      const activityTime = Number(event.newValue);
      if (!Number.isFinite(activityTime) || activityTime <= lastActivity) return;

      lastActivity = activityTime;
      scheduleLogout();
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;

      const sharedActivity = readSharedActivity();
      if (sharedActivity && sharedActivity > lastActivity) {
        lastActivity = sharedActivity;
      }

      void logoutAfterInactivity();
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    writeSharedActivity(lastActivity);
    scheduleLogout();

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, recordActivity, { passive: true });
    }
    window.addEventListener("storage", handleSharedActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, recordActivity);
      }
      window.removeEventListener("storage", handleSharedActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionUserId]);

  return null;
}
