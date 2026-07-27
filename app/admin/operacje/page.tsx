import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
  getOperationalDashboard,
  type EmailDeliveryStatus,
} from "@/lib/email-delivery";

const statusLabels: Record<EmailDeliveryStatus, string> = {
  accepted: "Przyjęta przez Resend",
  scheduled: "Zaplanowana",
  sent: "Wysłana",
  delivered: "Dostarczona",
  delivery_delayed: "Opóźniona",
  bounced: "Odrzucona przez skrzynkę",
  complained: "Oznaczona jako spam",
  failed: "Błąd wysyłki",
  suppressed: "Wstrzymana",
  opened: "Otwarta",
  clicked: "Kliknięta",
  unknown: "Nieznany",
};

const kindLabels: Record<string, string> = {
  password_reset: "Reset hasła",
  email_verification: "Potwierdzenie konta",
  reservation_update: "Aktualizacja rezerwacji",
  operations_alert: "Alarm techniczny",
  unknown: "Inna wiadomość",
};

const problemStatuses = new Set<EmailDeliveryStatus>([
  "bounced",
  "complained",
  "failed",
  "suppressed",
]);

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(value.endsWith("Z") ? value : `${value}Z`));
}

export default async function OperationsPage() {
  await requireAdmin("/admin/operacje");
  const dashboard = await getOperationalDashboard();
  const latestCheck = dashboard.checks[0];
  const latestStatus =
    latestCheck?.status === "ok"
      ? "Wszystko działa"
      : latestCheck?.status === "warning"
        ? "Wymaga sprawdzenia"
        : latestCheck?.status === "failed"
          ? "Kontrola nie powiodła się"
          : "Czekamy na pierwszą kontrolę";

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <Link href="/admin" className="font-bold text-slate-600 hover:text-green-700">
            Panel moderacji
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <p className="font-semibold text-green-700">Stan techniczny</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
          Centrum operacyjne
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Kontrola codziennego utrzymania danych i dostarczania wiadomości
          e-mail. Monitoring nie zapisuje adresów odbiorców.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Ostatnia kontrola
            </p>
            <p
              className={`mt-2 text-2xl font-black ${
                latestCheck?.status === "ok" ? "text-green-700" : "text-amber-700"
              }`}
            >
              {latestStatus}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {formatDate(latestCheck?.started_at ?? null)}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Zdarzenia e-mail
            </p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {dashboard.webhookEventCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Potwierdzenia odebrane z Resend
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              E-maile do sprawdzenia
            </p>
            <p
              className={`mt-2 text-3xl font-black ${
                dashboard.problemCount === 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {dashboard.problemCount}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Błędy, odbicia, spam lub wstrzymania
            </p>
          </article>
        </section>

        <section className="mt-12" aria-labelledby="email-delivery-heading">
          <h2 id="email-delivery-heading" className="text-3xl font-black">
            Ostatnie wiadomości e-mail
          </h2>
          {dashboard.deliveries.length === 0 ? (
            <p className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-7 text-slate-600">
              Nie ma jeszcze zapisanych statusów. Pojawią się po wysłaniu
              wiadomości i podłączeniu webhooka Resend.
            </p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {dashboard.deliveries.map((delivery) => (
                <article
                  key={delivery.provider_message_id}
                  className="flex flex-col gap-3 border-b border-slate-100 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black text-slate-800">
                      {kindLabels[delivery.email_kind] ?? delivery.email_kind}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      ID: {delivery.provider_message_id.slice(0, 12)}…
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p
                      className={`font-bold ${
                        problemStatuses.has(delivery.status)
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      {statusLabels[delivery.status] ?? delivery.status}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(delivery.updated_at)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12" aria-labelledby="checks-heading">
          <h2 id="checks-heading" className="text-3xl font-black">
            Historia kontroli
          </h2>
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {dashboard.checks.length === 0 ? (
              <p className="p-7 text-slate-600">
                Pierwsza kontrola pojawi się po uruchomieniu harmonogramu.
              </p>
            ) : (
              dashboard.checks.map((check) => (
                <article
                  key={check.id}
                  className="flex flex-col gap-2 border-b border-slate-100 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p
                      className={`font-black ${
                        check.status === "ok" ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {check.status === "ok"
                        ? "Kontrola poprawna"
                        : check.status === "warning"
                          ? "Wymaga sprawdzenia"
                          : "Błąd kontroli"}
                    </p>
                    {check.error_message && (
                      <p className="mt-1 text-sm text-red-700">
                        {check.error_message}
                      </p>
                    )}
                  </div>
                  <time className="text-sm font-semibold text-slate-500">
                    {formatDate(check.started_at)}
                  </time>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
