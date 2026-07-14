import TrustBadge from "./TrustBadge";

export default function ProfileHeader() {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-400 text-3xl font-black text-white shadow-lg">
          AK
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Anna Kowalska
              </h1>

              <p className="mt-2 text-slate-500">
                📍 Gdańsk
              </p>

              <p className="mt-1 text-slate-500">
                🏡 Sąsiad od lipca 2026
              </p>

              <p className="mt-3 font-semibold text-amber-500">
                ★★★★★ <span className="text-slate-600">4,9 (37 opinii)</span>
              </p>
            </div>

            <TrustBadge level="Zaufany Sąsiad" />
          </div>
        </div>
      </div>
    </section>
  );
}
