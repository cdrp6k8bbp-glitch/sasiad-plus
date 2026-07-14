import ImageUploader from "@/components/ImageUploader";
import { addListing } from "./actions";

export default function Dodaj() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 py-10 md:p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-black text-green-700">
          ➕ Dodaj ogłoszenie
        </h1>

        <p className="mt-4 text-slate-600">
          Podziel się sprzętem lub zaoferuj pomoc sąsiadom.
        </p>

        <form
          action={addListing}
          className="mt-10 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <input
            name="title"
            required
            className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
            placeholder="Tytuł ogłoszenia"
          />

          <select
            name="category"
            required
            defaultValue=""
            className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
          >
            <option value="" disabled>
              Wybierz kategorię
            </option>
            <option value="sprzet">Sprzęt</option>
            <option value="usluga">Usługa</option>
            <option value="pomoc">Pomoc sąsiedzka</option>
          </select>

          <textarea
            name="description"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
            placeholder="Opis"
            rows={5}
          />

          <ImageUploader />

          <input
            name="price"
            required
            className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
            placeholder="Cena (np. 20 zł/dzień)"
          />

          <input
            name="location"
            required
            className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
            placeholder="Miasto"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Opublikuj ogłoszenie
          </button>
        </form>
      </div>
    </main>
  );
}
