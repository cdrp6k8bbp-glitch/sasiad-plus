import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import { auth } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/notifications";
import { markAllNotificationsRead, openNotification } from "./actions";

const icons = {
  reservation_created: "📅",
  reservation_accepted: "✅",
  reservation_rejected: "↩️",
  reservation_cancelled: "❌",
  reservation_completed: "🤝",
  review_received: "⭐",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(`${value.replace(" ", "T")}Z`));
}

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/powiadomienia");
  }

  const notifications = await getNotificationsForUser(session.user.id);
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <Link href="/" className="font-semibold text-green-700 hover:underline">
          ← Wróć na stronę główną
        </Link>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-green-700">Bądź na bieżąco</p>
            <h1 className="mt-1 text-4xl font-black">Powiadomienia</h1>
            <p className="mt-2 text-slate-500">
              {unreadCount === 0
                ? "Wszystko przeczytane"
                : `${unreadCount} nieprzeczytanych`}
            </p>
          </div>

          {unreadCount > 0 && (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="rounded-full border border-green-700 px-5 py-2.5 font-bold text-green-700 transition hover:bg-green-50"
              >
                Oznacz wszystkie jako przeczytane
              </button>
            </form>
          )}
        </div>

        {notifications.length === 0 ? (
          <section className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-5xl">🔔</div>
            <h2 className="mt-4 text-2xl font-black">Na razie jest tu cicho</h2>
            <p className="mt-2 text-slate-500">
              Powiadomimy Cię o rezerwacjach, zakończonych transakcjach i opiniach.
            </p>
          </section>
        ) : (
          <div className="mt-8 space-y-3">
            {notifications.map((notification) => (
              <form key={notification.id} action={openNotification}>
                <input type="hidden" name="notification_id" value={notification.id} />
                <button
                  type="submit"
                  className={`flex w-full items-start gap-4 rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    notification.read_at
                      ? "border-slate-200 bg-white"
                      : "border-green-300 bg-green-50"
                  }`}
                >
                  <span className="text-3xl" aria-hidden="true">
                    {icons[notification.type]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-lg">{notification.title}</strong>
                      {!notification.read_at && (
                        <span className="rounded-full bg-green-700 px-2.5 py-1 text-xs font-black text-white">
                          Nowe
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block leading-6 text-slate-600">
                      {notification.body}
                    </span>
                    <span className="mt-2 block text-sm font-semibold text-slate-400">
                      {formatDate(notification.created_at)}
                    </span>
                  </span>
                </button>
              </form>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
