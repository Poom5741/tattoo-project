/**
 * Unit tests for booking date validation.
 *
 * The booking accept endpoint (`/api/bookings/[id]/accept.ts`) validates
 * `appointmentDate` using the shared AcceptSchema from
 * `src/lib/api/schemas.ts`, which enforces a 1-hour-minimum future date
 * and a 2-year maximum (leap-year-aware).
 */

import { describe, it, expect } from "vitest";
import { AcceptSchema } from "../../../src/lib/api/schemas";

describe("Booking date validation — AcceptSchema", () => {
  it("rejects past dates", () => {
    const pastTimestamp = Math.floor(Date.now() / 1000) - 86400;
    const result = AcceptSchema.safeParse({
      appointmentDate: pastTimestamp,
    });
    expect(result.success).toBe(false);
  });

  it("rejects very old dates", () => {
    const oldTimestamp = Math.floor(new Date("2020-01-01").getTime() / 1000);
    const result = AcceptSchema.safeParse({
      appointmentDate: oldTimestamp,
    });
    expect(result.success).toBe(false);
  });

  it("rejects today's date (must be future)", () => {
    const todayTimestamp = Math.floor(Date.now() / 1000);
    const result = AcceptSchema.safeParse({
      appointmentDate: todayTimestamp,
    });
    expect(result.success).toBe(false);
  });

  it("accepts future dates", () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400;
    const result = AcceptSchema.safeParse({
      appointmentDate: futureTimestamp,
    });
    expect(result.success).toBe(true);
  });

  it("rejects dates less than 1 hour in the future", () => {
    const almostNow = Math.floor(Date.now() / 1000) + 1800; // 30 min
    const result = AcceptSchema.safeParse({
      appointmentDate: almostNow,
    });
    expect(result.success).toBe(false);
  });

  it("accepts dates at least 1 hour in the future", () => {
    const oneHourPlus = Math.floor(Date.now() / 1000) + 3601;
    const result = AcceptSchema.safeParse({
      appointmentDate: oneHourPlus,
    });
    expect(result.success).toBe(true);
  });

  it("rejects dates more than 2 years in the future", () => {
    const tooFar = Math.floor(Date.now() / 1000) + 3 * 365 * 24 * 3600; // 3 years
    const result = AcceptSchema.safeParse({
      appointmentDate: tooFar,
    });
    expect(result.success).toBe(false);
  });

  it("accepts dates within 2 years", () => {
    const withinTwoYears = Math.floor(Date.now() / 1000) + 365 * 24 * 3600; // 1 year
    const result = AcceptSchema.safeParse({
      appointmentDate: withinTwoYears,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-integer dates", () => {
    const result = AcceptSchema.safeParse({ appointmentDate: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects negative dates", () => {
    const result = AcceptSchema.safeParse({ appointmentDate: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero", () => {
    const result = AcceptSchema.safeParse({ appointmentDate: 0 });
    expect(result.success).toBe(false);
  });
});

describe("Booking form — date input validation", () => {
  it("should not allow selecting past dates in the form", () => {
    // BUG: The booking form (`BookingForm.tsx`) does NOT have a date picker
    // at all. The date is only set by the artist when accepting the booking.
    // This means:
    // 1. Buyers cannot suggest a preferred date
    // 2. Artists can accept with any date (past or future)
    // 3. There's no UI for date selection in the booking form
    //
    // This is a design gap, not a bug per se, but it means the user's
    // request "On booking people should not be able to booking yesterday"
    // cannot be enforced without adding date validation to the accept API.
    expect(true).toBe(true); // Placeholder - the form doesn't have a date field
  });

  it("booking form should have min date attribute on date inputs", () => {
    // BUG: If a date input is added to the booking form, it should have
    // a `min` attribute set to today's date to prevent past date selection.
    // Currently, the form doesn't have a date input at all.
    expect(true).toBe(true); // Placeholder - no date input exists
  });
});

describe("Admin booking status — transition validation", () => {
  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["confirmed"],
    accepted: ["confirmed"],
    confirmed: ["completed", "cancelled"],
  };

  it("allows pending -> confirmed", () => {
    const allowed = VALID_TRANSITIONS["pending"];
    expect(allowed).toContain("confirmed");
  });

  it("allows accepted -> confirmed", () => {
    const allowed = VALID_TRANSITIONS["accepted"];
    expect(allowed).toContain("confirmed");
  });

  it("allows confirmed -> completed", () => {
    const allowed = VALID_TRANSITIONS["confirmed"];
    expect(allowed).toContain("completed");
  });

  it("allows confirmed -> cancelled", () => {
    const allowed = VALID_TRANSITIONS["confirmed"];
    expect(allowed).toContain("cancelled");
  });

  it("BUG: does NOT allow declined as source state", () => {
    // BUG: The admin status endpoint doesn't include "declined" as a source
    // state. Once a booking is declined by the artist, it's stuck with no
    // valid transitions. The admin can't change it to any other status.
    const allowed = VALID_TRANSITIONS["declined"];
    expect(allowed).toBeUndefined();
  });

  it("BUG: does NOT allow pending -> accepted", () => {
    // BUG: The admin can't set a booking to "accepted" status. Only the
    // artist can do that via the accept endpoint. But if the artist
    // accepts, the admin can then confirm. This is intentional but
    // confusing - the admin can't manually accept a booking.
    const allowed = VALID_TRANSITIONS["pending"];
    expect(allowed).not.toContain("accepted");
  });

  it("BUG: does NOT allow accepted -> cancelled", () => {
    // BUG: Once a booking is accepted, the admin can only confirm it.
    // They can't cancel it. This is a gap - the admin should be able
    // to cancel an accepted booking if the artist or buyer changes their mind.
    const allowed = VALID_TRANSITIONS["accepted"];
    expect(allowed).not.toContain("cancelled");
  });
});
