import Link from "next/link";
import {
  cancelReservation,
  completeReservation,
  respondToReservation,
} from "@/app/rezerwacje/actions";
import { createReview } from "@/app/oceny/actions";
import type { Reservation, ReservationStatus } from "@/lib/reservations";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Oczekuje",
  accepted: "Zaakceptowana",
  rejected: "Odrzucona",
  cancelled: "Anulowana",
};

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export default function ReservationCard({
  reservation,
  perspective,
}: {
  reservation: Reservation;
  perspective: "owner" | "requester";
}) {
  const otherPerson =
    perspective === "owner"
      ? reservation.requester_name
      : reservation.owner_name;
  const isCompleted = Boolean(reservation.completed_at);
  const statusLabel = isCompleted
    ? "Zakończona"
    : STATUS_LABELS[reservation.status];
  const statusStyle = isCompleted
    ? "bg-blue-100 text-blue-800"
    : STATUS_STYLES[reservation.status];

  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/ogloszenie/${reservation.listing_id}`}
            className="font-black text-slate-900 hover:text-green-700"
          >
            {reservation.listing_title}
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            {perspective === "owner" ? "Rezerwuje" : "Właściciel"}: {otherPerson}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle}`}
        >
          {statusLabel}
        </span>
      </div>

      <p className="mt-4 font-bold text-slate-800">
        📅 {formatDate(reservation.start_date)} – {formatDate(reservation.end_date)}
      </p>

      {reservation.note && (
        <p className="mt-3 rounded-2xl bg-white p-3 text-sm leading-6 text-slate-600">
          „{reservation.note}”
        </p>
      )}

      {perspective === "owner" && reservation.status === "pending" && (
        <form action={respondToReservation} className="mt-4 grid grid-cols-2 gap-2">
          <input type="hidden" name="reservation_id" value={reservation.id} />
          <button
            type="submit"
            name="response"
            value="accepted"
            className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
          >
            ✓ Akceptuj
          </button>
          <button
            type="submit"
            name="response"
            value="rejected"
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
          >
            Odrzuć
          </button>
        </form>
      )}

      {perspective === "requester" && reservation.status === "pending" && (
          <form action={cancelReservation} className="mt-4">
            <input type="hidden" name="reservation_id" value={reservation.id} />
            <button
              type="submit"
              className="text-sm font-bold text-red-700 hover:underline"
            >
              Anuluj rezerwację
            </button>
          </form>
      )}

      {reservation.status === "accepted" && !isCompleted && (
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={completeReservation}>
            <input type="hidden" name="reservation_id" value={reservation.id} />
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              ✓ Zakończ rezerwację
            </button>
          </form>

          {perspective === "requester" && (
            <form action={cancelReservation}>
              <input type="hidden" name="reservation_id" value={reservation.id} />
              <button
                type="submit"
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50"
              >
                Anuluj
              </button>
            </form>
          )}
        </div>
      )}

      {perspective === "requester" && isCompleted && !reservation.review_id && (
        <form action={createReview} className="mt-4 space-y-3 rounded-2xl bg-white p-4">
          <input type="hidden" name="reservation_id" value={reservation.id} />
          <div>
            <label htmlFor={`rating-${reservation.id}`} className="text-sm font-bold text-slate-700">
              Twoja ocena
            </label>
            <select
              id={`rating-${reservation.id}`}
              name="rating"
              required
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-slate-300 p-3"
            >
              <option value="" disabled>Wybierz ocenę</option>
              <option value="5">★★★★★ 5 — świetnie</option>
              <option value="4">★★★★☆ 4 — dobrze</option>
              <option value="3">★★★☆☆ 3 — w porządku</option>
              <option value="2">★★☆☆☆ 2 — słabo</option>
              <option value="1">★☆☆☆☆ 1 — źle</option>
            </select>
          </div>
          <div>
            <label htmlFor={`review-${reservation.id}`} className="text-sm font-bold text-slate-700">
              Krótka opinia
            </label>
            <textarea
              id={`review-${reservation.id}`}
              name="body"
              required
              minLength={3}
              maxLength={500}
              rows={3}
              className="mt-1 w-full resize-none rounded-xl border border-slate-300 p-3"
              placeholder="Jak przebiegła współpraca?"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
          >
            Wystaw opinię
          </button>
        </form>
      )}

      {perspective === "requester" && isCompleted && reservation.review_id && (
        <p className="mt-4 text-sm font-bold text-green-700">
          ✓ Opinia została wystawiona
        </p>
      )}
    </article>
  );
}
