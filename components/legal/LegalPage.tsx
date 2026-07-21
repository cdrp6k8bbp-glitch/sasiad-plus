import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <Link href="/" className="font-semibold text-green-700 hover:underline">
            Wróć na stronę główną
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <p className="font-bold text-green-700">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          {intro}
        </p>
        <div className="mt-10 space-y-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          {children}
        </div>
      </article>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-black tracking-tight">{title}</h2>
      <div className="space-y-3 leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export const legalListClassName = "ml-5 list-disc space-y-2";
