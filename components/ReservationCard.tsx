import Link from "next/link";
import {
  cancelReservation,
  respondToReservation,
} from "@/app/rezerwacje/actions";
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
          className={`rounded-full px-3 py-1 text-xs font-black ${
            STATUS_STYLES[reservation.status]
          }`}
        >
          {STATUS_LABELS[reservation.status]}
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

      {perspective === "requester" &&
        (reservation.status === "pending" || reservation.status === "accepted") && (
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
    </article>
  );
}
