import Link from "next/link";
import ListingCard from "@/components/ListingCard";


export default function Home() {

  const categories = [
    {
      icon: "🛠️",
      title: "Wypożycz sprzęt",
      text: "Wiertarki, drabiny, narzędzia",
      link: "/sprzet",
    },
    {
      icon: "🐕",
      title: "Zwierzęta",
      text: "Spacery i opieka",
      link: "/uslugi",
    },
    {
      icon: "🏠",
      title: "Pomoc domowa",
      text: "Naprawy i drobne prace",
      link: "/uslugi",
    },
    {
      icon: "🌱",
      title: "Ogród",
      text: "Koszenie i pielęgnacja",
      link: "/uslugi",
    },
  ];


  const listings = [
    {
      icon: "🔧",
      title: "Wiertarka Bosch",
      place: "Słupsk",
      price: "25 zł / dzień",
    },
    {
      icon: "🐶",
      title: "Wyprowadzanie psa",
      place: "Słupsk",
      price: "20 zł / spacer",
    },
    {
      icon: "🎨",
      title: "Malowanie pokoju",
      place: "Słupsk",
      price: "50 zł / godz.",
    },
  ];


  return (

    <main className="min-h-screen bg-slate-50">


      <nav className="flex items-center justify-between bg-white p-6 shadow">

        <Link
          href="/"
          className="text-3xl font-bold text-green-600"
        >
          Sąsiad+
        </Link>


        <div className="flex gap-5">

          <Link href="/sprzet">
            🛠 Sprzęt
          </Link>

          <Link href="/uslugi">
            🤝 Usługi
          </Link>

          <Link
            href="/dodaj"
            className="rounded-xl bg-green-600 px-5 py-3 text-white"
          >
            ➕ Dodaj
          </Link>

        </div>

      </nav>



      <section className="px-6 py-20 text-center">

        <h1 className="text-5xl font-bold">
          Wszystko czego potrzebujesz,
          <br />
          jest po sąsiedzku
        </h1>


        <p className="mt-6 text-xl text-gray-600">
          Pożycz sprzęt. Znajdź pomoc. Pomóż innym.
        </p>


      </section>




      <section className="grid gap-6 px-6 md:grid-cols-4">

        {categories.map((category) => (

          <Link
            href={category.link}
            key={category.title}
            className="rounded-2xl bg-white p-6 shadow"
          >

            <div className="text-4xl">
              {category.icon}
            </div>

            <h2 className="mt-4 text-xl font-bold">
              {category.title}
            </h2>

            <p className="mt-2 text-gray-600">
              {category.text}
            </p>

          </Link>

        ))}

      </section>




      <section className="px-6 py-16">

        <h2 className="mb-8 text-3xl font-bold">
          Najnowsze ogłoszenia
        </h2>


        <div className="grid gap-6 md:grid-cols-3">

          {listings.map((listing) => (

            <ListingCard
              key={listing.title}
              icon={listing.icon}
              title={listing.title}
              place={listing.place}
              price={listing.price}
            />

          ))}

        </div>

      </section>


    </main>

  );
}