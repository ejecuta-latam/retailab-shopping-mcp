# Spec: shopping-mcp store library (same site)

## 1. Problem & Goals

- **Problem:** Stores cannot integrate shopping-mcp today. The profile only exists as demo glue in `src/lib/demo/webmcp.ts`. Docs still describe an older `show_stand` set that the demo does not register. There is no installable package and no tutorial.
- **Why now:** The product is a *standard stores adopt*, not a Chrome extension. Judges and merchants need `npm install` + a page that shows landing, demo, and docs together.
- **Goals (measurable):**
  1. A publishable TypeScript package `shopping-mcp` lives in this repo at `packages/shopping-mcp`.
  2. A store can register the profile with `registerShoppingMcp({ handlers })` — no React, no demo catalog.
  3. `/docs` is an install tutorial plus the tool contract (names match the package, not `show_stand`).
  4. The `/demo` page uses the package for the core tools. `list_stores` / `switch_store` stay demo-only extras.
  5. `npm install` at the repo root still runs the Astro site.

## 2. Non-Goals

- A second git repo or npm org publish in this slice (`npm publish` is documented, not executed).
- Chrome extension work (separate project).
- Changing NileMart/WideMart/DartHouse UI.
- A backend, auth, or real checkout provider.
- Rewriting demo cart/catalog into the package (those stay demo adapters).
- React bindings / `useWebMCP` wrapper.

## 3. Users & Stories

- As a **store engineer**, I want `npm install shopping-mcp` and a 15-line example so I can expose tools from our cart API.
- As a **judge / visitor**, I want one GitHub repo: landing, live demo, and docs for the library.
- As a **WebMCP agent**, I want the same tool names on a real store as on the demo (minus demo-only store switching).

## 4. Scope

- **In:** `packages/shopping-mcp`; npm workspaces; `/docs` tutorial; demo wired to the package; README pointer.
- **Out:** Publishing to npm registry; extension; new demo stores.

## 5. Functional Requirements

### 5.1 Layout

1. Repo is a workspace: root = Astro site (private `shopping-mcp-web`); `packages/shopping-mcp` = the library (`shopping-mcp`).
2. Root depends on `shopping-mcp` via the workspace (not a copied file).

### 5.2 Library API

3. Browser-only. Zero dependencies. No React.
4. Public exports: `registerShoppingMcp`, types `ShoppingMcpHandlers`, `ToolResult`, `ShoppingMcpTool`, `RegisterShoppingMcpOptions`.
5. `registerShoppingMcp(options)`:
   1. Feature-detect `document.modelContext` or `navigator.modelContext`.
   2. If neither has `registerTool` nor `provideContext`, return a no-op unregister. Do not throw.
   3. Register core tools from `handlers` (see §6).
   4. Register `options.extraTools` after core tools (demo uses this).
   5. Prefer `registerTool` (with `AbortSignal` when the second argument is accepted). Else `provideContext({ tools })`.
   6. Return `() => void` that aborts the signal and/or `provideContext({ tools: [] })`.
6. Handlers may be sync or async. The library always `await`s them.
7. The library does not implement catalog or cart. It only validates argument *shapes* (string skuId, quantity default 1 / min 1) then calls the handler.
8. Invalid quantity (`not a number` or `< 1`) → library returns `{ ok: false, message: "quantity must be an integer >= 1" }` without calling `addToCart`.
9. Missing `skuId` for add/remove → `{ ok: false, message: "skuId is required" }`.
10. Missing `query` for search → call handler with `""` (store may treat as list or empty).

### 5.3 Core tools (always registered)

| Name | Handler |
| --- | --- |
| `list_products` | `listProducts()` |
| `search_products` | `searchProducts(query)` |
| `add_to_cart` | `addToCart(skuId, quantity)` |
| `get_cart` | `getCart()` |
| `remove_from_cart` | `removeFromCart(skuId)` |

11. If `handlers.checkout` is provided, also register `checkout`. If omitted, do not register `checkout`.

### 5.3b Cart island + `open_ui`

11a. Unless `ui: false`, the library mounts a floating cart island (closed shadow root). No React. Markup is library-owned; agents never send HTML.
11b. Always register `open_ui` when the island is enabled. Input `{}`. Shows the island and returns `{ ok: true, message, data: { itemCount, totalCents } }`. Already open: still `ok: true`.
11c. Island default is **hidden**. Close via the island’s close control or Escape. No `close_ui` tool in this slice.
11d. Island reads `getCart().data` (`items`, `totalCents`, `itemCount`). Each item needs `skuId`, `name`, `priceCents`, `quantity`. Optional `storeName` for a source pill.
11e. Island actions: increment → `addToCart(skuId, 1)`; decrement → `setQuantity(skuId, n-1)` if that handler exists, else `removeFromCart` when `n === 1`; Remove → `removeFromCart`. Then refresh from `getCart`.
11f. Successful `add_to_cart` / `remove_from_cart` from tools also refresh the island if it is open.
11g. `ui.root` is a parent element or getter. Default `document.body` (fixed). Non-body roots: absolute, bottom-right; if the parent is `position: static`, set `relative`.
11h. `ui.startOpen: true` opens the island after mount (demo uses this).
11i. Island mounts even when `modelContext` is missing (humans still see it). Tools still no-op-register in that case.
11j. Public helpers: `openCartUi()`, `refreshCartUi()`. Cart chip on a store can call `openCartUi()`.
11k. Optional handler `setQuantity(skuId, quantity)` is UI-only (not a WebMCP tool). Quantity `< 1` should remove the line (store implements that).

### 5.4 Not in the library

12. `list_stores`, `switch_store` are **not** core. Demo passes them as `extraTools`.

### 5.5 Docs (`/docs`)

13. Replace the `show_stand` / `look_stand` list with the core tools above.
14. Sections, in order: What it is → Install → Register (tutorial) → Tool contract → Cart vs trip → Demo extras → Try it.
15. Install snippet: `npm install shopping-mcp`.
16. Tutorial uses a realistic handler sketch (the store’s own cart), not NileMart SKUs as required IDs.
17. Link GitHub package path `packages/shopping-mcp`.
18. Note: until npm publish, install from git: `npm install github:ejecuta-latam/retailab-shopping-mcp#main` is **out** if the repo is not set up for subpath. Document: clone this repo and `"shopping-mcp": "file:./packages/shopping-mcp"` **or** `npm install shopping-mcp` after publish. For the hackathon, show both: `npm install shopping-mcp` as the intended command, and workspace/`file:` for developing against this repo.

### 5.6 Demo

19. `src/lib/demo/webmcp.ts` calls `registerShoppingMcp` from `shopping-mcp` with demo handlers + extra store-switch tools.
20. Demo handler behavior unchanged (same messages, same SKU rules).
21. Showcase does **not** use the sidebar `SharedCart`. The library island is the cart UI, mounted on `.demo-browser`, `startOpen: true`. Store cart chips call `openCartUi()`.
22. Demo `getCart` includes `storeName` on each line. Demo provides `setQuantity`.

## 6. Interfaces & Data

```ts
interface ToolResult {
  ok: boolean;
  message: string;
  data?: unknown;
}

interface ShoppingMcpHandlers {
  listProducts: () => ToolResult | Promise<ToolResult>;
  searchProducts: (query: string) => ToolResult | Promise<ToolResult>;
  addToCart: (skuId: string, quantity: number) => ToolResult | Promise<ToolResult>;
  getCart: () => ToolResult | Promise<ToolResult>;
  removeFromCart: (skuId: string) => ToolResult | Promise<ToolResult>;
  setQuantity?: (skuId: string, quantity: number) => ToolResult | Promise<ToolResult>;
  checkout?: () => ToolResult | Promise<ToolResult>;
}

interface ShoppingMcpUiOptions {
  root?: ParentNode | (() => ParentNode | null);
  startOpen?: boolean;
  title?: string;
}

interface RegisterShoppingMcpOptions {
  handlers: ShoppingMcpHandlers;
  extraTools?: ShoppingMcpTool[];
  ui?: boolean | ShoppingMcpUiOptions;
}

interface ShoppingMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => unknown | Promise<unknown>;
}

```

### 6.1 Tool schemas (library)

**`list_products`** `{}` → handler result. Description: “List products this store is selling on the current page.”

**`search_products`** `{ query: string }` required.

**`add_to_cart`** `{ skuId: string, quantity?: integer minimum 1 }`. Description: “Add a SKU from this store’s current catalog to this store’s cart.”

**`get_cart`** `{}`. Description: “Read this store’s cart.”

**`remove_from_cart`** `{ skuId: string }` required.

**`checkout`** (optional) `{}`. Description: “Start checkout on this origin only. Must not pay silently; the store should require shopper confirmation.”

**`open_ui`** `{}`. Description: “Show the shared shopping cart island on this page. The shopper sees items and the current total.” Not registered when `ui: false`.

### 6.2 Tutorial example (docs, exact shape)

```ts
import { registerShoppingMcp } from "shopping-mcp";

registerShoppingMcp({
  handlers: {
    listProducts: () => myApi.list(),
    searchProducts: (query) => myApi.search(query),
    addToCart: (skuId, quantity) => myApi.add(skuId, quantity),
    getCart: () => myApi.cart(),
    removeFromCart: (skuId) => myApi.remove(skuId),
    checkout: () => myApi.checkout(),
  },
});
```

Call once on the storefront page (browser). Not in a Node server.

## 7. Edge Cases & Errors

- No WebMCP API: no-op unregister; store page still works.
- `registerTool` throws (older shape): try without `{ signal }`; if that throws, skip that tool, do not crash the store.
- Handler throws: library catches and returns `{ ok: false, message: "Tool failed" }` (do not leak stacks).
- Duplicate extra tool name vs core: extra wins only if we register extra after — **spec: skip extra tools whose names collide with core**. Log nothing (no console spam required).
- SSR: `registerShoppingMcp` must not throw if `document` / `navigator` are undefined; return no-op.

## 8. Non-Functional

- **Perf:** Registration is O(n tools), n ≤ 10.
- **Security:** No `innerHTML` from tool payloads or product names; island uses `textContent`. Handlers are the store’s code.
- **A11y:** Island is a `dialog` with `aria-labelledby`. Close control named “Close shared cart”. Escape hides it.
- **i18n:** English tool descriptions only.
- **License:** MIT, same as repo.

## 9. Dependencies & Assumptions

- Astro site already uses React; library must not import it.
- GitHub: `ejecuta-latam/retailab-shopping-mcp` (from Nav).
- Assumed: npm workspaces with existing `package-lock.json`.
- Assumed: intended public npm name is `shopping-mcp` (may be unpublished yet).

## 10. Acceptance Criteria

- [ ] Given the repo root, when `npm install` then `npm run dev`, then `/demo` still shops and `/docs` shows Install + the example import from `"shopping-mcp"`.
- [ ] Given `/docs`, when read, then `show_stand` / `look_stand` do not appear; `list_products` and `search_products` do.
- [ ] Given `packages/shopping-mcp`, when imported by the demo, then core tools still register when `modelContext` exists.
- [ ] Given a handler that throws, when the tool runs, then the agent sees `{ ok: false }` not an uncaught exception.
- [ ] Given no `modelContext`, when `registerShoppingMcp` runs, then it returns without throwing.
- [ ] Given demo `switch_store`, when called on `/demo`, then store tabs still change (extra tool path).
- [ ] Given `/demo`, when it loads, then a “Shared cart” island is visible inside the fake browser (not a sidebar panel).
- [ ] Given the island closed, when `open_ui` or the store Cart chip runs, then the island is visible with the current subtotal.
- [ ] Given NileMart add-to-cart, when the visitor switches to WideMart, then the island still lists the NileMart line.

## 11. Test Strategy

- `npx tsc --noEmit` at repo root (Astro strict).
- Manual: `/docs` tutorial readable; demo add-to-cart; grep that demo imports from `shopping-mcp`.

## 12. Rollout

- Same landing branch/repo. No feature flag.
- npm publish later; docs mention the intended package name now.

## 13. Open Questions

- None. Resolved: same repo; island lives in the package; `open_ui` shows it; demo mounts it on the fake browser and drops the sidebar cart.
