type ListingProps = {
  icon: string;
  title: string;
  place: string;
  price: string;
};

export default function ListingCard({
  icon,
  title,
  place,
  price,
}: ListingProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <span className="text-7xl transition group-hover:scale-110">
          {icon}
        </span>

        <button
          type="button"
          aria-label="Dodaj do ulubionych"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow"
        >
          ♡
        </button>

        <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700 shadow">
          Dostępne
        </span>
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-green-700">
          Zaufany Sąsiad
        </p>

        <h3 className="mt-2 text-xl font-black tracking-tight">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          📍 {place}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Cena</p>
            <p className="text-lg font-black text-green-700">
              {price}
            </p>
          </div>

          <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-green-700">
            Zobacz
          </span>
        </div>
      </div>
    </article>
  );
}
