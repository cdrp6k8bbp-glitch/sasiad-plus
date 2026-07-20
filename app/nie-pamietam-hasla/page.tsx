import Link from "next/link";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function NiePamietamHaslaPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-2xl font-black text-green-700">Sąsiad+</Link>
        <p className="mt-10 font-semibold text-green-700">Odzyskaj dostęp</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Nie pamiętasz hasła?</h1>
        <p className="mt-4 leading-7 text-slate-600">Podaj adres e-mail użyty podczas rejestracji. Wyślemy Ci bezpieczny link do ustawienia nowego hasła.</p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
