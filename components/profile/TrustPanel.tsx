import type { TrustLevel, TrustStats } from "@/lib/trust";

const levelStyles: Record<TrustLevel, string> = {
  "Nowy Sąsiad": "border-emerald-200 bg-emerald-50 text-emerald-900",
  "Zweryfikowany Sąsiad": "border-sky-200 bg-sky-50 text-sky-900",
  "Zaufany Sąsiad": "border-violet-200 bg-violet-50 text-violet-900",
  "Ambasador Sąsiedztwa": "border-amber-200 bg-amber-50 text-amber-900",
};

const levelIcons: Record<TrustLevel, string> = {
  "Nowy Sąsiad": "🟢",
  "Zweryfikowany Sąsiad": "🔵",
  "Zaufany Sąsiad": "🟣",
  "Ambasador Sąsiedztwa": "🟡",
};

function nextStep(level: TrustLevel): string {
  if (level === "Nowy Sąsiad") {
    return "Zakończ pierwszą transakcję, aby zdobyć poziom Zweryfikowanego Sąsiada.";
  }
  if (level === "Zweryfikowany Sąsiad") {
    return "5 udanych transakcji, 3 opinie i średnia co najmniej 4,5 odblokują poziom Zaufanego Sąsiada.";
  }
  if (level === "Zaufany Sąsiad") {
    return "10 udanych transakcji, 5 opinii i średnia co najmniej 4,7 odblokują poziom Ambasadora.";
  }
  return "To najwyższy poziom zaufania w Sąsiad+. Dziękujemy za budowanie społeczności!";
}

export default function TrustPanel({
  level,
  stats,
}: {
  level: TrustLevel;
  stats: TrustStats;
}) {
  const checks = [
    `${stats.completedTotal} ${stats.completedTotal === 1 ? "udana transakcja" : "udanych transakcji"}`,
    `${stats.reviewCount} ${stats.reviewCount === 1 ? "otrzymana opinia" : "otrzymanych opinii"}`,
    stats.averageRating === null
      ? "Brak średniej ocen"
      : `Średnia ocen ${stats.averageRating.toFixed(1)}/5`,
  ];

  return (
    <section className={`rounded-[32px] border p-6 md:p-8 ${levelStyles[level]}`}>
      <p className="text-sm font-bold uppercase tracking-wider opacity-70">
        Poziom zaufania
      </p>

      <h2 className="mt-2 text-2xl font-black">
        {levelIcons[level]} {level}
      </h2>

      <p className="mt-3 max-w-3xl leading-7 opacity-80">{nextStep(level)}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {checks.map((check) => (
          <div
            key={check}
            className="rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm"
          >
            ✔ {check}
          </div>
        ))}
      </div>
    </section>
  );
}
