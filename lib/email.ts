import { recordAcceptedEmail } from "@/lib/email-delivery";

const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

type PasswordResetEmail = {
  apiKey: string;
  db: D1Database;
  recipient: string;
  resetUrl: string;
};

type EmailVerificationEmail = {
  apiKey: string;
  db: D1Database;
  recipient: string;
  verificationUrl: string;
};

type ReservationUpdateEmail = {
  apiKey: string;
  db: D1Database;
  recipient: string;
  subject: string;
  heading: string;
  body: string;
  actionUrl: string;
};

type OperationalAlertEmail = {
  apiKey: string;
  db: D1Database;
  recipient: string;
  issues: string[];
  actionUrl: string;
};

type EmailPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  tags: Array<{ name: string; value: string }>;
};

type SendEmailInput = {
  apiKey: string;
  db: D1Database;
  kind: string;
  failureEvent: string;
  failureMessage: string;
  payload: EmailPayload;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function sendEmail({
  apiKey,
  db,
  kind,
  failureEvent,
  failureMessage,
  payload,
}: SendEmailInput): Promise<void> {
  if (!apiKey) {
    throw new Error("Brak konfiguracji usługi wysyłającej wiadomości.");
  }

  const response = await fetch(RESEND_EMAILS_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(
      JSON.stringify({
        event: failureEvent,
        status: response.status,
      }),
    );
    throw new Error(failureMessage);
  }

  const result = (await response.json()) as { id?: string };

  if (!result.id) {
    console.error(
      JSON.stringify({
        event: "email.accepted_without_provider_id",
        kind,
      }),
    );
    return;
  }

  try {
    await recordAcceptedEmail(db, result.id, kind);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "email.acceptance_tracking_failed",
        kind,
        message: error instanceof Error ? error.message : "unknown_error",
      }),
    );
  }
}

export async function sendPasswordResetEmail({
  apiKey,
  db,
  recipient,
  resetUrl,
}: PasswordResetEmail) {
  const safeResetUrl = escapeHtml(resetUrl);
  await sendEmail({
    apiKey,
    db,
    kind: "password_reset",
    failureEvent: "password_reset_email_failed",
    failureMessage: "Nie udało się wysłać wiadomości z resetem hasła.",
    payload: {
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
      tags: [{ name: "category", value: "password_reset" }],
    },
  });
}

export async function sendEmailVerificationEmail({
  apiKey,
  db,
  recipient,
  verificationUrl,
}: EmailVerificationEmail) {
  const safeVerificationUrl = escapeHtml(verificationUrl);
  await sendEmail({
    apiKey,
    db,
    kind: "email_verification",
    failureEvent: "email_verification_failed",
    failureMessage: "Nie udało się wysłać wiadomości potwierdzającej.",
    payload: {
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
      tags: [{ name: "category", value: "email_verification" }],
    },
  });
}

export async function sendReservationUpdateEmail({
  apiKey,
  db,
  recipient,
  subject,
  heading,
  body,
  actionUrl,
}: ReservationUpdateEmail) {
  const safeSubject = subject.replace(/[\r\n]+/g, " ").trim();
  const safeHeading = escapeHtml(heading);
  const safeBody = escapeHtml(body);
  const safeActionUrl = escapeHtml(actionUrl);
  await sendEmail({
    apiKey,
    db,
    kind: "reservation_update",
    failureEvent: "reservation_email_failed",
    failureMessage: "Nie udało się wysłać wiadomości o rezerwacji.",
    payload: {
      from: "Sąsiad+ <noreply@sasiad-plus.com>",
      to: [recipient],
      subject: safeSubject,
      text: [
        heading,
        "",
        body,
        "",
        `Zobacz rezerwacje: ${actionUrl}`,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px; margin: 0 auto;">
          <p style="font-size: 22px; font-weight: 800; color: #15803d;">Sąsiad+</p>
          <h1 style="font-size: 28px; line-height: 1.2;">${safeHeading}</h1>
          <p>${safeBody}</p>
          <p style="margin: 28px 0;">
            <a href="${safeActionUrl}" style="display: inline-block; border-radius: 14px; background: #15803d; color: #ffffff; padding: 14px 22px; font-weight: 700; text-decoration: none;">Zobacz rezerwacje</a>
          </p>
          <p style="color: #64748b;">To automatyczna wiadomość z platformy Sąsiad+.</p>
        </div>
      `,
      tags: [{ name: "category", value: "reservation_update" }],
    },
  });
}

export async function sendOperationalAlertEmail({
  apiKey,
  db,
  recipient,
  issues,
  actionUrl,
}: OperationalAlertEmail) {
  const safeActionUrl = escapeHtml(actionUrl);
  const safeIssues = issues.map(escapeHtml);

  await sendEmail({
    apiKey,
    db,
    kind: "operations_alert",
    failureEvent: "operations_alert_email_failed",
    failureMessage: "Nie udało się wysłać alarmu technicznego.",
    payload: {
      from: "Sąsiad+ <noreply@sasiad-plus.com>",
      to: [recipient],
      subject: "Sąsiad+: sprawdź stan techniczny aplikacji",
      text: [
        "Automatyczna kontrola Sąsiad+ wykryła problem:",
        "",
        ...issues.map((issue) => `- ${issue}`),
        "",
        `Otwórz centrum operacyjne: ${actionUrl}`,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px; margin: 0 auto;">
          <p style="font-size: 22px; font-weight: 800; color: #15803d;">Sąsiad+</p>
          <h1 style="font-size: 28px; line-height: 1.2;">Sprawdź stan techniczny</h1>
          <p>Automatyczna kontrola wykryła problem:</p>
          <ul>${safeIssues.map((issue) => `<li>${issue}</li>`).join("")}</ul>
          <p style="margin: 28px 0;">
            <a href="${safeActionUrl}" style="display: inline-block; border-radius: 14px; background: #15803d; color: #ffffff; padding: 14px 22px; font-weight: 700; text-decoration: none;">Otwórz centrum operacyjne</a>
          </p>
        </div>
      `,
      tags: [{ name: "category", value: "operations_alert" }],
    },
  });
}
