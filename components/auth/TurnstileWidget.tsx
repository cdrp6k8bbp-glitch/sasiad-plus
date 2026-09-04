"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

export const TURNSTILE_ERROR_CODE = "TURNSTILE_FAILED";

const TURNSTILE_RESET_EVENT = "sasiad-plus:turnstile-reset";

type TurnstileWidgetId = string | number;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          theme: "light";
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => TurnstileWidgetId;
      reset: (widgetId?: TurnstileWidgetId) => void;
      remove: (widgetId: TurnstileWidgetId) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onTokenChange?: (token: string | null) => void;
};

export function resetTurnstile() {
  window.dispatchEvent(new Event(TURNSTILE_RESET_EVENT));
}

export default function TurnstileWidget({
  onTokenChange,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const renderWidget = useCallback(() => {
    if (
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current !== null
    ) {
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: "0x4AAAAAAD7LLK8gur881DVk",
        action: "turnstile-spin-v2",
        theme: "light",
        callback: (token) => {
          setStatus("ready");
          onTokenChange?.(token);
        },
        "expired-callback": () => {
          setStatus("loading");
          onTokenChange?.(null);
          if (widgetIdRef.current !== null) {
            window.turnstile?.reset(widgetIdRef.current);
          }
        },
        "error-callback": () => {
          setStatus("error");
          onTokenChange?.(null);
        },
      });
    } catch {
      setStatus("error");
      onTokenChange?.(null);
    }
  }, [onTokenChange]);

  const retry = useCallback(() => {
    setStatus("loading");
    onTokenChange?.(null);

    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      return;
    }

    renderWidget();
  }, [onTokenChange, renderWidget]);

  useEffect(() => {
    const handleReset = () => retry();
    window.addEventListener(TURNSTILE_RESET_EVENT, handleReset);

    return () => {
      window.removeEventListener(TURNSTILE_RESET_EVENT, handleReset);
      if (widgetIdRef.current !== null) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget, retry]);

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatus((currentStatus) =>
        currentStatus === "loading" ? "error" : currentStatus,
      );
    }, 12_000);

    return () => window.clearTimeout(timeoutId);
  }, [status]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
        onError={() => setStatus("error")}
      />

      <div ref={containerRef} className="flex min-h-[65px] justify-center" />

      {status === "loading" && (
        <p className="mt-2 text-center text-sm font-semibold text-slate-600">
          Przygotowujemy zabezpieczenie…
        </p>
      )}

      {status === "error" && (
        <div className="mt-2 text-center">
          <p className="text-sm font-semibold text-red-700">
            Zabezpieczenie nie uruchomiło się.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-2 rounded-xl border border-green-700 bg-white px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-50"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}
    </div>
  );
}
