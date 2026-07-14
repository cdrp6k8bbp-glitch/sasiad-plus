import Link from "next/link";

type OwnerSummaryProps = {
  compact?: boolean;
};

export default function OwnerSummary({ compact = false }: OwnerSummaryProps) {
  if (compact) {
    return (
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Link href="/profil" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-400 text-sm font-black text-white">
            AK
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              Anna Kowalska
            </p>
            <p className="truncate text-xs font-semibold text-violet-700">
              🟣 Zaufany Sąsiad
            </p>
          </div>
        </Link>

        <Link
          href="/profil"
          className="shrink-0 text-xs font-bold text-green-700 hover:underline"
        >
          Profil →
        </Link>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">Wystawiający</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-400 text-lg font-black text-white">
          AK
        </div>

        <div>
          <p className="text-lg font-black text-slate-900">Anna Kowalska</p>
          <p className="mt-1 text-sm font-bold text-violet-700">
            🟣 Zaufany Sąsiad
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">Sąsiad od</dt>
          <dd className="mt-1 font-bold">lipca 2026</dd>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">Ocena</dt>
          <dd className="mt-1 font-bold">★ 4,9</dd>
        </div>

        <div className="col-span-2 rounded-2xl bg-green-50 p-3 text-green-900">
          <dt className="text-green-700">Historia</dt>
          <dd className="mt-1 font-bold">43 udane wypożyczenia</dd>
        </div>
      </dl>

      <Link
        href="/profil"
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-green-700 px-5 py-3 font-bold text-green-700 transition hover:bg-green-50"
      >
        Zobacz profil
      </Link>
    </section>
  );
}
