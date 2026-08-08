# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Label Maker: a purely client-side app for building and printing allergen/diet
food labels as a PDF. There is no backend — all dish data lives in the
browser's `localStorage`. This is a Svelte 5 + Vite rebuild of an earlier
vanilla-JS/Vue version of the same app; it's a from-scratch reimplementation
(new UI, new state management), not a transpile.

## Commands

```bash
npm install
npm run dev       # start the Vite dev server
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

There is no lint or test script configured in this project.

## Architecture

### State: two singleton stores, imported directly (no prop drilling)

Components import these singletons wherever they need them instead of
receiving data/callbacks via props. This is the main structural pattern to
understand before touching any component.

- `src/lib/store.svelte.js` — the data store (`store`). Owns `dishes` and
  `cards` (`$state` arrays), `search`/`currentSort`/`currentSortDir`, and
  derived getters (`filteredDishes`, `sortedDishes`, `categories`). Every
  dish/card mutation (add/update/delete, sort, add-to-preview) goes through a
  method here. `persist()` writes `dishes` to `localStorage` under the key
  `"dishes"` — this key and the array-of-dish-objects shape are the on-disk
  format; keep them compatible if you touch serialization, since exported
  JSON files are meant to round-trip.
- `src/lib/ui.svelte.js` — transient UI state (`ui`): active tab, the
  add/edit/copy dish modal (`modalOpen`/`modalInitial`), and the generic
  confirm-dialog state (`confirm`). It imports `store` to look up dishes and
  perform the actual save/delete when the modal or confirm dialog resolves.

Components (`Header`, `DatabaseView`, `PreviewView`, `DishModal`,
`ConfirmDialog`) import `store`/`ui` directly rather than receiving them as
props; `App.svelte` itself is just a thin shell that switches between
`DatabaseView`/`PreviewView` based on `ui.activeTab`.

**Svelte 5 gotcha that will bite you here:** any object assigned to a
`$state` field becomes a deeply reactive Proxy — including nested arrays like
`dish.allergens`/`dish.diets`. Passing such a value to the native
`structuredClone()` throws (`DataCloneError`). Always unwrap with
`$state.snapshot(value)` first (see `ui.svelte.js`'s `openEditDish`/
`openCopyDish` and `DishModal.svelte`'s draft-cloning `$effect`) before
cloning or serializing state-proxied data.

### PDF generation — dimensions are load-bearing

`src/lib/pdf.js` (`generateLabelsPdf`, plus its `drawCard`/`drawStackedText`/
`wrapLineCount` helpers) reproduces the original app's `print()` method
using `jspdf` — refactored for readability but verified draw-call-for-
draw-call identical to the original line-for-line port (mocked-`doc`
equivalence check across representative cards; see git history on
`src/lib/pdf.js` for the verification scripts). The layout constants (7.5mm
margin, 65mm × 115mm cards, 3 columns × 2 rows per page, icon sizing,
line-wrap thresholds) are calibrated to a specific physical card stock that
gets printed at 100% scale. **Do not adjust this geometry** without
re-verifying against an actual printed sheet — small changes will misalign
physical labels. `jspdf` is on `4.2.1` (bumped from the originally-pinned
`2.5.2`); before bumping, `getLineHeight`/`getTextDimensions` output was
diffed directly between the two versions for the Helvetica font/sizes this
app uses and found byte-identical, and a real generated PDF was visually
compared old vs. new. Re-verify the same way (or against a printed sheet)
before bumping again.

The on-screen preview grid in `PreviewView.svelte` (`.hilton-card`, sized in
`pt` at 184×326) mirrors the PDF card's aspect ratio (65:115) intentionally —
keep both in sync if either changes.

### Icon data: `public/images.js`

`public/images.js` is an unmodified copy of the original project's icon
asset — a ~2.3MB file defining `var hImages = {...}` (base64 PNGs keyed by
lowercase diet/allergen name). It's loaded via a plain `<script src="/images.js">`
tag in `index.html` (not imported as an ES module), so it's referenced at
runtime as the global `window.hImages` — see its use in `PreviewView.svelte`
and `Header.svelte`'s print handler. Because it's a legacy global rather than
a module export, don't try to `import` it; read `window.hImages` instead.

### Other modules

- `src/lib/data.js` — static dictionaries (`diets`, `allergens` and their
  checkbox-option variants) and `blankDish()`/`defaultDishes` seed data.
- `src/lib/io.js` — JSON export (`saveDishesAsJSON`) and import
  (`loadDishesFromFile`, returns a Promise) of the dish database; import
  replaces `store.dishes` wholesale and re-persists.
- `src/lib/icons.js` + `src/lib/Icon.svelte` — a small hand-rolled inline-SVG
  icon set (no external icon font/CDN dependency); add new icons as raw SVG
  path strings keyed by name.
- `src/app.css` — the design system: CSS custom properties for color tokens,
  with a light palette on `:root` and dark overrides under
  `@media (prefers-color-scheme: dark)`. Shared primitives (`.btn`, `.badge`,
  `.card-surface`, form inputs) live here; component-specific styles live in
  each component's scoped `<style>` block.
