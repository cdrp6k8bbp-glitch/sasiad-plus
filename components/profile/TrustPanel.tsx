const checks = [
  "Zweryfikowany e-mail",
  "Zweryfikowany telefon",
  "43 udane wypożyczenia",
  "37 pozytywnych opinii",
];

export default function TrustPanel() {
  return (
    <section className="rounded-[32px] border border-violet-200 bg-violet-50 p-6 md:p-8">
      <p className="text-sm font-bold uppercase tracking-wider text-violet-700">
        Poziom zaufania
      </p>

      <h2 className="mt-2 text-2xl font-black text-violet-900">
        🟣 Zaufany Sąsiad
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
