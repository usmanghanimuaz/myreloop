import { describe, expect, it } from "vitest";
import { AccountInputSchema, PhoneSchema, SignupSchema } from "@/lib/reloop/moderation";

const base = {
  firstName: "Ayesha",
  lastName: "",
  email: "a@example.com",
  password: "longenough",
  acceptTerms: true as const,
};

describe("signup rules", () => {
  it("requires a first name", () => {
    expect(SignupSchema.safeParse({ ...base, firstName: "" }).success).toBe(false);
  });
  it("requires terms acceptance", () => {
    expect(SignupSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false);
  });
  it("requires passwords of at least 8 characters", () => {
    expect(SignupSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
  });
  it("accepts a valid signup with optional last name empty", () => {
    expect(SignupSchema.safeParse(base).success).toBe(true);
  });
});

describe("private phone", () => {
  it("is optional", () => expect(PhoneSchema.safeParse("").success).toBe(true));
  it("accepts international formats", () =>
    expect(PhoneSchema.safeParse("+92 300 1234567").success).toBe(true));
  it("rejects letters", () => expect(PhoneSchema.safeParse("call me").success).toBe(false));
});

describe("account profile", () => {
  const ok = {
    displayName: "Ayesha",
    generalArea: "Lahore",
    firstName: "Ayesha",
    lastName: "K",
    phone: "",
    notifyRequests: true,
    notifyUpdates: false,
  };
  it("blocks contact details in the display name", () => {
    expect(AccountInputSchema.safeParse({ ...ok, displayName: "a@b.com" }).success).toBe(false);
  });
  it("blocks exact street addresses in general area", () => {
    expect(AccountInputSchema.safeParse({ ...ok, generalArea: "12 Mall Road" }).success).toBe(
      false,
    );
  });
  it("accepts a valid profile", () => expect(AccountInputSchema.safeParse(ok).success).toBe(true));
});
