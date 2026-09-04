import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const verificationErrors: Record<string, string> = {
  TOKEN_EXPIRED: "Link aktywacyjny wygasł.",
  INVALID_TOKEN: "Link aktywacyjny jest nieprawidłowy lub został już użyty.",
};

export default async function EmailPotwierdzonyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  if (params.error) {
    return (
      <main className="min-h-screen bg-[#f7faf8] px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-md rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="text-4xl">⚠️</div>
          <h1 className="mt-5 text-3xl font-black">Nie udało się potwierdzić adresu</h1>
          <p className="mt-4 leading-7 text-slate-600">
            {verificationErrors[params.error] ?? "Weryfikacja adresu e-mail nie powiodła się."}
          </p>
          <div className="mt-7 grid gap-3">
            <Link href="/sprawdz-email" className="rounded-2xl bg-green-700 px-6 py-4 font-black text-white hover:bg-green-800">
              Wyślij nowy link
            </Link>
            <Link href="/logowanie" className="font-bold text-green-700 hover:underline">
              Przejdź do logowania
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/profil/edytuj?nowe-konto=1");
  }

  redirect("/logowanie?email-potwierdzony=1");
}
