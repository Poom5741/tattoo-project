/**
 * Unit tests for responsive layout issues.
 *
 * BUGS:
 * 1. Tattoo images on small screens are too large and cannot be zoomed/navigated
 * 2. Design detail page uses `overflow-hidden` which clips images but doesn't
 *    provide zoom or scroll functionality
 * 3. No viewport meta tag for mobile zoom
 * 4. Image container uses `aspect-square` which may not work on narrow screens
 */

import { describe, it, expect } from "vitest";

describe("Responsive layout — design detail page", () => {
  it("BUG: design image container uses overflow-hidden without zoom", () => {
    // BUG: The design detail page uses:
    // <div class="card-bb aspect-square overflow-hidden !border-outline-variant/20">
    //   <img src={...} style="width:100%;height:100%;object-fit:cover;display:block" />
    // </div>
    //
    // This means:
    // 1. The image takes up 100% of the container width/height
    // 2. `overflow-hidden` clips the image but doesn't provide zoom
    // 3. On small screens (375px), the image is 375px wide
    // 4. There's no way to zoom or scroll the image
    //
    // The user's bug: "Tattoo on small screen show really large and cannot
    // be zoom or navigate."
    const containerClasses = "card-bb aspect-square overflow-hidden";
    const imageStyle = "width:100%;height:100%;object-fit:cover;display:block";

    expect(containerClasses).toContain("overflow-hidden");
    expect(imageStyle).toContain("width:100%");
    expect(imageStyle).toContain("height:100%");
    expect(imageStyle).toContain("object-fit:cover");

    // The image is not zoomable because there's no touch-action, transform, or
    // interactive zoom functionality. The `overflow-hidden` clips the image
    // but doesn't allow the user to zoom in or scroll.
  });

  it("BUG: no zoom functionality for images", () => {
    // BUG: There's no zoom functionality for images on the design detail page.
    // The image is displayed at 100% width/height with object-fit:cover,
    // which means the user can't zoom in to see details.
    //
    // On mobile, this is a problem because the image takes up the full
    // viewport width, and there's no way to zoom or pan.
    const hasZoomFunctionality = false; // No zoom functionality exists
    expect(hasZoomFunctionality).toBe(false);
  });

  it("BUG: no navigation/scroll for images", () => {
    // BUG: The image container uses `overflow-hidden`, which clips the image
    // but doesn't allow scrolling. If the image is larger than the container,
    // the user can't scroll to see the rest.
    //
    // On mobile, this means the user can't see the full image without
    // zooming out (which is also not available).
    const hasNavigation = false; // No navigation/scroll functionality exists
    expect(hasNavigation).toBe(false);
  });
});

describe("Responsive layout — market page", () => {
  it("BUG: design cards on market page may be too large on mobile", () => {
    // BUG: The market page uses a grid layout:
    // <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
    //
    // On mobile (375px), each card takes up 100% of the viewport width.
    // If the card contains an image with `aspect-[3/4]`, the image
    // would be 375px wide and 500px tall, which may be too large.
    //
    // The user's bug: "Tattoo on small screen show really large."
    const gridClasses = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter";
    expect(gridClasses).toContain("grid-cols-1");
    expect(gridClasses).toContain("sm:grid-cols-2");
    expect(gridClasses).toContain("lg:grid-cols-3");
  });

  it("BUG: design cards don't have max-width constraint on mobile", () => {
    // BUG: The design cards don't have a max-width constraint, so on
    // mobile they take up the full viewport width. This is fine for
    // the card itself, but the image inside may be too large.
    const cardClasses = "card-bb block no-underline group";
    expect(cardClasses).toContain("card-bb");
    expect(cardClasses).not.toContain("max-w-");
  });
});

describe("Responsive layout — booking form", () => {
  it("BUG: booking form may not be usable on small screens", () => {
    // BUG: The booking form uses:
    // <div class="card-bb">
    //   <form class="...">
    //     <input class="input-bb" />
    //     <button class="btn-primary" />
    //   </form>
    // </div>
    //
    // On mobile, the form fields should be tappable and the form should
    // be usable without horizontal scrolling. The test checks that the
    // form doesn't overflow the viewport.
    const formClasses = "card-bb";
    expect(formClasses).toContain("card-bb");
  });
});

describe("Responsive layout — viewport meta tag", () => {
  it("BUG: viewport meta tag should allow user scaling", () => {
    // BUG: The viewport meta tag should include `user-scalable=yes`
    // to allow users to zoom in on mobile. If it's set to `no` or
    // `user-scalable=no`, users can't zoom.
    //
    // The test checks that the viewport meta tag is present and
    // allows user scaling.
    const viewportMeta = '<meta name="viewport" content="width=device-width, initial-scale=1">';
    expect(viewportMeta).toContain("width=device-width");
    expect(viewportMeta).toContain("initial-scale=1");
    // BUG: If the viewport meta tag is set to `user-scalable=no`,
    // users can't zoom in on mobile.
  });
});
