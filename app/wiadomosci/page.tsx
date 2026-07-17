import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import { auth } from "@/lib/auth";
import { getConversationsForUser } from "@/lib/messages";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${value.replace(" ", "T")}Z`));
}

export default async function WiadomosciPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/wiadomosci");
  }

  const conversations = await getConversationsForUser(session.user.id);

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <p className="font-semibold text-green-700">Twoje kontakty</p>
        <h1 className="mt-1 text-4xl font-black tracking-tight">Wiadomości</h1>

        {conversations.length === 0 ? (
          <div className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-5xl">💬</div>
            <h2 className="mt-4 text-2xl font-black">Brak rozmów</h2>
            <p className="mt-2 text-slate-600">
              Otwórz ogłoszenie innego użytkownika i wybierz „Napisz do
              właściciela”.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-green-700 px-6 py-3 font-bold text-white"
            >
              Przeglądaj ogłoszenia
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/wiadomosci/${conversation.id}`}
                className={`flex items-center gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-green-50 ${
                  conversation.unread_count > 0 ? "bg-green-50/70" : ""
                }`}
              >
                <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
                  conversation.unread_count > 0
                    ? "bg-green-700 text-white"
                    : "bg-green-100"
                }`}>
                  💬
                  {conversation.unread_count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                      {conversation.unread_count > 99
                        ? "99+"
                        : conversation.unread_count}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`truncate ${
                      conversation.unread_count > 0 ? "font-black" : "font-bold"
                    }`}>
                      {conversation.other_user_name}
                    </p>
                    <time className="shrink-0 text-xs text-slate-400">
                      {formatDate(conversation.updated_at)}
                    </time>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-green-700">
                    {conversation.listing_title}
                  </p>
                  <p className={`mt-1 truncate text-sm ${
                    conversation.unread_count > 0
                      ? "font-bold text-slate-800"
                      : "text-slate-500"
                  }`}>
                    {conversation.last_message ?? "Rozmowa rozpoczęta"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
