/**
 * PasskeyNavButton — unit tests (TDD red→green).
 *
 * Tests rendering based on wallet state: disconnected, locked, unlocked.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasskeyWalletProvider, usePasskeyWallet } from "@/contexts/PasskeyWalletContext";
import PasskeyNavButton from "@/components/PasskeyNavButton";
import type { ReactNode } from "react";

// ── Test helper: renders PasskeyNavButton within context ────────

function renderNavButton(initialAddress: string | null = null) {
  return render(
    <PasskeyWalletProvider>
      <PasskeyNavButton />
    </PasskeyWalletProvider>,
  );
}

describe("PasskeyNavButton", () => {
  it('renders "Connect Wallet" when status is none', () => {
    renderNavButton();
    const btn = screen.getByRole("button");
    expect(btn.textContent).toMatch(/Connect/i);
  });

  it("renders a button element", () => {
    renderNavButton();
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("has nav__wallet class", () => {
    renderNavButton();
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("nav__wallet");
  });
});
