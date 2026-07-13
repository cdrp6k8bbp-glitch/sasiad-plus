export default function Sprzet() {
  const items = [
    "Wiertarki",
    "Młoty udarowe",
    "Drabiny",
    "Myjki ciśnieniowe",
    "Kosiarki",
    "Narzędzia ogrodowe",
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <h1 className="text-4xl font-bold text-green-600">
        🛠 Wypożycz sprzęt
      </h1>

      <p className="mt-4 text-gray-600">
        Znajdź narzędzia w swojej okolicy.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">

        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <h2 className="text-xl font-bold">
              {item}
            </h2>

            <p className="mt-2">
              Dostępne w okolicy
            </p>

            <button className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-white">
              Zobacz oferty
            </button>

          </div>
        ))}

      </div>

    </main>
  );
}