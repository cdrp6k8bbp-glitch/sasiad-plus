import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export default function RejestracjaPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-2xl font-black text-green-700">
          Sąsiad+
        </Link>

        <p className="mt-10 font-semibold text-green-700">Dołącz do nas</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Załóż konto Sąsiad+
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Pożyczaj rzeczy, pomagaj innym i buduj zaufanie w swojej okolicy.
        </p>

        <AuthForm mode="register" />
      </div>
    </main>
  );
}
