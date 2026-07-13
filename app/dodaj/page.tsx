export default function Dodaj() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <h1 className="text-4xl font-bold text-green-600">
        ➕ Dodaj ogłoszenie
      </h1>

      <p className="mt-4 text-gray-600">
        Podziel się sprzętem lub zaoferuj pomoc sąsiadom.
      </p>


      <form className="mt-10 max-w-xl space-y-5 rounded-2xl bg-white p-8 shadow">

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Tytuł ogłoszenia"
        />


        <select className="w-full rounded-xl border p-3">

          <option>
            Wybierz kategorię
          </option>

          <option>
            Sprzęt
          </option>

          <option>
            Usługa
          </option>

          <option>
            Pomoc sąsiedzka
          </option>

        </select>


        <textarea
          className="w-full rounded-xl border p-3"
          placeholder="Opis"
          rows={5}
        />


        <input
          className="w-full rounded-xl border p-3"
          placeholder="Cena (np. 20 zł/dzień)"
        />


        <input
          className="w-full rounded-xl border p-3"
          placeholder="Miasto"
        />


        <button
          className="rounded-xl bg-green-600 px-6 py-3 text-white"
        >
          Opublikuj ogłoszenie
        </button>


      </form>

    </main>
  );
}