# Spec: Video Walkthrough — Agent Tour of shopping-mcp

## 1. Problem & Goals

- **Problem:** The Devpost video must show how a person and an agent shop the live demo in under 3 minutes. Clicking around live is easy to fumble on camera; a scripted HTML tour can be screen-recorded cleanly.
- **Why now:** Submission needs a public walkthrough with audio. The live `/demo` stays the real exhibit; this page is a recording aid that also works as a silent autoplay story.
- **Goals (measurable):**
  1. A dedicated route `/walkthrough` autoplays a complete tour of home → demo (three stores + shared cart) → docs → end card.
  2. The tour shows an agent calling the real tool names (`list_products`, `search_products`, `add_to_cart`, `switch_store`, `get_cart`, `open_ui`) while the storefront UI updates.
  3. The agent adds at least one SKU from each of NileMart, WideMart, and DartHouse; the cart keeps prior lines after each `switch_store`.
  4. A Replay control restarts from the title. Recording chrome can be hidden.
  5. Runtime is about 80–110 seconds so it fits a <3 minute video with voiceover.

## 2. Non-Goals

- Replacing `/demo` or adding an agent panel to the live showcase (forbidden by `specs/demo-showcase.md`).
- A real LLM, WebMCP session, or microphone.
- Screen-recording software, YouTube upload, or voiceover audio in the page.
- Checkout, auth, or real payments.
- Linking the tour from primary nav (judges should land on `/demo`).
- Pixel-perfect clones of ChatGPT or Chrome UI.

## 3. Users & Stories

- As a **submitter**, I want a fullscreen autoplay story so I can record a Devpost video without driving the demo live.
- As a **viewer**, I want to see an agent list, search, add, switch stores, and read one shared cart so I understand shopping-mcp in one sitting.
- As a **keyboard user**, I want Replay (and R) to restart the tour.

## 4. Scope

- **In:**
  - `/walkthrough` Astro page + React tour + CSS.
  - Scripted scenes covering `/`, `/demo` (NileMart → WideMart → DartHouse), `/docs`, end card with live URL.
  - Simulated agent transcript + tool-call cards.
  - Fake site chrome (nav, banner snippet, demo browser, storefronts via existing `StorePage`).
  - Optional `highlightSkuId` on `StorePage` for pulse/dim (walkthrough-only usage).
  - Replay and a “Hide chrome” / `?record=1` mode for capture.
- **Out:** Changes to registered WebMCP tools, cart persistence on `/demo`, footer/nav links, video file in the repo.

## 5. Functional Requirements

### 5.1 Route and chrome

1. `/walkthrough` is a full-viewport recording stage. No site footer. No primary `Nav` (the tour paints its own mini site chrome).
2. The stage fills the browser window (`100vw × 100vh`). It is not a letterboxed 16:9 card in the middle of the screen.
3. Layout: **site column 66%** (`2fr`) + **agent column 33%** (`1fr`) on shopping, home, and docs. Title and end cards overlay the full frame.
4. Query `?record=1` starts with recording chrome hidden.
5. Recording chrome includes Replay and Hide chrome. Press `r` to replay when not typing in an input (there are no inputs).

### 5.2 Autoplay

6. The tour starts automatically ~0.8s after mount. Scene changes (title → home → demo → docs → end) overlap as crossfades (~620ms). Store switches slide the storefronts over each other (~520ms) instead of hard-cutting. Reduced-motion users skip the motion.
7. Replay aborts the current run, resets cart/page/agent, and plays from the title.
8. Unmount aborts timers.

### 5.3 Scene script (order is mandatory)

| # | Page shown | Agent / tools | UI must show |
|---|------------|---------------|--------------|
| 0 | Title card | Silent | Logo, `shopping-mcp`, tagline “Same tools. Every store. One cart.” |
| 1 | Home | Agent: this page registered shopping tools; we shop together | Mini landing: retailab nav, banner, “View demo” |
| 2 | Demo | Agent names the tools | Fake URL `shopping.ejecuta.lat/demo`, NileMart storefront, **real shared-cart island** (`startOpen`) |
| 3 | Demo / NileMart | `list_products` then `search_products` `{ "query": "wireless" }` | NileMart catalog; NileBuds highlighted; pointer on Add |
| 4 | Demo / NileMart | `add_to_cart` `{ "skuId": "nm-nilebuds" }` | Click Add; cart badge 1; island shows NileBuds |
| 5 | Demo / WideMart | pointer on WideMart tab, then `switch_store` `{ "storeId": "widemart" }`, search milk, add | Tab highlight; WideMart chrome; island keeps NileMart line; milk added |
| 6 | Demo / DartHouse | pointer on DartHouse tab, then `switch_store` + add candle | Tab highlight; island has three stores |
| 7 | Demo | `get_cart` then `open_ui` | Pointer on the floating island; three lines + subtotal |
| 8 | Docs | Agent: stores install the same profile | URL `/docs`, `npm install shopping-mcp`, `registerShoppingMcp` snippet |
| 9 | End card | Silent | Live URL `https://shopping.ejecuta.lat/demo` and repo name |

9. Captions (lower third on the site column) explain each beat in one short sentence for the recording.

### 5.4 Pointer

10. A visible pointer (fixed-position cursor graphic) moves to “View demo”, store tabs on `switch_store`, the highlighted product’s **Add** button, the store cart chip after an add, and the floating cart island on `open_ui`.
11. Pointer is hidden on title, docs, and end. Clicks show a brief press animation at the control hotspot. The matched product, store tab, and cart chip pulse so the viewer can follow the action.

### 5.5 Fictional stores

12. Same names and SKUs as the live demo. Never Amazon, Walmart, or Target.

## 6. Interfaces & Data

### 6.1 UI

- Studio background: near-ink `#0b1a1c`.
- Site column uses existing demo/landing tokens (`--accent` `#0d8f5b`, `--paper`, IBM Plex / JetBrains Mono).
- Agent column: “Agent” header, WebMCP chip, scrolling transcript, tool card with name, JSON args, JSON result.
- Cart island: the real `shopping-mcp` shadow-DOM island mounted on `.demo-browser` (`startOpen: true`), with store pills and subtotal. It stays open while shopping, sits in the **top-right of the fake browser** (clear of the caption), and updates after each add.

### 6.2 Data

Reuse `StoreId`, `CartLine`, `getStore`, `productsForStore`, `getProduct`, `addLine`, `cartTotalCents`, `cartItemCount`, `formatUsd`.

Scripted SKUs:

```ts
const TOUR_SKUS = ["nm-nilebuds", "wm-milk", "dh-candle"] as const;
```

Example tool card:

```
search_products
{ "query": "wireless" }

{
  "storeId": "nilemart",
  "products": [{ "skuId": "nm-nilebuds", "name": "NileBuds Wireless Pro" }]
}
```

## 7. Edge Cases & Errors

- Replay mid-tour: no overlapping timers; cart resets to empty.
- Missing product (should not happen): skip add, keep playing.
- `prefers-reduced-motion`: still autoplay with shorter delays; no pointer travel (teleport); no scale pulses.
- Narrow viewports: stack agent under site (recording is desktop-first).
- `?record=1` after Replay: chrome stays hidden unless the user shows it again.

## 8. Non-Functional

- **Perf:** Client-only; no network except fonts/images already on the site. First play starts without waiting for WebMCP.
- **Security:** No `eval`, no user HTML. Scripted strings only.
- **Reliability:** Fully client-side; works after `astro build`.
- **A11y:** Replay is a real button. Stage has `aria-live="polite"` on the caption. Reduced motion honored. Not a replacement for `/demo` a11y.
- **i18n:** English only (`N/A`).
- **Responsive:** Desktop-first full viewport, 66/33 split ≥ 960px. Stacked below that.

## 9. Dependencies & Assumptions

- Existing Astro + React + `motion` + `StorePage` + catalog.
- No new npm packages.
- Assumed: submitter records the browser tab (or the 16:9 stage) and adds voiceover later.
- Assumed: `/walkthrough` may be deployed with the site; judges still use `/demo`.

## 10. Acceptance Criteria

- [ ] Given `/walkthrough`, when the page loads, then the tour autoplays without clicking Play.
- [ ] Given the tour, when it reaches the demo, then NileMart is the first storefront.
- [ ] Given NileBuds added, when the tour switches to WideMart, then the cart count is still 1 until milk is added.
- [ ] Given milk added, when the tour switches to DartHouse, then the cart count is 2 until the candle is added, then 3.
- [ ] Given the demo beat, when NileBuds is added, then the floating shared-cart island is visible on the storefront and lists NileBuds.
- [ ] Given that cart, when the tour switches to WideMart, then the island still shows the NileMart line.
- [ ] Given `open_ui`, when it runs, then the island lists NileBuds, FairChoice milk, and Orchard Soy Candle with a subtotal.
- [ ] Given the docs beat, when it plays, then `npm install shopping-mcp` fills the site column (not a small block in the middle) and then the end card animates in over the full frame.
- [ ] Given a shopping beat, when the layout is measured, then the site column is ~66% of the stage width and the agent column ~33%.
- [ ] Given an add-to-cart beat, when the pointer is visible, then its tip sits on that product’s Add button.
- [ ] Given Replay, when activated, then the title card plays again and the cart is empty at the NileMart add beat.
- [ ] Given `?record=1`, when the page loads, then Replay/Hide chrome are not visible.
- [ ] Given `/demo`, when a visitor opens it, then there is still no in-page agent panel (walkthrough only).

## 11. Test Strategy

- Typecheck: `npx tsc --noEmit`.
- Manual / Playwright against `http://localhost:4321/walkthrough`:
  1. Load; confirm autoplay title → home → demo.
  2. Watch cart badge 0 → 1 → 2 → 3 across stores.
  3. Confirm island has three lines.
  4. Replay once.
  5. Load `?record=1` and confirm chrome hidden.
- Reduced-motion: OS setting on; tour still completes.

## 12. Rollout

- Ships as a new route. No feature flag.
- Not added to primary nav.
- Migration: none.

## 13. Open Questions

- None. Recording page is separate from `/demo`. SKUs are NileBuds, WideMart milk, DartHouse candle. Chrome hidden via `?record=1`.
