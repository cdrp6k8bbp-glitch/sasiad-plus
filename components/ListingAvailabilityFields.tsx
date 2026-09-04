"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_LISTING_AVAILABILITY,
  datesForWeekdaysInCalendarWindow,
  formatPolishIsoDate,
  listingAvailabilityFromStorage,
  parseAvailabilityDates,
  parseAvailabilitySlots,
  type AvailabilityMode,
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
    const cells: CalendarMonth["cells"] = Array.from(
      { length: (firstDay.getUTCDay() + 6) % 7 },
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
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function slotsByDate(slots: AvailabilitySlot[]): Record<string, AvailabilitySlot> {
  return Object.fromEntries(slots.map((slot) => [slot.date, slot]));
}

export default function ListingAvailabilityFields({
  today,
  initialMode,
  initialNote,
  initialSlots,
  initialDates,
  initialWeekdays,
  initialStartTime,
  initialEndTime,
}: {
  today: string;
  initialMode?: string | null;
  initialNote?: string | null;
  initialSlots?: string | null;
  initialDates?: string | null;
  initialWeekdays?: string | null;
  initialStartTime?: string | null;
  initialEndTime?: string | null;
}) {
  const availability = listingAvailabilityFromStorage({
    mode: initialMode,
    note: initialNote,
    slots: initialSlots,
    dates: initialDates,
    weekdays: initialWeekdays ?? DEFAULT_LISTING_AVAILABILITY.weekdays.join(","),
    startTime: initialStartTime ?? DEFAULT_LISTING_AVAILABILITY.startTime,
    endTime: initialEndTime ?? DEFAULT_LISTING_AVAILABILITY.endTime,
  });
  const calendarMonths = useMemo(() => buildCalendarMonths(today), [today]);
  const selectableDates = useMemo(
    () => calendarMonths.flatMap((month) => month.cells)
      .filter((cell): cell is { date: string; day: number } => cell !== null && cell.date >= today)
      .map((cell) => cell.date),
    [calendarMonths, today],
  );
  const [mode, setMode] = useState<AvailabilityMode>(availability.mode);
  const [note, setNote] = useState(availability.note ?? "");
  const [activeMonth, setActiveMonth] = useState(0);
  const [defaultStartTime, setDefaultStartTime] = useState(availability.startTime);
  const [defaultEndTime, setDefaultEndTime] = useState(availability.endTime);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, AvailabilitySlot>>(() => {
    const allowed = new Set(selectableDates);
    const storedSlots = parseAvailabilitySlots(initialSlots ?? null).filter((slot) => allowed.has(slot.date));
    if (storedSlots.length > 0) return slotsByDate(storedSlots);

    const initialDatesList = initialDates === undefined
      ? []
      : initialDates === null
        ? datesForWeekdaysInCalendarWindow(availability.weekdays, today)
        : parseAvailabilityDates(initialDates);

    return slotsByDate(initialDatesList
      .filter((date) => allowed.has(date))
      .map((date) => ({ date, startTime: availability.startTime, endTime: availability.endTime })));
  });
  const slots = useMemo(
    () => Object.values(selectedSlots).sort((left, right) => left.date.localeCompare(right.date)),
    [selectedSlots],
  );
  const selectedSet = useMemo(() => new Set(Object.keys(selectedSlots)), [selectedSlots]);
  const earliestTime = slots.reduce(
    (earliest, slot) => slot.startTime < earliest ? slot.startTime : earliest,
    slots[0]?.startTime ?? defaultStartTime,
  );
  const latestTime = slots.reduce(
    (latest, slot) => slot.endTime > latest ? slot.endTime : latest,
    slots[0]?.endTime ?? defaultEndTime,
  );
  const month = calendarMonths[activeMonth];

  function newSlot(date: string): AvailabilitySlot {
    return { date, startTime: defaultStartTime, endTime: defaultEndTime };
  }

  function toggleDate(date: string) {
    setSelectedSlots((current) => {
      const next = { ...current };
      if (next[date]) delete next[date];
      else next[date] = newSlot(date);
      return next;
    });
  }

  function updateSlot(date: string, field: "startTime" | "endTime", value: string) {
    setSelectedSlots((current) => {
      const slot = current[date];
      if (!slot) return current;
      const nextSlot = { ...slot, [field]: value };
      if (field === "startTime" && nextSlot.endTime <= value) nextSlot.endTime = addThirtyMinutes(value);
      return { ...current, [date]: nextSlot };
    });
  }

  function updateDefaultStartTime(value: string) {
    setDefaultStartTime(value);
    if (defaultEndTime <= value) setDefaultEndTime(addThirtyMinutes(value));
  }

  function applyDefaultHoursToAll() {
    setSelectedSlots((current) => Object.fromEntries(
      Object.keys(current).map((date) => [date, newSlot(date)]),
    ));
  }

  return (
    <fieldset className="rounded-2xl border border-green-200 bg-green-50/60 p-4 sm:p-5">
      <legend className="px-2 text-base font-black text-green-800">Kalendarz dostępnych terminów</legend>
      <p className="text-sm text-slate-600">Wybierz, jak chcesz udostępnić terminy.</p>

      <input type="hidden" name="availability_mode" value={mode} />
      <input type="hidden" name="availability_slots" value={mode === "specific" ? JSON.stringify(slots) : ""} />
      <input type="hidden" name="availability_dates" value={mode === "specific" ? slots.map((slot) => slot.date).join(",") : ""} />
      <input type="hidden" name="availability_start_time" value={earliestTime} />
      <input type="hidden" name="availability_end_time" value={latestTime} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={mode === "specific"}
          onClick={() => setMode("specific")}
          className={`rounded-2xl border-2 p-4 text-left transition ${mode === "specific" ? "border-green-700 bg-white shadow-sm" : "border-slate-200 bg-white/70 hover:border-green-300"}`}
        >
          <span className="block font-black text-slate-900">📅 Konkretne terminy</span>
          <span className="mt-1 block text-sm text-slate-600">Zaznaczasz dokładne dni i godziny dostępności.</span>
        </button>
        <button
          type="button"
          aria-pressed={mode === "flexible"}
          onClick={() => setMode("flexible")}
          className={`rounded-2xl border-2 p-4 text-left transition ${mode === "flexible" ? "border-green-700 bg-white shadow-sm" : "border-slate-200 bg-white/70 hover:border-green-300"}`}
        >
          <span className="block font-black text-slate-900">💬 Dostępność do ustalenia</span>
          <span className="mt-1 block text-sm text-slate-600">Zainteresowani napiszą do Ciebie, by ustalić termin.</span>
        </button>
      </div>

      {mode === "flexible" ? (
        <label className="mt-5 block font-bold text-slate-800">
          Kiedy zwykle jesteś dostępny? <span className="font-normal text-slate-500">(opcjonalnie)</span>
          <textarea
            name="availability_note"
            value={note}
            maxLength={300}
            rows={4}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Np. najczęściej w weekendy po południu; dokładny termin ustalimy w wiadomości."
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white p-4 font-normal"
          />
          <span className="mt-1 block text-right text-xs font-semibold text-slate-500">{note.length}/300</span>
        </label>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <button type="button" disabled={activeMonth === 0} onClick={() => setActiveMonth((value) => Math.max(0, value - 1))} aria-label="Poprzedni miesiąc" className="h-10 w-10 rounded-xl border border-slate-200 text-xl font-black disabled:opacity-30">‹</button>
              <h3 className="text-center text-lg font-black capitalize text-slate-900">{month.label}</h3>
              <button type="button" disabled={activeMonth === calendarMonths.length - 1} onClick={() => setActiveMonth((value) => Math.min(calendarMonths.length - 1, value + 1))} aria-label="Następny miesiąc" className="h-10 w-10 rounded-xl border border-slate-200 text-xl font-black disabled:opacity-30">›</button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {CALENDAR_WEEKDAYS.map((weekday) => <span key={weekday} className="py-2 text-xs font-black text-slate-500">{weekday}</span>)}
              {month.cells.map((cell, index) => cell ? (
                <button
                  key={cell.date}
                  type="button"
                  disabled={cell.date < today}
                  aria-current={cell.date === today ? "date" : undefined}
                  aria-pressed={selectedSet.has(cell.date)}
                  aria-label={`${selectedSet.has(cell.date) ? "Usuń" : "Dodaj"} termin ${cell.date}`}
                  onClick={() => toggleDate(cell.date)}
                  className={`aspect-square rounded-xl text-sm font-black transition ${selectedSet.has(cell.date) ? "bg-green-700 text-white shadow-sm" : cell.date < today ? "cursor-not-allowed bg-slate-100 text-slate-300" : cell.date === today ? "border-2 border-blue-400 bg-white text-slate-800" : "border border-slate-200 bg-white text-slate-700 hover:border-green-400 hover:bg-green-50"}`}
                >{cell.day}</button>
              ) : <span key={`${month.key}-empty-${index}`} />)}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
              <span><i className="mr-1 inline-block h-3 w-3 rounded bg-green-700" />Wybrany</span>
              <span><i className="mr-1 inline-block h-3 w-3 rounded border-2 border-blue-400" />Dziś</span>
              <span><i className="mr-1 inline-block h-3 w-3 rounded border border-slate-300 bg-white" />Dostępny</span>
              <span><i className="mr-1 inline-block h-3 w-3 rounded bg-slate-100" />Miniony</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-black text-slate-900">Wybrane terminy ({slots.length})</h3>
            <p className="mt-1 text-sm text-slate-500">Ustaw domyślne godziny lub zmień je osobno przy dacie.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <label className="text-sm font-bold text-slate-700">Od
                <input type="time" step={1800} max="23:00" value={defaultStartTime} onChange={(event) => updateDefaultStartTime(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3" />
              </label>
              <label className="text-sm font-bold text-slate-700">Do
                <input type="time" step={1800} min={addThirtyMinutes(defaultStartTime)} value={defaultEndTime} onChange={(event) => setDefaultEndTime(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3" />
              </label>
              <button type="button" disabled={slots.length === 0} onClick={applyDefaultHoursToAll} className="col-span-2 rounded-xl border border-green-700 px-3 py-3 text-sm font-black text-green-800 disabled:border-slate-200 disabled:text-slate-400 sm:col-span-1 sm:self-end">Zastosuj</button>
            </div>

            {slots.length === 0 ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Zaznacz co najmniej jeden wolny termin w kalendarzu.</p>
            ) : (
              <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-1">
                {slots.map((slot) => (
                  <div key={slot.date} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black capitalize text-slate-900">{formatPolishIsoDate(slot.date)}</p>
                      <button type="button" onClick={() => toggleDate(slot.date)} aria-label={`Usuń termin ${slot.date}`} className="h-8 w-8 rounded-lg text-xl font-bold text-slate-500 hover:bg-red-50 hover:text-red-700">×</button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <input aria-label={`Godzina od ${slot.date}`} type="time" step={1800} max="23:00" value={slot.startTime} onChange={(event) => updateSlot(slot.date, "startTime", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-2" />
                      <input aria-label={`Godzina do ${slot.date}`} type="time" step={1800} min={addThirtyMinutes(slot.startTime)} value={slot.endTime} onChange={(event) => updateSlot(slot.date, "endTime", event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </fieldset>
  );
}
