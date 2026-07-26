import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import BlockUserButton from "@/components/safety/BlockUserButton";
import ReportForm from "@/components/safety/ReportForm";
import { auth } from "@/lib/auth";
import {
  getConversationForUser,
  getMessages,
  markConversationAsRead,
} from "@/lib/messages";
import { sendMessage } from "../actions";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`${value.replace(" ", "T")}Z`));
}

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zgloszono?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { id } = await params;
  const query = await searchParams;
  const conversationId = Number(id);

  if (!session) {
    redirect(`/logowanie?redirect=/wiadomosci/${id}`);
  }

  if (!Number.isInteger(conversationId) || conversationId < 1) {
    notFound();
  }

  const conversation = await getConversationForUser(
    conversationId,
    session.user.id,
  );

  if (!conversation) {
    notFound();
  }

  await markConversationAsRead(conversation.id, session.user.id);
  const messages = await getMessages(conversation.id);
  const otherUserName =
    conversation.buyer_id === session.user.id
      ? conversation.seller_name
      : conversation.buyer_name;
  const otherUserId =
    conversation.buyer_id === session.user.id
      ? conversation.seller_id
      : conversation.buyer_id;
  const sendMessageForConversation = sendMessage.bind(null, conversation.id);

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <AuthNav userName={session.user.name} />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <Link
          href="/wiadomosci"
          className="font-semibold text-green-700 hover:underline"
        >
          ← Wszystkie wiadomości
        </Link>

        <section className="mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 md:p-6">
            <p className="text-sm font-semibold text-green-700">
              {conversation.listing_title}
            </p>
            <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-black">{otherUserName}</h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  <Link
                    href={`/ogloszenie/${conversation.listing_id}`}
                    className="text-sm font-semibold text-slate-500 hover:text-green-700"
                  >
                    Zobacz ogłoszenie →
                  </Link>
                  <Link
                    href={`/u/${otherUserId}`}
                    className="text-sm font-semibold text-slate-500 hover:text-green-700"
                  >
                    Zobacz profil →
                  </Link>
                </div>
              </div>
              <BlockUserButton
                userId={otherUserId}
                userName={otherUserName}
                isBlocked={false}
                returnTo="/wiadomosci"
              />
            </div>
          </div>

          {query.zgloszono && (
            <p className="border-b border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-800">
              {query.zgloszono === "istnieje"
                ? "Ta wiadomość została już przez Ciebie zgłoszona."
                : "✓ Zgłoszenie zostało przekazane do moderacji."}
            </p>
          )}

          <div className="min-h-[360px] space-y-4 bg-slate-50 p-4 md:p-6">
            {messages.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <div className="text-5xl">👋</div>
                <p className="mt-4 font-semibold">
                  Rozpocznij rozmowę o tym ogłoszeniu.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = message.sender_id === session.user.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-5 py-3 md:max-w-[70%] ${
                        isMine
                          ? "rounded-br-lg bg-green-700 text-white"
                          : "rounded-bl-lg border border-slate-200 bg-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-6">
                        {message.body}
                      </p>
                      <p
                        className={`mt-2 text-xs ${
                          isMine ? "text-green-100" : "text-slate-400"
                        }`}
                      >
                        {formatDate(message.created_at)}
                      </p>
                      {!isMine && (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <ReportForm
                            targetType="message"
                            targetId={message.id}
                            label="Zgłoś wiadomość"
                            compact
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form
            action={sendMessageForConversation}
            className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row md:p-6"
          >
            <label htmlFor="body" className="sr-only">
              Treść wiadomości
            </label>
            <textarea
              id="body"
              name="body"
              required
              maxLength={2000}
              rows={2}
              placeholder="Napisz wiadomość…"
              className="min-h-14 flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
            />
            <button
              type="submit"
              className="rounded-2xl bg-green-700 px-6 py-3 font-black text-white transition hover:bg-green-800"
            >
              Wyślij
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
