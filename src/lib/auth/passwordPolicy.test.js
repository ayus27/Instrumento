import { describe, it, expect } from "vitest";
import { passwordError, createLoginLimiter } from "./passwordPolicy";

describe("password policy", () => {
  it("rejects passwords shorter than 10 characters", () => {
    expect(passwordError("Ab1!abcd")).not.toBeNull();
  });
  it("rejects passwords without a symbol", () => {
    expect(passwordError("Abcdefgh12")).not.toBeNull();
  });
  it("accepts a password meeting all rules", () => {
    expect(passwordError("Abcdefg12!")).toBeNull();
  });
});

describe("login lockout", () => {
  it("locks after 5 failures for 15 minutes", () => {
    let t = 0;
    const l = createLoginLimiter(() => t);
    for (let i = 0; i < 4; i++) l.fail("a");
    expect(l.isLocked("a")).toBe(0);
    l.fail("a");
    expect(l.isLocked("a")).toBe(15 * 60 * 1000);
    t = 15 * 60 * 1000;
    expect(l.isLocked("a")).toBe(0);
  });
});
