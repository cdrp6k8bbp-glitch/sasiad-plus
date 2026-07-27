import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createTestDatabase, seedUser } from "@/tests/support/d1";

type TestSession = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

const state = vi.hoisted(() => ({
  session: null as TestSession | null,
  env: null as (CloudflareEnv & {
    ADMIN_EMAILS?: string;
    RESEND_API_KEY?: string;
  }) | null,
  revalidated: [] as string[],
  backgroundTasks: [] as Promise<unknown>[],
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: async () => ({
    env: state.env,
    ctx: {
      waitUntil(promise: Promise<unknown>) {
        state.backgroundTasks.push(promise);
      },
      passThroughOnException() {},
      props: {},
    },
  }),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: async () => state.session,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => state.revalidated.push(path),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/lib/email", () => ({
  sendReservationUpdateEmail: async () => {},
}));

vi.mock("@/lib/push", () => ({
  sendPushNotification: async () => {},
}));

import {
  cancelReservation,
  createReservation,
} from "@/app/rezerwacje/actions";
import { createReview } from "@/app/oceny/actions";
import { sendMessage } from "@/app/wiadomosci/actions";
import { deleteUserApplicationData } from "@/lib/account-deletion";
import { isAdminEmail, requireAdmin } from "@/lib/admin";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const owner = {
  id: "owner",
  name: "Właściciel",
  email: "owner@example.com",
};
const requester = {
  id: "requester",
  name: "Rezerwujący",
  email: "requester@example.com",
};
const outsider = {
  id: "outsider",
  name: "Osoba obca",
  email: "outsider@example.com",
};

describe("najważniejsze operacje aplikacji", () => {
  let testDatabase: ReturnType<typeof createTestDatabase>;
  let deletedImageKeys: string[];

  beforeEach(() => {
    testDatabase = createTestDatabase(projectRoot);
    seedUser(testDatabase.database, owner);
    seedUser(testDatabase.database, requester);
    seedUser(testDatabase.database, outsider);

    deletedImageKeys = [];
    const imageObjects = [
      {
        key: "listings/owner/extra.jpg",
        customMetadata: { ownerId: owner.id },
      },
      {
        key: "listings/requester/other.jpg",
        customMetadata: { ownerId: requester.id },
      },
    ];

    state.env = {
      DB: testDatabase.d1,
      ADMIN_EMAILS: owner.email,
      BETTER_AUTH_SECRET: "test-secret-that-is-long-enough",
      BETTER_AUTH_URL: "https://example.test",
      RESEND_API_KEY: "re_test",
      sasiad_plus_images: {
        list: async () => ({
          objects: imageObjects,
          truncated: false,
          delimitedPrefixes: [],
        }),
        delete: async (keys: string | string[]) => {
          deletedImageKeys.push(...(Array.isArray(keys) ? keys : [keys]));
        },
      } as unknown as R2Bucket,
    } as unknown as CloudflareEnv & {
      ADMIN_EMAILS: string;
      RESEND_API_KEY: string;
    };

    state.session = null;
    state.revalidated.length = 0;
    state.backgroundTasks.length = 0;

    testDatabase.database
      .prepare(
        `INSERT INTO listings (
           id, title, category, description, price, location, owner_id
         ) VALUES (1, 'Wiertarka', 'sprzet', 'Test', '20', 'Redzikowo', ?)`,
      )
      .run(owner.id);
  });

  afterEach(() => {
    testDatabase.close();
  });

  function signIn(user: typeof owner) {
    state.session = { user };
  }

  function reservationForm() {
    const formData = new FormData();
    formData.set("listing_id", "1");
    formData.set("start_date", "2030-08-12");
    formData.set("end_date", "2030-08-12");
    formData.set("start_time", "09:00");
    formData.set("end_time", "17:00");
    formData.set("note", "Proszę o rezerwację");
    return formData;
  }

  test("tworzy poprawną rezerwację i powiadamia właściciela", async () => {
    signIn(requester);

    await expect(createReservation(reservationForm())).rejects.toThrow(
      "NEXT_REDIRECT:/ogloszenie/1?rezerwacja=wyslana",
    );

    const reservation = testDatabase.database
      .prepare(
        `SELECT requester_id, owner_id, status
         FROM reservations
         WHERE listing_id = 1`,
      )
      .get() as {
      requester_id: string;
      owner_id: string;
      status: string;
    };
    const notification = testDatabase.database
      .prepare(
        `SELECT user_id, type
         FROM notifications
         WHERE user_id = ?`,
      )
      .get(owner.id) as { user_id: string; type: string };

    expect(reservation).toEqual({
      requester_id: requester.id,
      owner_id: owner.id,
      status: "pending",
    });
    expect(notification.type).toBe("reservation_created");
  });

  test("pozwala wysłać wiadomość tylko uczestnikowi rozmowy", async () => {
    testDatabase.database
      .prepare(
        `INSERT INTO conversations (id, listing_id, buyer_id, seller_id)
         VALUES (1, 1, ?, ?)`,
      )
      .run(requester.id, owner.id);

    const formData = new FormData();
    formData.set("body", "Wiadomość testowa");

    signIn(outsider);
    await expect(sendMessage(1, formData)).rejects.toThrow(
      "Nie masz dostępu do tej rozmowy.",
    );

    signIn(requester);
    await sendMessage(1, formData);

    const message = testDatabase.database
      .prepare(
        `SELECT sender_id, body
         FROM messages
         WHERE conversation_id = 1`,
      )
      .get() as { sender_id: string; body: string };
    expect(message).toEqual({
      sender_id: requester.id,
      body: "Wiadomość testowa",
    });
  });

  test("anulowanie działa dla strony rezerwacji, ale nie dla osoby obcej", async () => {
    testDatabase.database
      .prepare(
        `INSERT INTO reservations (
           id, listing_id, requester_id, owner_id, start_date, end_date,
           start_time, end_time, status
         ) VALUES (
           1, 1, ?, ?, '2030-08-12', '2030-08-12',
           '09:00', '17:00', 'accepted'
         )`,
      )
      .run(requester.id, owner.id);

    const formData = new FormData();
    formData.set("reservation_id", "1");

    signIn(outsider);
    await expect(cancelReservation(formData)).rejects.toThrow(
      "Nie można anulować tej rezerwacji.",
    );

    signIn(requester);
    await expect(cancelReservation(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/profil?rezerwacja=anulowana#rezerwacje",
    );

    const result = testDatabase.database
      .prepare("SELECT status FROM reservations WHERE id = 1")
      .get() as { status: string };
    expect(result.status).toBe("cancelled");
  });

  test("opinię można dodać raz i dopiero po zakończonej rezerwacji", async () => {
    testDatabase.database
      .prepare(
        `INSERT INTO reservations (
           id, listing_id, requester_id, owner_id, start_date, end_date,
           start_time, end_time, status, completed_at
         ) VALUES (
           1, 1, ?, ?, '2030-08-12', '2030-08-12',
           '09:00', '17:00', 'accepted', NULL
         )`,
      )
      .run(requester.id, owner.id);

    const formData = new FormData();
    formData.set("reservation_id", "1");
    formData.set("rating", "5");
    formData.set("body", "Wszystko przebiegło bardzo dobrze.");

    signIn(requester);
    await expect(createReview(formData)).rejects.toThrow(
      "Nie możesz ocenić tej rezerwacji.",
    );

    testDatabase.database
      .prepare(
        `UPDATE reservations
         SET completed_at = datetime('now')
         WHERE id = 1`,
      )
      .run();

    await expect(createReview(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/profil?oceniono=1#rezerwacje",
    );
    await expect(createReview(formData)).rejects.toThrow(
      "Opinia dla tej rezerwacji została już przez Ciebie wystawiona.",
    );

    const review = testDatabase.database
      .prepare(
        `SELECT reviewer_id, reviewed_id, rating
         FROM reviews
         WHERE reservation_id = 1`,
      )
      .get() as {
      reviewer_id: string;
      reviewed_id: string;
      rating: number;
    };
    expect(review).toEqual({
      reviewer_id: requester.id,
      reviewed_id: owner.id,
      rating: 5,
    });
  });

  test("usunięcie konta czyści powiązane dane i zdjęcia", async () => {
    testDatabase.database
      .prepare(
        `UPDATE listings
         SET image_key = ?, image_keys = ?
         WHERE id = 1`,
      )
      .run(
        "listings/owner/main.jpg",
        JSON.stringify([
          "listings/owner/main.jpg",
          "listings/owner/gallery.jpg",
        ]),
      );
    testDatabase.database
      .prepare(
        `INSERT INTO conversations (id, listing_id, buyer_id, seller_id)
         VALUES (1, 1, ?, ?)`,
      )
      .run(requester.id, owner.id);
    testDatabase.database
      .prepare(
        `INSERT INTO messages (conversation_id, sender_id, body)
         VALUES (1, ?, 'Test')`,
      )
      .run(owner.id);
    testDatabase.database
      .prepare(
        `INSERT INTO reservations (
           id, listing_id, requester_id, owner_id, start_date, end_date,
           start_time, end_time, status
         ) VALUES (
           1, 1, ?, ?, '2030-08-12', '2030-08-12',
           '09:00', '17:00', 'accepted'
         )`,
      )
      .run(requester.id, owner.id);
    testDatabase.database
      .prepare(
        `INSERT INTO user_profiles (user_id, city, bio)
         VALUES (?, 'Redzikowo', 'Profil testowy')`,
      )
      .run(owner.id);
    testDatabase.database
      .prepare(
        `INSERT INTO favorite_listings (user_id, listing_id)
         VALUES (?, 1)`,
      )
      .run(requester.id);

    await deleteUserApplicationData(state.env as CloudflareEnv, owner.id);

    const remaining = testDatabase.database
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM listings WHERE owner_id = ?) AS listings,
           (SELECT COUNT(*) FROM conversations WHERE seller_id = ?) AS conversations,
           (SELECT COUNT(*) FROM reservations WHERE owner_id = ?) AS reservations,
           (SELECT COUNT(*) FROM user_profiles WHERE user_id = ?) AS profiles`,
      )
      .get(owner.id, owner.id, owner.id, owner.id) as Record<string, number>;

    expect(remaining).toEqual({
      listings: 0,
      conversations: 0,
      reservations: 0,
      profiles: 0,
    });
    expect(deletedImageKeys.sort()).toEqual(
      [
        "listings/owner/extra.jpg",
        "listings/owner/gallery.jpg",
        "listings/owner/main.jpg",
      ].sort(),
    );
  });

  test("uprawnienia administratora ignorują wielkość liter i blokują obce konto", async () => {
    expect(
      isAdminEmail(
        " OWNER@EXAMPLE.COM ",
        "admin@example.com, owner@example.com",
      ),
    ).toBe(true);

    signIn(outsider);
    await expect(requireAdmin()).rejects.toThrow("NEXT_NOT_FOUND");

    signIn(owner);
    await expect(requireAdmin()).resolves.toEqual({ user: owner });
  });
});
