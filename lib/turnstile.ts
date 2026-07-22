const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const TURNSTILE_ERROR_CODE = "TURNSTILE_FAILED";
export const TURNSTILE_ERROR_MESSAGE =
  "Weryfikacja antybotowa nie powiodła się. Spróbuj ponownie.";

type TurnstileVerification = {
  success: boolean;
  action?: string;
};

export async function verifyTurnstileRequest(
  request: Request,
  secret: string | undefined,
): Promise<boolean> {
  const token = request.headers.get("x-turnstile-token")?.trim();

  if (!secret || !token) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: crypto.randomUUID(),
  });
  const clientIp = request.headers.get("cf-connecting-ip");

  if (clientIp) {
    body.set("remoteip", clientIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      return false;
    }

    const result = (await response.json()) as TurnstileVerification;
    return result.success === true && result.action === "turnstile-spin-v2";
  } catch {
    return false;
  }
}
