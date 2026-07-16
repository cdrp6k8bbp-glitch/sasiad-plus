import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export default async function LogowaniePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectTo =
    params.redirect?.startsWith("/") && !params.redirect.startsWith("//")
      ? params.redirect
      : "/profil";

  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-2xl font-black text-green-700">
          Sąsiad+
        </Link>

        <p className="mt-10 font-semibold text-green-700">Witaj ponownie</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Zaloguj się do Sąsiad+
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Wróć do swoich ogłoszeń i sąsiedzkiej społeczności.
        </p>

        <AuthForm mode="login" redirectTo={redirectTo} />
      </div>
    </main>
  );
}
