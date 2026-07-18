import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import SecurityForm from "@/components/auth/SecurityForm";
import { auth } from "@/lib/auth";

export default async function SecurityPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil/bezpieczenstwo");
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <AuthNav />
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
      </div>
    </main>
  );
}
