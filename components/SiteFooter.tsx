import Link from "next/link";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>© 2026 Sąsiad+ · Lokalnie, prosto i po sąsiedzku.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Ważne informacje">
          <Link className="font-semibold hover:text-green-700" href="/poradniki">
            Poradniki
          </Link>
          <Link className="font-semibold hover:text-green-700" href="/regulamin">
            Regulamin
          </Link>
          <Link
            className="font-semibold hover:text-green-700"
            href="/polityka-prywatnosci"
          >
            Polityka prywatności
          </Link>
          <a
            className="font-semibold hover:text-green-700"
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          >
            Kontakt
          </a>
        </nav>
      </div>
    </footer>
  );
}
