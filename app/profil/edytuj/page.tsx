import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthNav from "@/components/AuthNav";
import { auth } from "@/lib/auth";
import { getUserProfileDetails } from "@/lib/profiles";
import { updateProfile } from "./actions";

export default async function EditProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/logowanie?redirect=/profil/edytuj");
  }

  const profile = await getUserProfileDetails(session.user.id);

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <AuthNav />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Link href="/profil" className="font-semibold text-green-700 hover:underline">
          ← Wróć do profilu
        </Link>

        <section className="mt-7 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="font-semibold text-green-700">Twoja wizytówka</p>
          <h1 className="mt-1 text-4xl font-black">Edytuj profil</h1>
          <p className="mt-3 leading-7 text-slate-500">
            Imię, miejscowość i opis będą widoczne dla innych użytkowników.
            Adres e-mail pozostaje prywatny.
          </p>

          <form action={updateProfile} className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="font-bold">Imię lub nazwa profilu</label>
              <input
                id="name"
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={session.user.name}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label htmlFor="city" className="font-bold">Miejscowość</label>
              <input
                id="city"
                name="city"
                maxLength={80}
                defaultValue={profile.city ?? ""}
                placeholder="np. Gdańsk, Wrzeszcz"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />
              <p className="mt-2 text-sm text-slate-500">
                Podaj tylko tyle informacji o lokalizacji, ile chcesz upublicznić.
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="font-bold">O mnie</label>
              <textarea
                id="bio"
                name="bio"
                rows={6}
                maxLength={500}
                defaultValue={profile.bio ?? ""}
                placeholder="Napisz kilka zdań o sobie i o tym, w czym możesz pomóc sąsiadom."
                className="mt-2 w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
              />
              <p className="mt-2 text-sm text-slate-500">Maksymalnie 500 znaków.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
              >
                Zapisz profil
              </button>
              <Link
                href="/profil"
                className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Anuluj
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
