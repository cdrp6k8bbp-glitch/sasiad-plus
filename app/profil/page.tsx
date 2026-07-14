import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ReviewCard from "@/components/profile/ReviewCard";
import TrustPanel from "@/components/profile/TrustPanel";
import UserStats from "@/components/profile/UserStats";

const listings = [
  {
    icon: "🔧",
    title: "Wiertarka Bosch",
    price: "25 zł / dzień",
    location: "Gdańsk",
  },
  {
    icon: "🏕️",
    title: "Namiot rodzinny 4-osobowy",
    price: "60 zł / weekend",
    location: "Gdańsk",
  },
  {
    icon: "🏄",
    title: "Deska SUP",
    price: "50 zł / dzień",
    location: "Sopot",
  },
];

const reviews = [
  {
    author: "Piotr",
    date: "8 lipca 2026",
    text: "Pożyczyłem wiertarkę. Sprzęt zgodny z opisem, szybki kontakt i bardzo miłe przekazanie. Polecam.",
  },
  {
    author: "Kasia",
    date: "29 czerwca 2026",
    text: "Świetna komunikacja i bezproblemowy zwrot. Chętnie skorzystam ponownie.",
  },
];

export default function ProfilPage() {
  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>

          <Link
            href="/dodaj"
            className="rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            + Dodaj ogłoszenie
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
        <Link
          href="/"
          className="inline-flex font-semibold text-green-700 hover:underline"
        >
          ← Wróć na stronę główną
        </Link>

        <ProfileHeader />

        <UserStats />

        <TrustPanel />

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="font-semibold text-green-700">O mnie</p>

          <h2 className="mt-1 text-3xl font-black tracking-tight">
            Kilka słów o Annie
          </h2>

          <p className="mt-5 max-w-3xl leading-8 text-slate-600">
            Lubię majsterkować, wyprawy nad wodę i dzielenie się rzeczami,
            które przez większość czasu leżą nieużywane. Dbam o sprzęt i
            zawsze jasno ustalam zasady wypożyczenia.
          </p>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-semibold text-green-700">Aktywne oferty</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Ogłoszenia użytkownika
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {listings.length} ogłoszenia
            </span>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {listings.map((listing) => (
              <article
                key={listing.title}
                className="overflow-hidden rounded-3xl border border-slate-200"
              >
                <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 text-7xl">
                  {listing.icon}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black">{listing.title}</h3>

                  <p className="mt-2 text-sm text-slate-500">
                    📍 {listing.location}
                  </p>

                  <p className="mt-4 font-black text-green-700">
                    {listing.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div>
            <p className="font-semibold text-green-700">
              Zaufanie społeczności
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight">
              Opinie
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard
                key={`${review.author}-${review.date}`}
                {...review}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
