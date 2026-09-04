export const EMAIL_VERIFICATION_STORAGE_KEY =
  "sasiad-plus:verification-email";
export const EMAIL_VERIFICATION_CALLBACK_URL = "/email-potwierdzony";
export const EMAIL_VERIFICATION_RESEND_DELAY_SECONDS = 60;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function maskEmail(email: string) {
  const normalized = normalizeEmail(email);
  const atIndex = normalized.indexOf("@");

  if (atIndex <= 0) {
    return normalized;
  }

  const localPart = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);
  const visibleStart = localPart.slice(0, Math.min(2, localPart.length));
  const hiddenLength = Math.max(3, localPart.length - visibleStart.length);

  return `${visibleStart}${"•".repeat(hiddenLength)}@${domain}`;
}

export function getWebmailUrl(email: string) {
  const domain = normalizeEmail(email).split("@")[1];

  const providers: Record<string, string> = {
    "gmail.com": "https://mail.google.com/",
    "googlemail.com": "https://mail.google.com/",
    "o2.pl": "https://poczta.o2.pl/",
    "outlook.com": "https://outlook.live.com/mail/",
    "hotmail.com": "https://outlook.live.com/mail/",
    "icloud.com": "https://www.icloud.com/mail/",
    "wp.pl": "https://poczta.wp.pl/",
  };

  return domain ? providers[domain] ?? null : null;
}
