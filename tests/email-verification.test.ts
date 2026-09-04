import { describe, expect, test } from "vitest";
import {
  getWebmailUrl,
  maskEmail,
  normalizeEmail,
} from "@/lib/email-verification";

describe("pomoc po rejestracji", () => {
  test("normalizuje i bezpiecznie ukrywa adres e-mail", () => {
    expect(normalizeEmail("  Anna.Test@Gmail.com ")).toBe(
      "anna.test@gmail.com",
    );
    expect(maskEmail("anna.test@gmail.com")).toBe("an•••••••@gmail.com");
  });

  test("otwiera skrzynkę znanego dostawcy poczty", () => {
    expect(getWebmailUrl("anna@wp.pl")).toBe("https://poczta.wp.pl/");
    expect(getWebmailUrl("anna@gmail.com")).toBe("https://mail.google.com/");
  });

  test("nie tworzy błędnego odnośnika dla nieznanej domeny", () => {
    expect(getWebmailUrl("anna@example.com")).toBeNull();
  });
});
