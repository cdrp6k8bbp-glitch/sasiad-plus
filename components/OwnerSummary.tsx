import Link from "next/link";

type OwnerSummaryProps = {
  compact?: boolean;
  ownerId?: string | null;
  ownerName?: string | null;
  rating?: number | null;
  reviewCount?: number;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function OwnerSummary({
  compact = false,
  ownerId,
  ownerName,
  rating,
  reviewCount = 0,
}: OwnerSummaryProps) {
  const displayName = ownerName ?? "Ogłoszenie społeczności";
  const ownerInitials = ownerName ? initials(ownerName) : "S+";

  if (compact) {
    return (
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-400 text-sm font-black text-white">
            {ownerInitials}
          </div>

          <div className="min-w-0">
            {ownerId ? (
              <Link
                href={`/u/${ownerId}`}
                className="block truncate text-sm font-bold text-slate-900 hover:text-green-700"
              >
                {displayName}
              </Link>
            ) : (
              <p className="truncate text-sm font-bold text-slate-900">
                {displayName}
              </p>
            )}
            <p className="truncate text-xs font-semibold text-emerald-700">
              {ownerName ? "🟢 Nowy Sąsiad" : "Starsze ogłoszenie"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">Wystawiający</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-400 text-lg font-black text-white">
          {ownerInitials}
        </div>

        <div>
          {ownerId ? (
            <Link
              href={`/u/${ownerId}`}
              className="text-lg font-black text-slate-900 hover:text-green-700"
            >
              {displayName}
            </Link>
          ) : (
            <p className="text-lg font-black text-slate-900">{displayName}</p>
          )}
          <p className="mt-1 text-sm font-bold text-emerald-700">
            {ownerName ? "🟢 Nowy Sąsiad" : "Starsze ogłoszenie"}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">Sąsiad od</dt>
          <dd className="mt-1 font-bold">2026</dd>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">Ocena</dt>
          <dd className="mt-1 font-bold">
            {rating !== null && rating !== undefined
              ? `⭐ ${rating.toFixed(1)} (${reviewCount})`
              : "Brak ocen"}
          </dd>
        </div>

        <div className="col-span-2 rounded-2xl bg-green-50 p-3 text-green-900">
          <dt className="text-green-700">Historia</dt>
          <dd className="mt-1 font-bold">
            {ownerName ? "Nowe konto" : "Ogłoszenie sprzed kont użytkowników"}
          </dd>
        </div>
      </dl>

      {ownerId && (
        <Link
          href={`/u/${ownerId}`}
          className="mt-4 inline-flex font-bold text-green-700 hover:underline"
        >
          Zobacz profil i opinie →
        </Link>
      )}
    </section>
  );
}
