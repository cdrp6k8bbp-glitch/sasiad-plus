import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { runListingFreshnessMaintenance } from "@/lib/listing-freshness";
import { createTestDatabase, seedUser } from "./support/d1";

const projectRoot = process.cwd();

describe("aktualność ogłoszeń", () => {
  let testDatabase: ReturnType<typeof createTestDatabase>;

  beforeEach(() => {
    testDatabase = createTestDatabase(projectRoot);
    seedUser(testDatabase.database, {
      id: "owner-1",
      name: "Właściciel",
      email: "owner@example.com",
    });
    seedUser(testDatabase.database, {
      id: "requester-1",
      name: "Rezerwujący",
      email: "requester@example.com",
    });

    const insert = testDatabase.database.prepare(
      `INSERT INTO listings (
         id, title, category, description, price, location, owner_id,
         freshness_confirmed_at
       ) VALUES (?, ?, 'sprzet', 'Opis', '20 zł', 'Słupsk', 'owner-1', ?)`,
    );
    insert.run(1, "Do przypomnienia", "2026-07-14T10:00:00.000Z");
    insert.run(2, "Do archiwum", "2026-07-01T10:00:00.000Z");
    insert.run(3, "Świeża oferta", "2026-08-20T10:00:00.000Z");
    insert.run(4, "Oferta z rezerwacją", "2026-07-01T10:00:00.000Z");

    testDatabase.database
      .prepare(
        `INSERT INTO reservations (
           listing_id, requester_id, owner_id, start_date, end_date,
           start_time, end_time, status
         ) VALUES (4, 'requester-1', 'owner-1', '2026-09-10', '2026-09-10',
                   '09:00', '10:00', 'accepted')`,
      )
      .run();
  });

  afterEach(() => testDatabase.close());

  test("przypomina po 53 dniach i archiwizuje po 60 dniach", async () => {
    const result = await runListingFreshnessMaintenance(
      testDatabase.d1,
      new Date("2026-09-06T12:00:00.000Z"),
    );

    expect(result.reminded.map((item) => item.listingId)).toEqual([1]);
    expect(result.archived.map((item) => item.listingId)).toEqual([2]);

    const listings = testDatabase.database
      .prepare(
        `SELECT id, freshness_reminded_at, archived_at
         FROM listings ORDER BY id`,
      )
      .all() as Array<{
      id: number;
      freshness_reminded_at: string | null;
      archived_at: string | null;
    }>;
    expect(listings[0].freshness_reminded_at).toBe(
      "2026-09-06T12:00:00.000Z",
    );
    expect(listings[1].archived_at).toBe("2026-09-06T12:00:00.000Z");
    expect(listings[2].archived_at).toBeNull();
    expect(listings[3].archived_at).toBeNull();

    const notificationTypes = testDatabase.database
      .prepare("SELECT type FROM notifications ORDER BY id")
      .all()
      .map((row) => row.type);
    expect(notificationTypes).toEqual([
      "listing_freshness_reminder",
      "listing_archived",
    ]);
  });

  test("nie wysyła tego samego przypomnienia ponownie", async () => {
    const now = new Date("2026-09-06T12:00:00.000Z");
    await runListingFreshnessMaintenance(testDatabase.d1, now);
    const second = await runListingFreshnessMaintenance(testDatabase.d1, now);

    expect(second.reminded).toEqual([]);
    expect(second.archived).toEqual([]);
  });
});
