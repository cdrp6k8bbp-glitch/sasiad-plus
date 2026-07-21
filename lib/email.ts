const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

type PasswordResetEmail = {
  apiKey: string;
  recipient: string;
  resetUrl: string;
};

type EmailVerificationEmail = {
  apiKey: string;
  recipient: string;
  verificationUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function sendPasswordResetEmail({
  apiKey,
  recipient,
  resetUrl,
}: PasswordResetEmail) {
  if (!apiKey) {
    throw new Error("Brak konfiguracji usługi wysyłającej wiadomości.");
  }

  const safeResetUrl = escapeHtml(resetUrl);
  const response = await fetch(RESEND_EMAILS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Sąsiad+ <noreply@sasiad-plus.com>",
      to: [recipient],
      subject: "Ustaw nowe hasło w Sąsiad+",
      text: [
        "Otrzymaliśmy prośbę o ustawienie nowego hasła do Twojego konta Sąsiad+.",
        "",
        `Ustaw nowe hasło: ${resetUrl}`,
        "",
        "Link jest ważny przez godzinę i można go użyć tylko raz.",
        "Jeśli to nie Ty wysłałeś tę prośbę, zignoruj tę wiadomość.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px; margin: 0 auto;">
          <p style="font-size: 22px; font-weight: 800; color: #15803d;">Sąsiad+</p>
          <h1 style="font-size: 28px; line-height: 1.2;">Ustaw nowe hasło</h1>
          <p>Otrzymaliśmy prośbę o ustawienie nowego hasła do Twojego konta.</p>
          <p style="margin: 28px 0;">
            <a href="${safeResetUrl}" style="display: inline-block; border-radius: 14px; background: #15803d; color: #ffffff; padding: 14px 22px; font-weight: 700; text-decoration: none;">Ustaw nowe hasło</a>
          </p>
          <p>Link jest ważny przez godzinę i można go użyć tylko raz.</p>
          <p style="color: #64748b;">Jeśli to nie Ty wysłałeś tę prośbę, zignoruj tę wiadomość.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    console.error(
      JSON.stringify({
        event: "password_reset_email_failed",
        status: response.status,
      }),
    );
    throw new Error("Nie udało się wysłać wiadomości z resetem hasła.");
  }
}

export async function sendEmailVerificationEmail({
  apiKey,
  recipient,
  verificationUrl,
}: EmailVerificationEmail) {
  if (!apiKey) {
    throw new Error("Brak konfiguracji usługi wysyłającej wiadomości.");
  }

  const safeVerificationUrl = escapeHtml(verificationUrl);
  const response = await fetch(RESEND_EMAILS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Sąsiad+ <noreply@sasiad-plus.com>",
      to: [recipient],
      subject: "Potwierdź adres e-mail w Sąsiad+",
      text: [
        "Potwierdź swój adres e-mail, aby korzystać z konta Sąsiad+.",
        "",
        `Potwierdź adres: ${verificationUrl}`,
        "",
        "Link jest ważny przez godzinę i można go użyć tylko raz.",
        "Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.",
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px; margin: 0 auto;">
          <p style="font-size: 22px; font-weight: 800; color: #15803d;">Sąsiad+</p>
          <h1 style="font-size: 28px; line-height: 1.2;">Potwierdź adres e-mail</h1>
          <p>Potwierdź swój adres e-mail, aby korzystać z konta Sąsiad+.</p>
          <p style="margin: 28px 0;">
            <a href="${safeVerificationUrl}" style="display: inline-block; border-radius: 14px; background: #15803d; color: #ffffff; padding: 14px 22px; font-weight: 700; text-decoration: none;">Potwierdź adres e-mail</a>
          </p>
          <p>Link jest ważny przez godzinę i można go użyć tylko raz.</p>
          <p style="color: #64748b;">Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    console.error(
      JSON.stringify({
        event: "email_verification_failed",
        status: response.status,
      }),
    );
    throw new Error("Nie udało się wysłać wiadomości potwierdzającej.");
  }
}
