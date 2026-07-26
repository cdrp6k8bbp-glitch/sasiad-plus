import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import SecurityForm from "@/components/auth/SecurityForm";
import { unblockUser } from "@/app/blokady/actions";
import { auth } from "@/lib/auth";
import { getBlockedUsers } from "@/lib/user-blocks";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ odblokowano?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const params = await searchParams;

  if (!session) {
    redirect("/logowanie?redirect=/profil/bezpieczenstwo");
  }

  const blockedUsers = await getBlockedUsers(session.user.id);

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <AuthNav userName={session.user.name} />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Link href="/profil" className="font-semibold text-green-700 hover:underline">
          ← Wróć do profilu
        </Link>

        <section className="mt-7 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="font-semibold text-green-700">Ochrona konta</p>
          <h1 className="mt-1 text-4xl font-black">Bezpieczeństwo</h1>
          <p className="mt-3 leading-7 text-slate-500">
            Zadbaj o unikalne hasło i zakończ sesje na urządzeniach, których już
            nie używasz.
          </p>
          <SecurityForm />
        </section>

        <section className="mt-7 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="font-semibold text-green-700">Kontakty</p>
          <h2 className="mt-1 text-3xl font-black">Zablokowani użytkownicy</h2>
          <p className="mt-3 leading-7 text-slate-500">
            Zablokowane osoby nie mogą wymieniać z Tobą wiadomości ani wysyłać
            próśb o rezerwację.
          </p>

          {params.odblokowano === "1" && (
            <p className="mt-5 rounded-2xl bg-green-50 px-5 py-4 font-bold text-green-800">
              ✓ Użytkownik został odblokowany.
            </p>
          )}

          {blockedUsers.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-slate-500">
              Nie blokujesz obecnie żadnego użytkownika.
            </p>
          ) : (
            <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link
                    href={`/u/${user.id}`}
                    className="font-bold text-slate-800 hover:text-green-700 hover:underline"
                  >
                    {user.name}
                  </Link>
                  <form action={unblockUser}>
                    <input type="hidden" name="user_id" value={user.id} />
                    <input
                      type="hidden"
                      name="return_to"
                      value="/profil/bezpieczenstwo"
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Odblokuj
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
