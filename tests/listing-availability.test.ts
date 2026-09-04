import { describe, expect, test } from "vitest";
import {
  availableDatesForCalendar,
  calendarWindowForIsoDate,
  datesForWeekdaysInCalendarWindow,
  isReservationWithinAvailability,
  listingAvailabilityFromStorage,
  readListingAvailability,
  type ListingAvailability,
} from "@/lib/listing-availability";

describe("kalendarz dostępności ogłoszenia", () => {
  test("obejmuje bieżący miesiąc i dwa kolejne", () => {
    expect(calendarWindowForIsoDate("2026-08-01")).toEqual({
      minDate: "2026-08-01",
      maxDate: "2026-10-31",
    });

    const weekendDates = datesForWeekdaysInCalendarWindow(
      [5, 0],
      "2026-08-01",
    );
    expect(weekendDates).toContain("2026-08-02");
    expect(weekendDates).toContain("2026-10-30");
    expect(weekendDates).not.toContain("2026-11-01");
  });

  test("zapisuje osobne godziny dla każdej daty", () => {
    const formData = new FormData();
    formData.set(
      "availability_slots",
      JSON.stringify([
        { date: "2026-08-01", startTime: "10:00", endTime: "14:00" },
        { date: "2026-09-04", startTime: "16:00", endTime: "20:00" },
        { date: "2026-10-30", startTime: "18:00", endTime: "22:00" },
      ]),
    );

    expect(readListingAvailability(formData, "2026-08-01")).toMatchObject({
      slots: [
        { date: "2026-08-01", startTime: "10:00", endTime: "14:00" },
        { date: "2026-09-04", startTime: "16:00", endTime: "20:00" },
        { date: "2026-10-30", startTime: "18:00", endTime: "22:00" },
      ],
      dates: ["2026-08-01", "2026-09-04", "2026-10-30"],
      startTime: "10:00",
      endTime: "22:00",
    });

    formData.set(
      "availability_slots",
      JSON.stringify([
        { date: "2026-11-01", startTime: "16:00", endTime: "20:00" },
      ]),
    );
    expect(() => readListingAvailability(formData, "2026-08-01")).toThrow(
      "Terminy mogą obejmować tylko bieżący i dwa kolejne miesiące.",
    );
  });

  test("rezerwacja może objąć tylko kolejne udostępnione dni", () => {
    const availability: ListingAvailability = {
      mode: "specific",
      note: null,
      slots: [
        { date: "2026-08-07", startTime: "16:00", endTime: "20:00" },
        { date: "2026-08-08", startTime: "10:00", endTime: "14:00" },
        { date: "2026-08-09", startTime: "18:00", endTime: "22:00" },
        { date: "2026-08-11", startTime: "09:00", endTime: "12:00" },
      ],
      dates: ["2026-08-07", "2026-08-08", "2026-08-09", "2026-08-11"],
      weekdays: [5, 6, 0, 2],
      startTime: "09:00",
      endTime: "22:00",
    };

    expect(
      isReservationWithinAvailability(
        availability,
        "2026-08-07",
        "16:00",
        "2026-08-09",
        "22:00",
      ),
    ).toBe(true);
    expect(
      isReservationWithinAvailability(
        availability,
        "2026-08-08",
        "09:30",
        "2026-08-08",
        "14:00",
      ),
    ).toBe(false);
    expect(
      isReservationWithinAvailability(
        availability,
        "2026-08-09",
        "16:00",
        "2026-08-11",
        "20:00",
      ),
    ).toBe(false);
    expect(availableDatesForCalendar(availability, "2026-08-08")).toEqual([
      "2026-08-08",
      "2026-08-09",
      "2026-08-11",
    ]);
  });

  test("zapisuje dostępność do ustalenia bez wymagania dat", () => {
    const formData = new FormData();
    formData.set("availability_mode", "flexible");
    formData.set(
      "availability_note",
      "Najczęściej w weekendy po południu.",
    );
    formData.set("availability_slots", "");

    const availability = readListingAvailability(formData, "2026-08-01");

    expect(availability).toMatchObject({
      mode: "flexible",
      note: "Najczęściej w weekendy po południu.",
      slots: null,
      dates: null,
    });
    expect(availableDatesForCalendar(availability, "2026-08-01")).toEqual([]);
    expect(
      isReservationWithinAvailability(
        availability,
        "2026-08-07",
        "16:00",
        "2026-08-07",
        "17:00",
      ),
    ).toBe(false);
  });

  test("starsze ogłoszenie bez zapisanego trybu zachowuje konkretne terminy", () => {
    const availability = listingAvailabilityFromStorage({
      slots: JSON.stringify([
        { date: "2026-08-07", startTime: "16:00", endTime: "20:00" },
      ]),
      dates: "2026-08-07",
      weekdays: "5",
      startTime: "16:00",
      endTime: "20:00",
    });

    expect(availability.mode).toBe("specific");
    expect(availability.slots).toHaveLength(1);
  });
});
