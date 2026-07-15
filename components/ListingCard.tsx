import Link from "next/link";
import OwnerSummary from "@/components/OwnerSummary";

type ListingProps = {
  id: number;
  icon: string;
  imageKey?: string | null;
  title: string;
  place: string;
  price: string;
  subcategory?: string | null;
};

function imageUrl(imageKey: string): string {
  return `/api/images/${imageKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export default function ListingCard({
  id,
  icon,
  imageKey,
  title,
  place,
  price,
  subcategory,
}: ListingProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
        {imageKey ? (
          <img
            src={imageUrl(imageKey)}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-7xl transition group-hover:scale-110">
            {icon}
          </span>
        )}

        <button
          type="button"
          aria-label="Dodaj do ulubionych"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl shadow"
        >
          ♡
        </button>

        <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-green-700 shadow">
          Dostępne
        </span>
      </div>

      <div className="p-5">
        {subcategory && (
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-green-700">
            {subcategory}
          </p>
        )}

        <h3 className="text-xl font-black tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">📍 {place}</p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Cena</p>
            <p className="text-lg font-black text-green-700">{price}</p>
          </div>

          <Link
            href={`/ogloszenie/${id}`}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-green-700"
          >
            Zobacz
          </Link>
        </div>

        <OwnerSummary compact />
      </div>
    </article>
  );
}
