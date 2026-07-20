import Link from "next/link";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

type ResetHaslaPageProps = {
  searchParams: Promise<{ token?: string | string[]; error?: string | string[] }>;
};

export default async function ResetHaslaPage({ searchParams }: ResetHaslaPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-2xl font-black text-green-700">Sąsiad+</Link>
        <p className="mt-10 font-semibold text-green-700">Bezpieczeństwo konta</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Ustaw nowe hasło</h1>
        <p className="mt-4 leading-7 text-slate-600">Nowe hasło powinno być długie i nieużywane w innych serwisach.</p>
        <ResetPasswordForm token={token} invalidLink={!token || error === "INVALID_TOKEN"} />
      </div>
    </main>
  );
}
