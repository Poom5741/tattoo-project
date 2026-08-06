/**
 * Plate component — determinism tests.
 *
 * Plate renders to a <canvas> via useEffect (canvas 2D API). The snapshot here
 * covers the rendered DOM structure (wrapper div, canvas, frame, cap). The
 * underlying mulberry32 PRNG is seed-deterministic, so the same seed always
 * produces the same canvas draw sequence — verified visually via baseline
 * capture rather than by inspecting canvas pixel data in jsdom.
 *
 * Prerequisites: vitest + happy-dom (configured in vitest.config.ts).
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import Plate from "@/components/Plate";

describe("Plate", () => {
  it("renders deterministic DOM structure for seed 11", () => {
    const { container } = render(React.createElement(Plate, { seed: 11 }));
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders deterministic DOM structure for seed 29", () => {
    const { container } = render(React.createElement(Plate, { seed: 29 }));
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders label and index in tile__cap when provided", () => {
    const { getByText } = render(
      React.createElement(Plate, { seed: 5, label: "Test Label", index: 42 })
    );
    expect(getByText("Test Label")).toBeTruthy();
    expect(getByText("42")).toBeTruthy();
  });

  it("omits tile__cap when label and index are absent", () => {
    const { container } = render(React.createElement(Plate, { seed: 3 }));
    expect(container.querySelector(".tile__cap")).toBeNull();
  });

  it("applies className to wrapper div", () => {
    const { container } = render(
      React.createElement(Plate, { seed: 7, className: "featured" })
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains("featured")).toBe(true);
  });
});
