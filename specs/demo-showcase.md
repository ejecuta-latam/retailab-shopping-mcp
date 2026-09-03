# Spec: Demo Showcase — Shared Cart Across Stores

> Route and page chrome: [[demo-page]]. This spec still owns storefronts, catalog, cart, and tools.

## 1. Problem & Goals

- **Problem:** Visitors cannot see how shopping-mcp lets an agent shop the same way on every store, or that a cart can survive moving from one storefront to another.
- **Why now:** The banner already promises a demo and the product story is “one tool profile, every store.” `/demo` is that live exhibit.
- **Goals (measurable):**
  1. A dedicated live demo exists at `/demo`. Nav and footer “Demo” go there. Homepage shows a compact teaser (`#demo`); banner “View demo” scrolls to it.
  2. At least three fictional storefronts are shown. Each is visually recognizable as a homage to a well-known retailer without using that retailer’s name, logo, or trademarks.
  3. A shopper can add items from store A, switch to store B, and still see those items in one shared cart, then add more from store B.
  4. Native WebMCP tools only “see” the current store’s catalog (page context) but read/write the same shared cart.
  5. Human clicks and native agent tool calls use the same cart mutations.

## 2. Non-Goals

- Real checkout, payments, accounts, or order tracking.
- A live LLM backend or API keys.
- Separate routed storefronts (`/nilemart`, etc.). Store tabs stay on `/demo`.
- Pixel-perfect clones or use of Amazon, Walmart, Target, eBay, Etsy names or logos.
- A production WebMCP polyfill dependency. Native `modelContext` is registered when the browser exposes it; the storefront + shared cart is the guaranteed demo.
- An in-page simulated agent panel, prompt chips, or tool-call log. Real agents use registered WebMCP tools.
- Replacing the existing banner/nav visual design.

## 3. Users & Stories

- As a **visitor**, I want to open `/demo` into a working multi-store demo so I understand shopping-mcp in under a minute.
- As a **visitor**, I want to click between fictional storefronts so I can see that each page looks like a different shop.
- As a **visitor**, I want to add an item on one store, switch stores, and still see it in the cart so I believe the cart is shared.
- As a **real WebMCP agent** (ChatGPT in-app browser / Chrome with WebMCP), I want the same shopping-mcp tools registered on the page so I can list products, **switch storefronts**, and mutate the shared cart when the browser supports it.

## 4. Scope

- **In:**
  - `/demo` page (full-page `DemoShowcase`) and a compact teaser on `/`.
  - Three storefronts: NileMart (Amazon-like), WideMart (Walmart-like), DartHouse (Target-like).
  - Shared cart panel (add, increment, decrement/remove, subtotal).
  - Catalog data (static) and shopping-mcp tool functions.
  - Optional native WebMCP registration when `navigator.modelContext` or `document.modelContext` exists.
  - sessionStorage persistence for the cart during the tab session.
- **Out:** Checkout, auth, real payments, i18n beyond `en`, additional stores, per-store routes, LLM calls.

## 5. Functional Requirements

### 5.1 Placement

1. The full storefront mounts on `/demo`. A compact teaser mounts on `/` between Banner and ExplainBanner (`id="demo"`).
2. `#demo` has `scroll-margin-top` so the sticky nav does not cover the section title.
3. Banner “View demo” points at `#demo`. Nav “Demo” and Footer “Demo” point at `/demo`.

### 5.2 Store switching

4. Default store on first load: NileMart.
5. Switching stores changes: fake browser URL, store chrome, and product grid.
6. Switching stores does **not** clear or rewrite the cart.
7. Store tabs are a keyboard-accessible `tablist`.
8. `switch_store` and clicking a tab use the same `setStoreId` mutation. Cart is unchanged.

### 5.3 Catalog

8. Each store has its own product list (6 SKUs each). SKUs are unique across stores.
9. `list_products` / `search_products` only return products for the **current** store.
10. `add_to_cart` fails if the SKU is not in the current store’s catalog. The caller must `switch_store` to that catalog first (same function as clicking a store tab).
10a. Each product has a local photograph at `/demo/products/{skuId}.webp` (files in `public/demo/products/`). Product cards render that image, not a color-block with initials. Cart lines stay text-only (no thumbnails).

### 5.4 Shared cart

11. Cart lines store `skuId`, `storeId`, name, unit price, quantity, and enough display data to show a store pill.
12. Adding an existing SKU increments quantity.
13. Visitor can increase quantity, decrease (quantity 1 → remove), or remove a line.
14. Subtotal = sum of `priceCents * quantity`.
15. Cart count in store chrome matches total quantity across all stores.
16. Cart is saved to `sessionStorage` key `shopping-mcp.demo.cart` after each mutation and restored on load. Invalid JSON is treated as empty.

### 5.5 Human add-to-cart

17. Each product card has an “Add to cart” (or store-specific equivalent) button that calls the same `add_to_cart` function as native WebMCP tools.

### 5.6 Native WebMCP (best-effort)

18. On mount, if a model-context API exists, register: `list_stores`, `switch_store`, `list_products`, `search_products`, `add_to_cart`, `get_cart`, `remove_from_cart`.
19. If it does not exist, the storefront + shared cart still works. No error UI.
20. There is no in-page agent panel, prompt field, chips, or tool-call log.

## 6. Interfaces & Data

### 6.1 UI

- Section heading: “Demo” with supporting line: agents read the current store page via WebMCP tools, fill one shared cart, and the cart survives store switches.
- Chrome: fake browser with tabs + address bar (`https://nilemart.shop`, `https://widemart.shop`, `https://darthouse.shop`).
- Right column (desktop): Shared cart only. Stacked on small screens: store → cart.

### 6.2 Data model

```ts
type StoreId = "nilemart" | "widemart" | "darthouse";

interface Product {
  skuId: string;
  storeId: StoreId;
  name: string;
  description: string;
  priceCents: number;
  rating: number;       // 1–5, one decimal
  reviewCount: number;
  tags: string[];
  badge: string | null;
  category: string;
  imageSrc: string;     // /demo/products/{skuId}.webp
}

interface CartLine {
  skuId: string;
  storeId: StoreId;
  name: string;
  priceCents: number;
  quantity: number;
}

interface ToolResult {
  ok: boolean;
  message: string;
  data?: unknown;
}
```

### 6.3 Tool contracts (shopping-mcp profile)

**`list_stores`**
- Input: `{}`
- Output: `{ currentStoreId, stores: [{ storeId, name, hostname, current }] }`
- Read-only.

**`switch_store`**
- Input: `{ storeId: "nilemart" | "widemart" | "darthouse" }` (also accept the display name, e.g. `"WideMart"`)
- Success: `{ ok: true, message, data: { storeId, hostname } }` — selected tab, URL chrome, and catalog update. Cart unchanged.
- Error: `{ ok: false, message: "Unknown store…" }` if the id/name is not one of the three.
- Already on that store: `{ ok: true, message: "Already on …" }` — no visual flicker required.

**`list_products`**
- Input: `{}`
- Output: `{ storeId, products: Product[] }` for the current store.

**`search_products`**
- Input: `{ query: string }`
- Output: `{ storeId, query, products: Product[] }` matching name, description, or tags on the current store (case-insensitive). Optional `under $N` in the query filters `priceCents < N * 100`.

**`add_to_cart`**
- Input: `{ skuId: string, quantity?: number }` (`quantity` default 1, min 1)
- Success: `{ ok: true, message, cart: CartLine[] }`
- Error: `{ ok: false, message }` if `skuId` is missing or belongs to another store. Message tells the caller to `switch_store` first.

**`get_cart`**
- Input: `{}`
- Output: `{ items: CartLine[], totalCents: number, itemCount: number }`

**`remove_from_cart`**
- Input: `{ skuId: string }`
- Success if the line exists; otherwise `{ ok: false, message: "Item not in cart" }`.

### 6.4 Example

Native agent on NileMart, then `add_to_cart` for headphones:

```
search_products({ "query": "wireless headphones" })
→ [{ skuId: "nm-nilebuds", name: "NileBuds Wireless Pro", ... }]

add_to_cart({ "skuId": "nm-nilebuds", "quantity": 1 })
→ cart [{ skuId: "nm-nilebuds", storeId: "nilemart", quantity: 1, ... }]
```

Native agent on NileMart, milk lives on WideMart:

```
search_products({ "query": "milk" })
→ []

switch_store({ "storeId": "widemart" })
→ UI shows WideMart; cart still has any NileMart lines

search_products({ "query": "milk" })
→ [{ skuId: "wm-milk", ... }]

add_to_cart({ "skuId": "wm-milk" })
→ cart has items from both stores
```

### 6.5 Storefront fiction (visual aspects only)

| Fiction     | Homage  | Recognizable aspects (no TM names) |
|------------|---------|--------------------------------------|
| NileMart   | Amazon  | River-named marketplace; navy header; oversized search; yellow-gold search/CTA; dark subnav; membership badge “Nile+”; link-blue titles; gold stars; yellow add button |
| WideMart   | Walmart | Bright blue header; yellow spark mark; “Rollback” price pills; fulfillment bar; rounded blue add button; value grocery mix |
| DartHouse  | Target  | White/red header; concentric-ring mark; sparse clean cards; red CTA; home/style assortment; “Bullseye Club” |

## 7. Edge Cases & Errors

- Empty cart: show “Cart is empty. Add from this page.”
- `switch_store` with unknown id: refuse; stay on current page.
- `add_to_cart` for a foreign SKU: refuse; do not add; do not auto-switch. The caller must `switch_store` first.
- Quantity below 1: remove the line.
- `sessionStorage` unavailable or quota error: keep in-memory cart; do not crash.
- Duplicate rapid adds: increment quantity, no duplicate lines.
- Keyboard: tabs are arrows/home/end capable enough via native `role="tab"` + click/Enter/Space.

## 8. Non-Functional

- **Perf:** Static catalog in JS; product photos are bundled local files (no remote URLs); first demo paint is local CSS/HTML/images.
- **Security:** No user-supplied HTML rendered unescaped; prompts are text. No secrets.
- **Reliability:** Demo is fully client-side; works offline after load.
- **A11y:** Section landmark, tablist, cart `aria-live="polite"` on add, focus-visible already global.
- **i18n:** English only (`N/A` for other locales).
- **Responsive:** Usable at 375px (stacked) and 1280px (two columns). Store chrome may horizontally clip rather than break.

## 9. Dependencies & Assumptions

- Astro + React already on the landing branch (`feature/shopping-mcp-landing`).
- `motion` may be used for light enter animations, consistent with Banner/Nav.
- No new runtime dependencies required.
- Assumed: visitors understand this is a fiction demo, not real stores.
- Assumed: “agent” on the landing page means a native WebMCP client when the browser exposes `modelContext`. Visitors shop with Add to cart.

## 10. Acceptance Criteria

- [ ] Given the homepage, when the visitor clicks “View demo”, then they land on `/demo`.
- [ ] Given the demo, when the visitor views NileMart, then they see navy search-first chrome and NileMart products — never the word Amazon.
- [ ] Given the demo, when the visitor views WideMart, then they see blue/yellow value-store chrome and WideMart products — never the word Walmart.
- [ ] Given the demo, when the visitor views DartHouse, then they see red/white clean chrome and DartHouse products — never the word Target.
- [ ] Given an item added on NileMart, when the visitor switches to WideMart, then that item remains in the shared cart with a NileMart source pill.
- [ ] Given that cart, when the visitor adds a WideMart item via Add to cart, then the cart shows both lines and an updated subtotal.
- [ ] Given NileMart selected, when the visitor clicks the DartHouse tab, then the DartHouse tab is selected, the URL chrome shows darthouse.shop, and the cart is unchanged.
- [ ] Given `switch_store` with storeId `nilemart` while already on NileMart, when called, then the result is ok and the page stays on NileMart.
- [ ] Given the demo, when the visitor views the showcase, then there is no in-page agent panel, prompt field, or tool-call log.
- [ ] Given a cart with items, when the tab is reloaded, then the cart is restored from sessionStorage.
- [ ] Given a product card, when “Add to cart” is clicked twice, then quantity becomes 2 on one line.
- [x] Given any store catalog, when a product card is shown, then it displays the local photo for that SKU (`/demo/products/{skuId}.webp`) rather than initials on a gradient.

## 11. Test Strategy

- No unit-test runner in this repo yet; do not add one for this slice.
- Typecheck: `npx tsc --noEmit` (Astro strict tsconfig).
- Manual / Playwright against `http://localhost:4321/demo`:
  1. Open `/demo`.
  2. Add from NileMart, switch store, confirm cart.
  3. Quantity increment and remove.
  4. Desktop and ~375px viewport.

## 12. Rollout

- Ships as part of the existing landing feature branch. No flags.
- Live exhibit lives at `/demo`; homepage links out.
- Migration: none.

## 13. Open Questions

- None. Resolved: three homage stores; no in-page agent UI; in-page tabs not routes; sessionStorage only; native WebMCP best-effort without a new package.
