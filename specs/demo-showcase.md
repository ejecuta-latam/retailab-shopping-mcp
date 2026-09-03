# Spec: Homepage Demo Showcase — Shared Cart Across Stores

## 1. Problem & Goals

- **Problem:** The landing page currently ends at the hero banner. Visitors cannot see how shopping-mcp lets an agent shop the same way on every store, or that a cart can survive moving from one storefront to another.
- **Why now:** The banner already promises a demo (`#demo`) and the product story is “one tool profile, every store.” The homepage needs that story as a live exhibit.
- **Goals (measurable):**
  1. A demo section exists on the homepage, immediately below the main banner, with `id="demo"` so “View demo” scrolls to it.
  2. At least three fictional storefronts are shown. Each is visually recognizable as a homage to a well-known retailer without using that retailer’s name, logo, or trademarks.
  3. A shopper or in-page agent can add items from store A, switch to store B, and still see those items in one shared cart, then add more from store B.
  4. The in-page agent only “sees” the current store’s catalog (page context) but reads/writes the same shared cart.
  5. Human clicks and agent tool calls use the same cart mutations.

## 2. Non-Goals

- Real checkout, payments, accounts, or order tracking.
- A live LLM backend or API keys.
- Separate routed storefronts (`/nilemart`, etc.). The demo stays on `/`.
- Pixel-perfect clones or use of Amazon, Walmart, Target, eBay, Etsy names or logos.
- A production WebMCP polyfill dependency. Native `modelContext` is registered when the browser exposes it; the in-page agent is the guaranteed demo.
- Replacing the existing banner/nav visual design.

## 3. Users & Stories

- As a **visitor**, I want to scroll past the banner into a working multi-store demo so I understand shopping-mcp in under a minute.
- As a **visitor**, I want to click between fictional storefronts so I can see that each page looks like a different shop.
- As a **visitor**, I want to add an item on one store, switch stores, and still see it in the cart so I believe the cart is shared.
- As a **visitor**, I want to type or tap a prompt in the agent panel so I can watch tools read the current page and add to the shared cart.
- As a **real WebMCP agent** (ChatGPT in-app browser / Chrome with WebMCP), I want the same shopping-mcp tools registered on the page so I can list products and mutate the shared cart when the browser supports it.

## 4. Scope

- **In:**
  - Homepage section below the banner (`id="demo"`).
  - Three storefronts: NileMart (Amazon-like), WideMart (Walmart-like), DartHouse (Target-like).
  - Shared cart panel (add, increment, decrement/remove, subtotal).
  - In-page agent panel with suggested prompts and a tool-call log.
  - Catalog data (static) and shopping-mcp tool functions.
  - Optional native WebMCP registration when `navigator.modelContext` or `document.modelContext` exists.
  - sessionStorage persistence for the cart during the tab session.
- **Out:** Checkout, auth, real payments, i18n beyond `en`, additional stores, routed pages, LLM calls.

## 5. Functional Requirements

### 5.1 Placement

1. The demo is a sibling of the banner inside `<main>`, not inside the banner.
2. `#demo` has `scroll-margin-top` so the sticky nav does not cover the section title.
3. Banner “View demo” continues to point at `#demo`.

### 5.2 Store switching

4. Default store on first load: NileMart.
5. Switching stores changes: fake browser URL, store chrome, product grid, agent “reading” context, and suggested prompts.
6. Switching stores does **not** clear or rewrite the cart.
7. Store tabs are a keyboard-accessible `tablist`.

### 5.3 Catalog

8. Each store has its own product list (6 SKUs each). SKUs are unique across stores.
9. The agent and `list_products` / `search_products` only return products for the **current** store.
10. `add_to_cart` fails if the SKU is not in the current store’s catalog (agent must switch pages to shop another catalog).

### 5.4 Shared cart

11. Cart lines store `skuId`, `storeId`, name, unit price, quantity, and enough display data to show a store pill.
12. Adding an existing SKU increments quantity.
13. Visitor can increase quantity, decrease (quantity 1 → remove), or remove a line.
14. Subtotal = sum of `priceCents * quantity`.
15. Cart count in store chrome matches total quantity across all stores.
16. Cart is saved to `sessionStorage` key `shopping-mcp.demo.cart` after each mutation and restored on load. Invalid JSON is treated as empty.

### 5.5 Human add-to-cart

17. Each product card has an “Add to cart” (or store-specific equivalent) button that calls the same `add_to_cart` function as the agent.

### 5.6 In-page agent

18. The panel states it is using the shopping-mcp tools for the **current page**.
19. Suggested prompts are store-aware (items that exist on that store).
20. On submit:
    1. Log `search_products` or `list_products` with the parsed query.
    2. If matches exist and the prompt is an add/get/buy intent (or a single clear match with “add”), log `add_to_cart` and mutate the cart.
    3. If no matches, do not mutate the cart; tell the visitor the item is not on this page and name a store that carries a matching tag when possible.
21. Tool calls are shown in a monospace log (name + JSON args + short result).
22. No network calls.

### 5.7 Native WebMCP (best-effort)

23. On mount, if a model-context API exists, register: `list_products`, `search_products`, `add_to_cart`, `get_cart`, `remove_from_cart`.
24. If it does not exist, the in-page demo still works. No error UI.

## 6. Interfaces & Data

### 6.1 UI

- Section heading: “Demo” with supporting line: agents read the current store page, fill one shared cart, and the cart survives store switches.
- Chrome: fake browser with tabs + address bar (`https://nilemart.shop`, `https://widemart.shop`, `https://darthouse.shop`).
- Right column (desktop): Shared cart, then agent. Stacked on small screens: store → cart → agent.

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

**`list_products`**
- Input: `{}`
- Output: `{ storeId, products: Product[] }` for the current store.

**`search_products`**
- Input: `{ query: string }`
- Output: `{ storeId, query, products: Product[] }` matching name, description, or tags on the current store (case-insensitive). Optional `under $N` in the in-page agent prompt filters `priceCents < N * 100`.

**`add_to_cart`**
- Input: `{ skuId: string, quantity?: number }` (`quantity` default 1, min 1)
- Success: `{ ok: true, message, cart: CartLine[] }`
- Error: `{ ok: false, message: "SKU not on this page" }` if `skuId` is missing or belongs to another store.

**`get_cart`**
- Input: `{}`
- Output: `{ items: CartLine[], totalCents: number, itemCount: number }`

**`remove_from_cart`**
- Input: `{ skuId: string }`
- Success if the line exists; otherwise `{ ok: false, message: "Item not in cart" }`.

### 6.4 Example

Visitor on NileMart, agent prompt `Add wireless headphones`:

```
search_products({ "query": "wireless headphones" })
→ [{ skuId: "nm-nilebuds", name: "NileBuds Wireless Pro", ... }]

add_to_cart({ "skuId": "nm-nilebuds", "quantity": 1 })
→ cart [{ skuId: "nm-nilebuds", storeId: "nilemart", quantity: 1, ... }]
```

Visitor switches to WideMart. Cart still shows NileBuds. Prompt `Add milk`:

```
search_products({ "query": "milk" })
→ [{ skuId: "wm-milk", name: "FairChoice 2% Milk", ... }]
add_to_cart({ "skuId": "wm-milk" })
→ cart has NileBuds + milk
```

### 6.5 Storefront fiction (visual aspects only)

| Fiction     | Homage  | Recognizable aspects (no TM names) |
|------------|---------|--------------------------------------|
| NileMart   | Amazon  | River-named marketplace; navy header; oversized search; yellow-gold search/CTA; dark subnav; membership badge “Nile+”; link-blue titles; gold stars; yellow add button |
| WideMart   | Walmart | Bright blue header; yellow spark mark; “Rollback” price pills; fulfillment bar; rounded blue add button; value grocery mix |
| DartHouse  | Target  | White/red header; concentric-ring mark; sparse clean cards; red CTA; home/style assortment; “Bullseye Club” |

## 7. Edge Cases & Errors

- Empty cart: show “Cart is empty. Add from this page — or let the agent do it.”
- Agent prompt empty/whitespace: do not log a tool call; keep the input focused.
- Agent prompt with no matches: explain that this page does not carry it; mention another store if a tag matches elsewhere.
- `add_to_cart` for a foreign SKU: refuse; do not add.
- Quantity below 1: remove the line.
- `sessionStorage` unavailable or quota error: keep in-memory cart; do not crash.
- Duplicate rapid adds: increment quantity, no duplicate lines.
- Keyboard: tabs are arrows/home/end capable enough via native `role="tab"` + click/Enter/Space.

## 8. Non-Functional

- **Perf:** Static catalog in JS; no images over the network; first demo paint is local CSS/HTML.
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
- Assumed: “agent” on the landing page means the in-page tool runner, plus native tools when the browser has WebMCP.

## 10. Acceptance Criteria

- [ ] Given the homepage, when the visitor clicks “View demo”, then the page scrolls to a section below the banner titled as the demo.
- [ ] Given the demo, when the visitor views NileMart, then they see navy search-first chrome and NileMart products — never the word Amazon.
- [ ] Given the demo, when the visitor views WideMart, then they see blue/yellow value-store chrome and WideMart products — never the word Walmart.
- [ ] Given the demo, when the visitor views DartHouse, then they see red/white clean chrome and DartHouse products — never the word Target.
- [ ] Given an item added on NileMart, when the visitor switches to WideMart, then that item remains in the shared cart with a NileMart source pill.
- [ ] Given that cart, when the visitor adds a WideMart item (click or agent), then the cart shows both lines and an updated subtotal.
- [ ] Given the agent on NileMart and prompt “Add milk”, when submitted, then the cart does not gain milk and the log explains milk is not on this page.
- [ ] Given the agent on WideMart and prompt “Add milk”, when submitted, then milk is added via `search_products` then `add_to_cart` visible in the log.
- [ ] Given a cart with items, when the tab is reloaded, then the cart is restored from sessionStorage.
- [ ] Given a product card, when “Add to cart” is clicked twice, then quantity becomes 2 on one line.

## 11. Test Strategy

- No unit-test runner in this repo yet; do not add one for this slice.
- Typecheck: `npx tsc --noEmit` (Astro strict tsconfig).
- Manual / Playwright against `http://localhost:4321/`:
  1. Scroll/click to demo.
  2. Add from NileMart, switch store, confirm cart.
  3. Agent happy path and wrong-store path.
  4. Quantity increment and remove.
  5. Desktop and ~375px viewport.

## 12. Rollout

- Ships as part of the existing landing feature branch. No flags.
- Backward compatible: additive homepage section.
- Migration: none.

## 13. Open Questions

- None. Resolved: three homage stores; in-page simulated agent (no LLM); in-page tabs not routes; sessionStorage only; native WebMCP best-effort without a new package.
