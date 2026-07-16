import CategoryFields from "@/components/CategoryFields";
import ImageUploader from "@/components/ImageUploader";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { addListing } from "./actions";

const fieldClassName =
  "w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default async function Dodaj() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/dodaj");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 py-10 text-slate-900 md:p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-black text-green-700">
          ➕ Dodaj ogłoszenie
        </h1>

        <p className="mt-4 text-slate-600">
          Podziel się sprzętem lub zaoferuj pomoc sąsiadom jako{" "}
          <strong>{session.user.name}</strong>.
        </p>

        <form
          action={addListing}
          className="mt-10 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Tytuł ogłoszenia
            </label>
            <input
              id="title"
              name="title"
              required
              className={fieldClassName}
              placeholder="Np. Wiertarka udarowa Bosch"
            />
          </div>

          <CategoryFields />

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Opis
            </label>
            <textarea
              id="description"
              name="description"
              className={fieldClassName}
              placeholder="Opisz przedmiot albo oferowaną pomoc"
              rows={5}
            />
          </div>

          <ImageUploader />

          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Cena
            </label>
            <input
              id="price"
              name="price"
              required
              className={fieldClassName}
              placeholder="Np. 20 zł / dzień"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Miasto
            </label>
            <input
              id="location"
              name="location"
              required
              className={fieldClassName}
              placeholder="Np. Gdańsk"
            />
          </div>

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
