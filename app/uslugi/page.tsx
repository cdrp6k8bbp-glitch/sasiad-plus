export default function Uslugi() {
  const services = [
    "🐕 Wyprowadzanie psów",
    "🐈 Opieka nad zwierzętami",
    "🏠 Pomoc podczas urlopu",
    "🔨 Drobne remonty",
    "🌱 Prace ogrodowe",
    "👴 Pomoc seniorom",
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <h1 className="text-4xl font-bold text-green-600">
        🤝 Pomoc sąsiedzka
      </h1>

      <p className="mt-4 text-gray-600">
        Znajdź osobę, która pomoże Ci w codziennych sprawach.
      </p>


      <div className="mt-10 grid gap-6 md:grid-cols-3">

        {services.map((service) => (
          <div
            key={service}
            className="rounded-2xl bg-white p-6 shadow"
          >

            <h2 className="text-xl font-bold">
              {service}
            </h2>

            <p className="mt-3 text-gray-600">
              Dostępni sąsiedzi w Twojej okolicy.
            </p>

            <button className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-white">
              Sprawdź
            </button>

          </div>
        ))}

      </div>

    </main>
  );
}