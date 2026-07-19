import Link from "next/link";
import ModerationActions from "@/components/admin/ModerationActions";
import { requireAdmin } from "@/lib/admin";
import {
  getListingReports,
  type ListingReportStatus,
} from "@/lib/listing-reports";

const FILTERS = ["pending", "reviewed", "dismissed", "all"] as const;
type ReportFilter = (typeof FILTERS)[number];

const filterLabels: Record<ReportFilter, string> = {
  pending: "Oczekujące",
  reviewed: "Sprawdzone",
  dismissed: "Odrzucone",
  all: "Wszystkie",
};

const statusLabels: Record<ListingReportStatus, string> = {
  pending: "Oczekuje",
  reviewed: "Sprawdzone",
  dismissed: "Odrzucone",
};

const reasonLabels: Record<string, string> = {
  spam: "Spam lub duplikat",
  fraud: "Podejrzenie oszustwa",
  prohibited: "Niedozwolona oferta",
  misleading: "Treść wprowadza w błąd",
  other: "Inny problem",
};

function isReportFilter(value: string): value is ReportFilter {
  return FILTERS.includes(value as ReportFilter);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; zapisano?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const currentFilter =
    params.status && isReportFilter(params.status) ? params.status : "pending";
  const allReports = await getListingReports();
  const reports =
    currentFilter === "all"
      ? allReports
      : allReports.filter((report) => report.status === currentFilter);
  const counts = {
    pending: allReports.filter((report) => report.status === "pending").length,
    reviewed: allReports.filter((report) => report.status === "reviewed").length,
    dismissed: allReports.filter((report) => report.status === "dismissed").length,
    all: allReports.length,
  };

  return (
    <main className="min-h-screen bg-[#f7faf8] pb-16 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/" className="text-2xl font-black text-green-700">
            Sąsiad+
          </Link>
          <Link href="/profil" className="font-bold text-slate-600 hover:text-green-700">
            Wróć do profilu
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <p className="font-semibold text-red-700">Bezpieczeństwo społeczności</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
          Panel moderacji
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Przeglądaj zgłoszenia użytkowników i podejmuj działania wobec
          niebezpiecznych lub niezgodnych ogłoszeń.
        </p>

        {params.zapisano === "1" && (
          <p className="mt-6 rounded-2xl bg-green-100 px-5 py-4 font-bold text-green-800">
            ✓ Decyzja moderacyjna została zapisana.
          </p>
        )}

        <nav className="mt-8 flex flex-wrap gap-3" aria-label="Filtry zgłoszeń">
          {FILTERS.map((filter) => (
            <Link
              key={filter}
              href={`/admin?status=${filter}`}
              className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                currentFilter === filter
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-green-300"
              }`}
            >
              {filterLabels[filter]} ({counts[filter]})
            </Link>
          ))}
        </nav>

        {reports.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-5xl">🛡️</div>
            <h2 className="mt-4 text-2xl font-black">Brak zgłoszeń w tej sekcji</h2>
            <p className="mt-2 text-slate-600">
              Gdy pojawią się nowe zgłoszenia, zobaczysz je tutaj.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800">
                        {reasonLabels[report.reason] ?? report.reason}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {statusLabels[report.status]}
                      </span>
                      {report.listing_archived_at && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          Ogłoszenie zarchiwizowane
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 text-2xl font-black">
                      {report.listing_title}
                    </h2>
                    <p className="mt-1 text-slate-500">
                      📍 {report.listing_location}
                    </p>
                  </div>
                  <Link
                    href={`/ogloszenie/${report.listing_id}`}
                    className="font-bold text-green-700 hover:underline"
                  >
                    Otwórz ogłoszenie →
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Osoba zgłaszająca
                    </p>
                    <p className="mt-1 font-bold">{report.reporter_name}</p>
                    <p className="text-sm text-slate-600">{report.reporter_email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Data zgłoszenia
                    </p>
                    <p className="mt-1 font-bold">
                      {new Intl.DateTimeFormat("pl-PL", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Europe/Warsaw",
                      }).format(new Date(`${report.created_at}Z`))}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-bold text-slate-700">Opis problemu</p>
                  <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                    {report.details || "Nie dodano dodatkowego opisu."}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-6">
                  <ModerationActions
                    reportId={report.id}
                    currentFilter={currentFilter}
                    listingArchived={Boolean(report.listing_archived_at)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
