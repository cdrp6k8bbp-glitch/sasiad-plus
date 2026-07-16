import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { auth } from "@/lib/auth";

export default async function ProfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil");
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>

          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
        <Link
          href="/"
          className="inline-flex font-semibold text-green-700 hover:underline"
        >
          ← Wróć na stronę główną
        </Link>

        <ProfileHeader
          name={session.user.name}
          email={session.user.email}
          createdAt={new Date(session.user.createdAt)}
        />

        <section className="rounded-[32px] border border-green-200 bg-green-50 p-6 md:p-8">
          <p className="font-semibold text-green-700">Konto aktywne</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight">
            Jesteś zalogowana/y
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Rejestracja, logowanie, sesja i wylogowanie są już połączone z
            Better Auth. W następnym sprincie przypiszemy ogłoszenia do tego
            konta i pokażemy tutaj sekcję „Moje ogłoszenia”.
          </p>
        </section>

        <Link
          href="/dodaj"
          className="inline-flex rounded-full bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
        >
          + Dodaj ogłoszenie
        </Link>
      </div>
    </main>
  );
}
