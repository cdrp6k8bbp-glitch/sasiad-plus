import type { TrustLevel } from "@/lib/trust";

const styles: Record<TrustLevel, string> = {
  "Nowy Sąsiad": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Zweryfikowany Sąsiad": "bg-sky-50 text-sky-700 ring-sky-200",
  "Zaufany Sąsiad": "bg-violet-50 text-violet-700 ring-violet-200",
  "Ambasador Sąsiedztwa": "bg-amber-50 text-amber-800 ring-amber-200",
};

const icons: Record<TrustLevel, string> = {
  "Nowy Sąsiad": "🟢",
  "Zweryfikowany Sąsiad": "🔵",
  "Zaufany Sąsiad": "🟣",
  "Ambasador Sąsiedztwa": "🟡",
};

export default function TrustBadge({ level }: { level: TrustLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${styles[level]}`}
    >
      <span aria-hidden>{icons[level]}</span>
      {level}
    </span>
  );
}
