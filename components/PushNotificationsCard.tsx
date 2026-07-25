"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "disabled" | "enabled" | "unsupported";

function applicationServerKey(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
  const decoded = atob(base64);
  const buffer = new ArrayBuffer(decoded.length);
  const output = new Uint8Array(buffer);

  for (let index = 0; index < decoded.length; index += 1) {
    output[index] = decoded.charCodeAt(index);
  }

  return buffer;
}

async function serviceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const current = await navigator.serviceWorker.getRegistration("/");

  return (
    current ??
    (await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    }))
  );
}

async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const response = await fetch("/api/push-subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error("subscription_save_failed");
  }
}

export default function PushNotificationsCard() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      queueMicrotask(() => setStatus("unsupported"));
      return undefined;
    }

    let active = true;

    serviceWorkerRegistration()
      .then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await saveSubscription(subscription);
        }

        if (active) {
          setStatus(subscription ? "enabled" : "disabled");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("disabled");
          setMessage("Nie udało się sprawdzić ustawień powiadomień.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function enableNotifications() {
    setBusy(true);
    setMessage("");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage(
          "Przeglądarka nie otrzymała zgody. Możesz ją zmienić w ustawieniach witryny.",
        );
        return;
      }

      const configResponse = await fetch("/api/push-subscriptions", {
        cache: "no-store",
      });
      const config = (await configResponse.json()) as {
        publicKey?: string;
      };

      if (!configResponse.ok || !config.publicKey) {
        throw new Error("push_not_configured");
      }

      const registration = await serviceWorkerRegistration();
      const current = await registration.pushManager.getSubscription();
      const subscription =
        current ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey(config.publicKey),
        }));

      try {
        await saveSubscription(subscription);
      } catch (error) {
        if (!current) {
          await subscription.unsubscribe();
        }
        throw error;
      }

      setStatus("enabled");
      setMessage("Powiadomienia na tym urządzeniu są włączone.");
    } catch {
      setMessage("Nie udało się włączyć powiadomień. Spróbuj ponownie później.");
    } finally {
      setBusy(false);
    }
  }

  async function disableNotifications() {
    setBusy(true);
    setMessage("");

    try {
      const registration = await serviceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch("/api/push-subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        if (!response.ok) {
          throw new Error("subscription_delete_failed");
        }

        await subscription.unsubscribe();
      }

      setStatus("disabled");
      setMessage("Powiadomienia na tym urządzeniu są wyłączone.");
    } catch {
      setMessage("Nie udało się wyłączyć powiadomień. Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-[28px] border border-green-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-green-700">Powiadomienia na urządzeniu</p>
          <h2 className="mt-1 text-2xl font-black">
            Otrzymuj informacje od razu
          </h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Włącz bezpłatne powiadomienia o nowych i zmienionych rezerwacjach.
          </p>
        </div>

        {status === "unsupported" ? (
          <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-600">
            Przeglądarka nie obsługuje
          </span>
        ) : status === "enabled" ? (
          <button
            type="button"
            onClick={disableNotifications}
            disabled={busy}
            className="rounded-full border border-slate-300 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Wyłączanie…" : "Wyłącz"}
          </button>
        ) : (
          <button
            type="button"
            onClick={enableNotifications}
            disabled={busy || status === "checking"}
            className="rounded-full bg-green-700 px-5 py-2.5 font-bold text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
          >
            {busy || status === "checking" ? "Sprawdzanie…" : "Włącz"}
          </button>
        )}
      </div>

      {message && (
        <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">
          {message}
        </p>
      )}
    </section>
  );
}
