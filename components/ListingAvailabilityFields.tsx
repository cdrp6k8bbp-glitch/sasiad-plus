"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_LISTING_AVAILABILITY,
  datesForWeekdaysInCalendarWindow,
  formatPolishIsoDate,
  listingAvailabilityFromStorage,
  parseAvailabilityDates,
  parseAvailabilitySlots,
  WEEKDAY_OPTIONS,
  weekdayForIsoDate,
  type AvailabilitySlot,
} from "@/lib/listing-availability";

const CALENDAR_WEEKDAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];

type CalendarMonth = {
  key: string;
  label: string;
  cells: Array<{ date: string; day: number } | null>;
};

function buildCalendarMonths(today: string): CalendarMonth[] {
  const [year, month] = today.split("-").map(Number);

  return Array.from({ length: 3 }, (_, offset) => {
    const firstDay = new Date(Date.UTC(year, month - 1 + offset, 1, 12));
    const monthYear = firstDay.getUTCFullYear();
    const monthIndex = firstDay.getUTCMonth();
    const daysInMonth = new Date(
      Date.UTC(monthYear, monthIndex + 1, 0, 12),
    ).getUTCDate();
    const leadingEmptyCells = (firstDay.getUTCDay() + 6) % 7;
    const cells: CalendarMonth["cells"] = Array.from(
      { length: leadingEmptyCells },
      () => null,
    );

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(Date.UTC(monthYear, monthIndex, day, 12));
      cells.push({ date: date.toISOString().slice(0, 10), day });
    }

    return {
      key: `${monthYear}-${String(monthIndex + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("pl-PL", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(firstDay),
      cells,
    };
  });
}

function addThirtyMinutes(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}

function slotsByDate(slots: AvailabilitySlot[]): Record<string, AvailabilitySlot> {
  return Object.fromEntries(slots.map((slot) => [slot.date, slot]));
}

export default function ListingAvailabilityFields({
  today,
  initialSlots,
  initialDates,
  initialWeekdays,
  initialStartTime,
  initialEndTime,
}: {
  today: string;
  initialSlots?: string | null;
  initialDates?: string | null;
  initialWeekdays?: string | null;
  initialStartTime?: string | null;
  initialEndTime?: string | null;
}) {
  const availability = listingAvailabilityFromStorage({
    slots: initialSlots,
    dates: initialDates,
    weekdays:
      initialWeekdays ?? DEFAULT_LISTING_AVAILABILITY.weekdays.join(","),
    startTime: initialStartTime ?? DEFAULT_LISTING_AVAILABILITY.startTime,
    endTime: initialEndTime ?? DEFAULT_LISTING_AVAILABILITY.endTime,
  });
  const calendarMonths = useMemo(() => buildCalendarMonths(today), [today]);
  const selectableDates = useMemo(
    () =>
      calendarMonths
        .flatMap((month) => month.cells)
        .filter(
          (cell): cell is { date: string; day: number } =>
            cell !== null && cell.date >= today,
        )
        .map((cell) => cell.date),
    [calendarMonths, today],
  );
  const [defaultStartTime, setDefaultStartTime] = useState(
    availability.startTime,
  );
  const [defaultEndTime, setDefaultEndTime] = useState(availability.endTime);
  const [selectedSlots, setSelectedSlots] = useState<
    Record<string, AvailabilitySlot>
  >(() => {
    const allowed = new Set(selectableDates);
    const storedSlots = parseAvailabilitySlots(initialSlots ?? null).filter(
      (slot) => allowed.has(slot.date),
    );
    if (storedSlots.length > 0) return slotsByDate(storedSlots);

    const initialDatesList =
      initialDates === undefined
        ? []
        : initialDates === null
          ? datesForWeekdaysInCalendarWindow(availability.weekdays, today)
          : parseAvailabilityDates(initialDates);

    return slotsByDate(
      initialDatesList
        .filter((date) => allowed.has(date))
        .map((date) => ({
          date,
          startTime: availability.startTime,
          endTime: availability.endTime,
        })),
    );
  });
  const slots = useMemo(
    () =>
      Object.values(selectedSlots).sort((left, right) =>
        left.date.localeCompare(right.date),
      ),
    [selectedSlots],
  );
  const selectedSet = useMemo(
    () => new Set(Object.keys(selectedSlots)),
    [selectedSlots],
  );
  const earliestTime = slots.reduce(
    (earliest, slot) =>
      slot.startTime < earliest ? slot.startTime : earliest,
    slots[0]?.startTime ?? defaultStartTime,
  );
  const latestTime = slots.reduce(
    (latest, slot) => (slot.endTime > latest ? slot.endTime : latest),
    slots[0]?.endTime ?? defaultEndTime,
  );

  function newSlot(date: string): AvailabilitySlot {
    return {
      date,
      startTime: defaultStartTime,
      endTime: defaultEndTime,
    };
  }

  function toggleDate(date: string) {
    setSelectedSlots((current) => {
      const next = { ...current };
      if (next[date]) delete next[date];
      else next[date] = newSlot(date);
      return next;
    });
  }

  function toggleWeekday(weekday: number) {
    const matchingDates = selectableDates.filter(
      (date) => weekdayForIsoDate(date) === weekday,
    );
    const allSelected = matchingDates.every((date) => selectedSet.has(date));

    setSelectedSlots((current) => {
      const next = { ...current };
      matchingDates.forEach((date) => {
        if (allSelected) delete next[date];
        else if (!next[date]) next[date] = newSlot(date);
      });
      return next;
    });
  }

  function updateSlot(
    date: string,
    field: "startTime" | "endTime",
    value: string,
  ) {
    setSelectedSlots((current) => {
      const slot = current[date];
      if (!slot) return current;

      const nextSlot = { ...slot, [field]: value };
      if (field === "startTime" && nextSlot.endTime <= value) {
        nextSlot.endTime = addThirtyMinutes(value);
      }

      return { ...current, [date]: nextSlot };
    });
  }

  function updateDefaultStartTime(value: string) {
    setDefaultStartTime(value);
    if (defaultEndTime <= value) setDefaultEndTime(addThirtyMinutes(value));
  }

  function applyDefaultHoursToAll() {
    setSelectedSlots((current) =>
      Object.fromEntries(
        Object.keys(current).map((date) => [date, newSlot(date)]),
      ),
    );
  }

  return (
    <fieldset className="rounded-2xl border border-green-200 bg-green-50/60 p-4">
      <legend className="px-2 text-base font-black text-green-800">
        Kalendarz dostępnych terminów
      </legend>
      <p className="text-sm text-slate-600">
        Zaznacz wolne daty w bieżącym miesiącu i dwóch kolejnych. Każdy dzień
        może mieć inne godziny dostępności.
      </p>

      <input
        type="hidden"
        name="availability_slots"
        value={JSON.stringify(slots)}
      />
      <input
        type="hidden"
        name="availability_dates"
        value={slots.map((slot) => slot.date).join(",")}
      />
      <input
        type="hidden"
        name="availability_start_time"
        value={earliestTime}
      />
      <input type="hidden" name="availability_end_time" value={latestTime} />

      <div className="mt-4 rounded-2xl border border-green-200 bg-white p-4">
        <p className="text-sm font-black text-slate-800">
          Godziny dla nowych dat
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Po zaznaczeniu daty możesz zmienić jej godziny osobno niżej.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm font-bold text-slate-700">
            Od
            <input
              type="time"
              step={1800}
              max="23:00"
              value={defaultStartTime}
              onChange={(event) => updateDefaultStartTime(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Do
            <input
              type="time"
              step={1800}
              min={addThirtyMinutes(defaultStartTime)}
              value={defaultEndTime}
              onChange={(event) => setDefaultEndTime(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3"
            />
          </label>
          <button
            type="button"
            disabled={slots.length === 0}
            onClick={applyDefaultHoursToAll}
            className="col-span-2 rounded-xl border border-green-700 px-4 py-3 text-sm font-black text-green-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 sm:col-span-1 sm:self-end"
          >
            Zastosuj do wszystkich
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-black text-slate-700">
          Szybko zaznacz wszystkie:
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WEEKDAY_OPTIONS.map((day) => {
            const matchingDates = selectableDates.filter(
              (date) => weekdayForIsoDate(date) === day.value,
            );
            const allSelected =
              matchingDates.length > 0 &&
              matchingDates.every((date) => selectedSet.has(date));

            return (
              <label
                key={day.value}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-green-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleWeekday(day.value)}
                  className="h-4 w-4 accent-green-700"
                />
                {day.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {calendarMonths.map((month) => (
          <section
            key={month.key}
            aria-label={month.label}
            className="rounded-2xl border border-slate-200 bg-white p-3"
          >
            <h3 className="text-center text-base font-black capitalize text-slate-900">
              {month.label}
            </h3>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {CALENDAR_WEEKDAYS.map((weekday) => (
                <span
                  key={weekday}
                  className="py-1 text-[11px] font-black text-slate-500"
                >
                  {weekday}
                </span>
              ))}
              {month.cells.map((cell, index) =>
                cell ? (
                  <button
                    key={cell.date}
                    type="button"
                    disabled={cell.date < today}
                    aria-pressed={selectedSet.has(cell.date)}
                    aria-label={`${selectedSet.has(cell.date) ? "Usuń" : "Dodaj"} termin ${cell.date}`}
                    onClick={() => toggleDate(cell.date)}
                    className={`aspect-square rounded-lg text-xs font-black transition ${
                      selectedSet.has(cell.date)
                        ? "bg-green-700 text-white shadow-sm"
                        : cell.date < today
                          ? "cursor-not-allowed bg-slate-100 text-slate-300"
                          : "bg-slate-50 text-slate-700 hover:bg-green-100 hover:text-green-800"
                    }`}
                  >
                    {cell.day}
                  </button>
                ) : (
                  <span key={`${month.key}-empty-${index}`} />
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      <p
        aria-live="polite"
        className={`mt-3 text-sm font-bold ${
          slots.length > 0 ? "text-green-800" : "text-red-700"
        }`}
      >
        {slots.length > 0
          ? `Wybrano ${slots.length} terminów. Ustaw godziny dla każdego dnia.`
          : "Zaznacz co najmniej jeden wolny termin."}
      </p>

      {slots.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-base font-black text-slate-900">
            Godziny w wybranych dniach
          </h3>
          {slots.map((slot) => (
            <div
              key={slot.date}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(180px,1fr)_1fr_1fr_auto] sm:items-end"
            >
              <p className="font-black capitalize text-slate-900 sm:self-center">
                {formatPolishIsoDate(slot.date)}
              </p>
              <label className="text-sm font-bold text-slate-700">
                Od
                <input
                  type="time"
                  step={1800}
                  max="23:00"
                  value={slot.startTime}
                  onChange={(event) =>
                    updateSlot(slot.date, "startTime", event.target.value)
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3"
                />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Do
                <input
                  type="time"
                  step={1800}
                  min={addThirtyMinutes(slot.startTime)}
                  value={slot.endTime}
                  onChange={(event) =>
                    updateSlot(slot.date, "endTime", event.target.value)
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3"
                />
              </label>
              <button
                type="button"
                onClick={() => toggleDate(slot.date)}
                className="rounded-xl border border-red-200 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-50"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}
