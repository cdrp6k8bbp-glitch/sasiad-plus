export default function Loading() {
  return (
    <main
      className="flex flex-1 items-center justify-center bg-white px-6 py-20 text-slate-900"
      aria-busy="true"
    >
      <div className="w-full max-w-sm text-center" role="status" aria-live="polite">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-green-100 text-3xl motion-reduce:animate-none"
        >
          🏡
        </div>
        <p className="text-2xl font-black text-green-700">Sąsiad+</p>
        <p className="mt-2 text-base font-semibold text-slate-600">Ładowanie strony…</p>
      </div>
    </main>
  );
}
