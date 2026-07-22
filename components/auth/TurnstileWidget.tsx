"use client";

import Script from "next/script";

export const TURNSTILE_ERROR_CODE = "TURNSTILE_FAILED";

declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
    };
  }
}

export function resetTurnstile() {
  window.turnstile?.reset();
}

export default function TurnstileWidget() {
  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div
        className="cf-turnstile min-h-[65px]"
        data-sitekey="0x4AAAAAAD7LLK8gur881DVk"
        data-action="turnstile-spin-v2"
        data-theme="light"
      />
    </>
  );
}
