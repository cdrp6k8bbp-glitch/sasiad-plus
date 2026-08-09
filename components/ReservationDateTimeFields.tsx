"use client";

import { useMemo, useState } from "react";
import {
  availableDatesForCalendar,
  availabilitySlotForDate,
  formatPolishIsoDate,
  type ListingAvailability,
} from "@/lib/listing-availability";

function addThirtyMinutes(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}

function subtractThirtyMinutes(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes - 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}

function nextIsoDate(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function ReservationDateTimeFields({
  availability,
  today,
}: {
  availability: ListingAvailability;
  today: string;
}) {
  const availableDates = useMemo(
    () => availableDatesForCalendar(availability, today),
    [availability, today],
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const startSlot = availabilitySlotForDate(availability, startDate);
  const endSlot = availabilitySlotForDate(availability, endDate);
  const endDateOptions = useMemo(() => {
    const startIndex = availableDates.indexOf(startDate);
    if (startIndex < 0) return [];

    const dates = [availableDates[startIndex]];
    for (let index = startIndex + 1; index < availableDates.length; index += 1) {
      if (availableDates[index] !== nextIsoDate(dates.at(-1) ?? "")) break;
      dates.push(availableDates[index]);
    }
    return dates;
  }, [availableDates, startDate]);

  function selectStartDate(value: string) {
    const slot = availabilitySlotForDate(availability, value);
    setStartDate(value);
    setEndDate("");
    setStartTime(slot?.startTime ?? "");
    setEndTime("");
  }

  function selectEndDate(value: string) {
    const slot = availabilitySlotForDate(availability, value);
    setEndDate(value);
    setEndTime(slot?.endTime ?? "");
  }

  function selectStartTime(value: string) {
    setStartTime(value);
    if (startDate && endDate === startDate) {
      const minimumEndTime = addThirtyMinutes(value);
      if (endTime < minimumEndTime) setEndTime(minimumEndTime);
    }
  }

  const minimumEndTime =
    startSlot && endSlot && endDate === startDate
      ? addThirtyMinutes(startTime)
      : endSlot?.startTime ?? "";

  if (availableDates.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
        Usługodawca nie udostępnił jeszcze terminów na najbliższe trzy miesiące.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="start_date"
            className="text-sm font-bold text-slate-700"
          >
            Dzień od
          </label>
          <select
            id="start_date"
            name="start_date"
            value={startDate}
            onChange={(event) => selectStartDate(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3"
          >
            <option value="">Wybierz wolny dzień</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {formatPolishIsoDate(date)} · {availabilitySlotForDate(availability, date)?.startTime}–{availabilitySlotForDate(availability, date)?.endTime}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="end_date"
            className="text-sm font-bold text-slate-700"
          >
            Dzień do
          </label>
          <select
            id="end_date"
            name="end_date"
            value={endDate}
            onChange={(event) => selectEndDate(event.target.value)}
            disabled={!startDate}
            required
            title={
              startDate
                ? "Dostępne są tylko kolejne wolne dni od wybranej daty rozpoczęcia."
                : "Najpierw wybierz dzień rozpoczęcia."
            }
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">
              {startDate ? "Wybierz dzień zakończenia" : "Najpierw wybierz dzień od"}
            </option>
            {endDateOptions.map((date) => (
              <option key={date} value={date}>
                {formatPolishIsoDate(date)} · {availabilitySlotForDate(availability, date)?.startTime}–{availabilitySlotForDate(availability, date)?.endTime}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="start_time"
            className="text-sm font-bold text-slate-700"
          >
            Godzina od
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            step={1800}
            min={startSlot?.startTime}
            max={
              startSlot ? subtractThirtyMinutes(startSlot.endTime) : undefined
            }
            value={startTime}
            onChange={(event) => selectStartTime(event.target.value)}
            disabled={!startSlot}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>
        <div>
          <label
            htmlFor="end_time"
            className="text-sm font-bold text-slate-700"
          >
            Godzina do
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            step={1800}
            min={minimumEndTime}
            max={endSlot?.endTime}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            disabled={!endSlot}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-600">
        Przy każdej dacie pokazujemy godziny ustawione przez usługodawcę.
        Dłuższa rezerwacja jest możliwa tylko przez kolejne wolne dni.
      </p>
    </div>
  );
}
