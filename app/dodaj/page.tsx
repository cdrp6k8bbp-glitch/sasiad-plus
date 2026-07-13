import { addListing } from "./actions";

export default function Dodaj() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">

      <h1 className="text-4xl font-bold text-green-600">
        ➕ Dodaj ogłoszenie
      </h1>

      <p className="mt-4 text-gray-600">
        Podziel się sprzętem lub zaoferuj pomoc sąsiadom.
      </p>


      <form action={addListing} className="mt-10 max-w-xl space-y-5 rounded-2xl bg-white p-8 shadow">

        <input
          name="title"
          required
          className="w-full rounded-xl border p-3"
          placeholder="Tytuł ogłoszenia"
        />


        <select name="category" required defaultValue="" className="w-full rounded-xl border p-3">

          <option value="" disabled>
            Wybierz kategorię
          </option>

          <option value="sprzet">
            Sprzęt
          </option>

          <option value="usluga">
            Usługa
          </option>

          <option value="pomoc">
            Pomoc sąsiedzka
          </option>

        </select>


        <textarea
          name="description"
          className="w-full rounded-xl border p-3"
          placeholder="Opis"
          rows={5}
        />


        <input
          name="price"
          required
          className="w-full rounded-xl border p-3"
          placeholder="Cena (np. 20 zł/dzień)"
        />


        <input
          name="location"
          required
          className="w-full rounded-xl border p-3"
          placeholder="Miasto"
        />


        <button
          type="submit"
          className="rounded-xl bg-green-600 px-6 py-3 text-white"
        >
          Opublikuj ogłoszenie
        </button>


      </form>

    </main>
  );
}
