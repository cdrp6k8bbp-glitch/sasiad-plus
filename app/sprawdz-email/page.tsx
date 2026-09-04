import Link from "next/link";
import VerificationPending from "@/components/auth/VerificationPending";

export default function SprawdzEmailPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-2xl font-black text-green-700">
          Sąsiad+
        </Link>
        <VerificationPending />
      </div>
    </main>
  );
}
