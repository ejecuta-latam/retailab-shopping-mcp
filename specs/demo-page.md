# Spec: `/demo` agent showcase page

## 1. Problem & Goals

- **Problem:** The live storefront sits in a homepage section (`#demo`). Agents and judges need a dedicated URL they can open, with tools registered on that document, and more room to shop.
- **Why now:** The library, `open_ui` island, and store tools are ready. The next story is “open `/demo` and the agent can work.”
- **Goals:**
  1. Route `/demo` exists and is the live multi-store showcase.
  2. On load, the page registers the full shopping-mcp profile plus demo extras: `list_products`, `search_products`, `add_to_cart`, `get_cart`, `remove_from_cart`, `open_ui`, `list_stores`, `switch_store`.
  3. The storefront is larger than the homepage section (wider stage, taller page chrome).
  4. Nav, footer, and docs “live demo” go to `/demo`. Hero “View demo” scrolls to the homepage teaser (`#demo`).
  5. Homepage mounts a **compact** `DemoShowcase` teaser so visitors see the utility without leaving `/`. `/demo` is the full agent page.

## 2. Non-Goals

- Separate URLs per store (`/nilemart`). Tabs stay in-page.
- Changing tool contracts or catalog data.
- LLM in the page.
- Chrome extension.

## 3. Users & Stories

- As a **WebMCP agent**, I want to open `https://…/demo` and see shopping-mcp tools on that page.
- As a **visitor**, I want a full-page demo so I can click stores, add items, and see the cart island.
- As a **judge**, I want one obvious Demo link in the nav.

## 4. Scope

- **In:** `src/pages/demo/index.astro`; `DemoShowcase` `fullPage` on `/demo`; compact teaser on `/` (`fullPage` omitted); nav/footer/docs → `/demo`; banner → `#demo`.
- **Out:** New stores, new tools beyond those already registered.

## 5. Functional Requirements

1. `GET /demo` returns 200 with title `Demo — shopping-mcp`.
2. The page uses `BaseLayout` (nav, footer, favicon) plus `demo.css`.
3. `DemoShowcase` mounts with `client:load` and `fullPage`.
4. `registerShoppingMcp` runs on `/demo` (island `startOpen: true`) and on the homepage teaser (island `startOpen: false` so the tiny grid stays visible).
5. Cart island `root` remains `.demo-browser`.
6. Full-page layout: kicker + `h1` “Same tools. Every store. One cart.” Support line names `open_ui` and `switch_store`. Stage width up to ~90rem. Store panel `min-height` ~36rem and `max-height: calc(100vh - 14rem)`.
7. Nav Demo → `/demo`. Footer Demo → `/demo`. Docs live demo → `/demo`. Banner “View demo” → `#demo`.
8. Homepage teaser (`variant` compact / not `fullPage`):
   - Sits between Banner and ExplainBanner, `id="demo"`.
   - `h2` same title; shorter support; link “Open the full demo” → `/demo`.
   - Fake browser max-height ~22.5rem.
   - Three products per store (first three SKUs), denser cards (no description/rating/tagline).
   - Same store tabs, add-to-cart, and shared sessionStorage cart as `/demo`.

## 6. Interfaces

- UI: same `DemoShowcase` + `StorePage` + library island.
- Tools: unchanged list from `packages/shopping-mcp` + demo `list_stores` / `switch_store`.

## 7. Edge Cases

- WebMCP missing: page and island still work.
- sessionStorage cart: same key `shopping-mcp.demo.cart` (shared if the visitor used an older homepage demo in this tab).
- Sticky nav: page padding accounts for it; island stays inside `.demo-browser`.

## 8. Non-Functional

- Same client-only constraints as the existing demo.
- A11y: page `h1`, store tablist unchanged.

## 9. Dependencies

- Existing `DemoShowcase`, `shopping-mcp` package, `BaseLayout`.

## 10. Acceptance Criteria

- [ ] Given `/demo`, when loaded, then NileMart is visible in a tall fake browser and the Shared cart island is present.
- [ ] Given `/`, when loaded, then a compact storefront teaser is below the banner with three NileMart products and a link to `/demo`.
- [ ] Given `/`, when the visitor clicks “View demo”, then the page scrolls to `#demo`.
- [ ] Given Nav “Demo”, when clicked, then the URL is `/demo`.
- [ ] Given `/demo`, when Add to cart then WideMart tab, then the island still shows the NileMart line.
- [ ] Given `/docs`, when the live demo link is used, then it points at `/demo`.

## 11. Test Strategy

- Manual / Playwright: `/demo` 200, homepage CTA, add + switch store.
- Confirm `src/pages/index.astro` mounts compact `DemoShowcase` and `/demo` mounts `fullPage`.

## 12. Rollout

- Same repo. No flags.

## 13. Open Questions

- None. Resolved: `/demo` is the full agent page; `/` has a compact live teaser that visualizes the same stores and cart.
