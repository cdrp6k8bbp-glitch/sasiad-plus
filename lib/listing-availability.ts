export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Poniedziałek", shortLabel: "pon." },
  { value: 2, label: "Wtorek", shortLabel: "wt." },
  { value: 3, label: "Środa", shortLabel: "śr." },
  { value: 4, label: "Czwartek", shortLabel: "czw." },
  { value: 5, label: "Piątek", shortLabel: "pt." },
  { value: 6, label: "Sobota", shortLabel: "sob." },
  { value: 0, label: "Niedziela", shortLabel: "niedz." },
] as const;

export type AvailabilitySlot = {
  date: string;
  startTime: string;
  endTime: string;
};

export type AvailabilityMode = "specific" | "flexible";
export type ListingAvailabilityState = "available" | "flexible" | "expired";

export type ListingAvailability = {
  mode: AvailabilityMode;
  note: string | null;
  slots: AvailabilitySlot[] | null;
  dates: string[] | null;
  weekdays: number[];
  startTime: string;
  endTime: string;
};

export const DEFAULT_LISTING_AVAILABILITY: ListingAvailability = {
  mode: "specific",
  note: null,
  slots: null,
  dates: null,
  weekdays: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "17:00",
};

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):(?:00|30)$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_WEEKDAYS = new Set(WEEKDAY_OPTIONS.map((day) => day.value));

function isoDateFromUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function utcDateFromIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export function todayIsoInPoland(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function calendarWindowForIsoDate(today: string): {
  minDate: string;
  maxDate: string;
} {
  const date = utcDateFromIsoDate(today);
  if (!date) throw new Error("Nieprawidłowa data kalendarza.");

  const maxDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 3, 0, 12),
  );

  return { minDate: today, maxDate: isoDateFromUtcDate(maxDate) };
}

export function parseAvailabilityWeekdays(value: string | null): number[] {
  if (!value) return [];

  const selected = new Set(
    value
      .split(",")
      .map((weekday) => Number(weekday))
      .filter((weekday) =>
        VALID_WEEKDAYS.has(weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6),
      ),
  );

  return WEEKDAY_OPTIONS.map((day) => day.value).filter((weekday) =>
    selected.has(weekday),
  );
}

export function parseAvailabilityDates(value: string | null): string[] {
  if (!value) return [];

  return [
    ...new Set(
      value
        .split(",")
        .map((date) => date.trim())
        .filter((date) => utcDateFromIsoDate(date) !== null),
    ),
  ].sort();
}

export function parseAvailabilitySlots(
  value: string | null,
): AvailabilitySlot[] {
  if (!value) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const slots: AvailabilitySlot[] = [];
  const dates = new Set<string>();

  for (const slot of parsed) {
    if (
      !slot ||
      typeof slot !== "object" ||
      !("date" in slot) ||
      !("startTime" in slot) ||
      !("endTime" in slot) ||
      typeof slot.date !== "string" ||
      typeof slot.startTime !== "string" ||
      typeof slot.endTime !== "string" ||
      utcDateFromIsoDate(slot.date) === null ||
      !TIME_PATTERN.test(slot.startTime) ||
      !TIME_PATTERN.test(slot.endTime) ||
      slot.endTime <= slot.startTime ||
      dates.has(slot.date)
    ) {
      return [];
    }

    dates.add(slot.date);
    slots.push({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  }

  return slots.sort((left, right) => left.date.localeCompare(right.date));
}

function availabilityFromSlots(slots: AvailabilitySlot[]): ListingAvailability {
  const dates = slots.map((slot) => slot.date);
  const weekdays = [
    ...new Set(
      dates
        .map(weekdayForIsoDate)
        .filter((weekday): weekday is number => weekday !== null),
    ),
  ];

  return {
    mode: "specific",
    note: null,
    slots,
    dates,
    weekdays,
    startTime: slots.reduce(
      (earliest, slot) =>
        slot.startTime < earliest ? slot.startTime : earliest,
      slots[0]?.startTime ?? DEFAULT_LISTING_AVAILABILITY.startTime,
    ),
    endTime: slots.reduce(
      (latest, slot) => (slot.endTime > latest ? slot.endTime : latest),
      slots[0]?.endTime ?? DEFAULT_LISTING_AVAILABILITY.endTime,
    ),
  };
}

export function datesForWeekdaysInCalendarWindow(
  weekdays: number[],
  today: string,
): string[] {
  const { minDate, maxDate } = calendarWindowForIsoDate(today);
  const selectedWeekdays = new Set(weekdays);
  const date = utcDateFromIsoDate(minDate);
  const lastDate = utcDateFromIsoDate(maxDate);
  if (!date || !lastDate) return [];

  const dates: string[] = [];
  while (date <= lastDate) {
    if (selectedWeekdays.has(date.getUTCDay())) {
      dates.push(isoDateFromUtcDate(date));
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return dates;
}

export function availableDatesForCalendar(
  availability: ListingAvailability,
  today: string,
): string[] {
  if (availability.mode === "flexible") return [];

  const { minDate, maxDate } = calendarWindowForIsoDate(today);

  if (availability.slots !== null) {
    return availability.slots
      .map((slot) => slot.date)
      .filter((date) => date >= minDate && date <= maxDate);
  }

  if (availability.dates !== null) {
    return availability.dates.filter(
      (date) => date >= minDate && date <= maxDate,
    );
  }

  return datesForWeekdaysInCalendarWindow(availability.weekdays, today);
}

export function listingAvailabilityState(
  availability: ListingAvailability,
  today = todayIsoInPoland(),
): ListingAvailabilityState {
  if (availability.mode === "flexible") return "flexible";
  return availableDatesForCalendar(availability, today).length > 0
    ? "available"
    : "expired";
}

export function listingAvailabilityStateFromRecord(
  listing: {
    availability_mode?: string | null;
    availability_note?: string | null;
    availability_slots?: string | null;
    availability_dates?: string | null;
    availability_weekdays: string | null;
    availability_start_time: string | null;
    availability_end_time: string | null;
  },
  today = todayIsoInPoland(),
): ListingAvailabilityState {
  return listingAvailabilityState(
    listingAvailabilityFromStorage({
      mode: listing.availability_mode,
      note: listing.availability_note,
      slots: listing.availability_slots,
      dates: listing.availability_dates,
      weekdays: listing.availability_weekdays,
      startTime: listing.availability_start_time,
      endTime: listing.availability_end_time,
    }),
    today,
  );
}

export function readListingAvailability(
  formData: FormData,
  today = todayIsoInPoland(),
): ListingAvailability {
  const modeValue = formData.get("availability_mode");
  const mode: AvailabilityMode =
    modeValue === "flexible" ? "flexible" : "specific";
  const noteValue = formData.get("availability_note");
  const note =
    typeof noteValue === "string" && noteValue.trim().length > 0
      ? noteValue.trim()
      : null;

  if (note && note.length > 300) {
    throw new Error("Informacja o dostępności może mieć maksymalnie 300 znaków.");
  }

  if (mode === "flexible") {
    return {
      mode,
      note,
      slots: null,
      dates: null,
      weekdays: [],
      startTime: DEFAULT_LISTING_AVAILABILITY.startTime,
      endTime: DEFAULT_LISTING_AVAILABILITY.endTime,
    };
  }

  const slotsValue = formData.get("availability_slots");
  const { minDate, maxDate } = calendarWindowForIsoDate(today);

  if (typeof slotsValue === "string") {
    let rawSlots: unknown;
    try {
      rawSlots = JSON.parse(slotsValue);
    } catch {
      throw new Error("Ustaw prawidłowe godziny dla wybranych terminów.");
    }

    const slots = parseAvailabilitySlots(slotsValue);
    if (
      !Array.isArray(rawSlots) ||
      slots.length === 0 ||
      slots.length !== rawSlots.length
    ) {
      throw new Error("Ustaw prawidłowe godziny dla każdego wybranego terminu.");
    }

    if (
      slots.length > 93 ||
      slots.some((slot) => slot.date < minDate || slot.date > maxDate)
    ) {
      throw new Error("Terminy mogą obejmować tylko bieżący i dwa kolejne miesiące.");
    }

    return availabilityFromSlots(slots);
  }

  const datesValue = formData.get("availability_dates");
  const rawDates =
    typeof datesValue === "string"
      ? datesValue
          .split(",")
          .map((date) => date.trim())
          .filter(Boolean)
      : [];
  const dates = parseAvailabilityDates(
    typeof datesValue === "string" ? datesValue : null,
  );
  const startTime = formData.get("availability_start_time");
  const endTime = formData.get("availability_end_time");

  if (
    rawDates.length === 0 ||
    rawDates.some((date) => !ISO_DATE_PATTERN.test(date)) ||
    dates.length !== new Set(rawDates).size
  ) {
    throw new Error("Wybierz co najmniej jeden prawidłowy termin w kalendarzu.");
  }

  if (
    dates.length > 93 ||
    dates.some((date) => date < minDate || date > maxDate)
  ) {
    throw new Error("Terminy mogą obejmować tylko bieżący i dwa kolejne miesiące.");
  }

  if (
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    !TIME_PATTERN.test(startTime) ||
    !TIME_PATTERN.test(endTime) ||
    endTime <= startTime
  ) {
    throw new Error("Ustaw prawidłowe godziny dostępności co 30 minut.");
  }

  const weekdays = [
    ...new Set(
      dates
        .map(weekdayForIsoDate)
        .filter((weekday): weekday is number => weekday !== null),
    ),
  ];

  return {
    mode: "specific",
    note: null,
    slots: null,
    dates,
    weekdays,
    startTime,
    endTime,
  };
}

export function listingAvailabilityFromStorage({
  mode,
  note,
  slots,
  dates,
  weekdays,
  startTime,
  endTime,
}: {
  mode?: string | null;
  note?: string | null;
  slots?: string | null;
  dates?: string | null;
  weekdays: string | null;
  startTime: string | null;
  endTime: string | null;
}): ListingAvailability {
  if (mode === "flexible") {
    return {
      mode: "flexible",
      note: note?.trim() || null,
      slots: null,
      dates: null,
      weekdays: [],
      startTime: DEFAULT_LISTING_AVAILABILITY.startTime,
      endTime: DEFAULT_LISTING_AVAILABILITY.endTime,
    };
  }

  if (slots != null) {
    const parsedSlots = parseAvailabilitySlots(slots);
    if (parsedSlots.length > 0) return availabilityFromSlots(parsedSlots);
  }

  const parsedWeekdays = parseAvailabilityWeekdays(weekdays);
  const parsedDates = dates == null ? null : parseAvailabilityDates(dates);

  if (
    parsedWeekdays.length === 0 ||
    !startTime ||
    !endTime ||
    !TIME_PATTERN.test(startTime) ||
    !TIME_PATTERN.test(endTime) ||
    endTime <= startTime
  ) {
    return {
      ...DEFAULT_LISTING_AVAILABILITY,
      mode: "specific",
      note: null,
      slots: null,
      dates: parsedDates,
    };
  }

  return {
    mode: "specific",
    note: null,
    slots: null,
    dates: parsedDates,
    weekdays: parsedWeekdays,
    startTime,
    endTime,
  };
}

export function availabilityWeekdaysValue(weekdays: number[]): string {
  return WEEKDAY_OPTIONS.map((day) => day.value)
    .filter((weekday) => weekdays.includes(weekday))
    .join(",");
}

export function availabilityDatesValue(dates: string[] | null): string | null {
  return dates?.join(",") ?? null;
}

export function availabilitySlotsValue(
  slots: AvailabilitySlot[] | null,
): string | null {
  return slots ? JSON.stringify(slots) : null;
}

export function availabilitySlotForDate(
  availability: ListingAvailability,
  date: string,
): AvailabilitySlot | null {
  if (availability.mode === "flexible") return null;

  if (availability.slots !== null) {
    return availability.slots.find((slot) => slot.date === date) ?? null;
  }

  const dateIsAvailable =
    availability.dates !== null
      ? availability.dates.includes(date)
      : (() => {
          const weekday = weekdayForIsoDate(date);
          return weekday !== null && availability.weekdays.includes(weekday);
        })();

  return dateIsAvailable
    ? {
        date,
        startTime: availability.startTime,
        endTime: availability.endTime,
      }
    : null;
}

export function weekdayForIsoDate(value: string): number | null {
  return utcDateFromIsoDate(value)?.getUTCDay() ?? null;
}

function isoDatesInRange(startDate: string, endDate: string): string[] {
  const current = utcDateFromIsoDate(startDate);
  const last = utcDateFromIsoDate(endDate);
  if (!current || !last || current > last) return [];

  const dates: string[] = [];
  while (current <= last && dates.length <= 93) {
    dates.push(isoDateFromUtcDate(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return current <= last ? [] : dates;
}

export function isReservationWithinAvailability(
  availability: ListingAvailability,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): boolean {
  if (availability.mode === "flexible") return false;

  const reservationDates = isoDatesInRange(startDate, endDate);
  if (reservationDates.length === 0) return false;

  if (availability.slots !== null) {
    const slots = reservationDates.map((date) =>
      availabilitySlotForDate(availability, date),
    );
    if (slots.some((slot) => slot === null)) return false;

    const firstSlot = slots[0];
    const lastSlot = slots.at(-1);
    if (!firstSlot || !lastSlot) return false;

    return (
      startTime >= firstSlot.startTime &&
      startTime < firstSlot.endTime &&
      endTime >= lastSlot.startTime &&
      endTime <= lastSlot.endTime &&
      (startDate !== endDate || endTime > startTime)
    );
  }

  const datesAreAvailable =
    availability.dates !== null
      ? reservationDates.every((date) => availability.dates?.includes(date))
      : reservationDates.every((date) => {
          const weekday = weekdayForIsoDate(date);
          return weekday !== null && availability.weekdays.includes(weekday);
        });

  return (
    datesAreAvailable &&
    startTime >= availability.startTime &&
    startTime < availability.endTime &&
    endTime >= availability.startTime &&
    endTime <= availability.endTime
  );
}

export function formatPolishIsoDate(value: string): string {
  const date = utcDateFromIsoDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatListingAvailability(
  availability: ListingAvailability,
  today?: string,
): string {
  if (availability.mode === "flexible") {
    return availability.note || "Termin do ustalenia z właścicielem.";
  }

  if (availability.slots !== null) {
    const slots = today
      ? availability.slots.filter((slot) => slot.date >= today)
      : availability.slots;
    if (slots.length === 0) {
      return "Brak przyszłych terminów";
    }

    const firstSlot = slots[0];
    const lastSlot = slots.at(-1) ?? firstSlot;
    const timeRanges = new Set(
      slots.map(
        (slot) => `${slot.startTime}–${slot.endTime}`,
      ),
    );
    const hours =
      timeRanges.size === 1
        ? [...timeRanges][0]
        : "różne godziny dla poszczególnych dni";

    return `${slots.length} wybranych terminów · ${formatPolishIsoDate(firstSlot.date)} – ${formatPolishIsoDate(lastSlot.date)} · ${hours}`;
  }

  if (availability.dates !== null) {
    const dates = today
      ? availability.dates.filter((date) => date >= today)
      : availability.dates;
    if (dates.length === 0) {
      return "Brak przyszłych terminów";
    }

    const firstDate = dates[0];
    const lastDate = dates.at(-1) ?? firstDate;
    return `${dates.length} wybranych terminów · ${formatPolishIsoDate(firstDate)} – ${formatPolishIsoDate(lastDate)} · ${availability.startTime}–${availability.endTime}`;
  }

  const labels = WEEKDAY_OPTIONS.filter((day) =>
    availability.weekdays.includes(day.value),
  ).map((day) => day.label.toLowerCase());

  return `${labels.join(", ")} · ${availability.startTime}–${availability.endTime}`;
}
