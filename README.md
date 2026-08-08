# Label Maker (Svelte)

A Svelte + Vite rebuild of the original vanilla/Vue Label Maker. It's a
purely client-side app for building and printing allergen/diet food
labels — there is no backend; all dish data lives in the browser's
`localStorage`.

This is a from-scratch reimplementation with a modernized UI. The diet/
allergen icon set was carried over from the original project's base64
icon blob, extracted byte-for-byte into individual PNG files under
[`public/icons/`](public/icons/) and loaded on demand via
`src/lib/foodIcons.js` instead of a blocking `<script>` tag.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
```

## Notable pieces

- `src/lib/store.svelte.js` — reactive dish/card state (Svelte 5
  runes) with `localStorage` persistence under the `dishes` key (same
  key/shape as the original app, so exported JSON is interchangeable).
- `src/lib/pdf.js` — the PDF label layout, behavior-verified equivalent
  to the original `print()` method. The card geometry (65mm × 115mm,
  3-per-row) is exact — don't change these numbers without re-checking
  a printed sheet.
- `src/lib/ui.svelte.js` — modal/confirm-dialog UI state.
- `src/lib/io.js` — JSON export/import (save/load dish database).

## Printing

Always print the generated PDF at 100% scale — the card dimensions are
calibrated to a specific physical card stock.
