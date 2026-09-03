# shopping-mcp

A **WebMCP tool profile for retail**: stores expose the same shopping tools so agents browse, choose, and check out without scraping the DOM.

Built for [The WebMCP Challenge](https://webmcp.devpost.com/).

**License:** [MIT](./LICENSE) — open source; GitHub should show **MIT** in the repository About section once this file is on the default branch of a public repo.

## Idea

Agents should shop *with* the user — open options, ask which one, then add — not fill a cart from a search box behind the scenes.

The **shared cart** in this demo is held by the page: needs and picks across fictional storefronts. Each “store” page only exposes its own catalog to tools; the cart persists when you switch stores.

## Library

Stores integrate the profile with [`packages/shopping-mcp`](./packages/shopping-mcp):

```bash
npm install shopping-mcp
```

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

Install tutorial: [`/docs`](./src/pages/docs/index.astro) on the site.

## WebMCP tools

The library registers these names via `document.modelContext.registerTool`:

| Tool | Role |
| --- | --- |
| `search_products` | Search this store’s current page catalog |
| `list_products` | List products on this page |
| `add_to_cart` | Add a SKU from this page to this store’s cart |
| `get_cart` | Read this store’s cart |
| `remove_from_cart` | Remove a line from this store’s cart |
| `checkout` | Optional. Checkout on this origin after the shopper confirms |

The homepage demo also registers `list_stores` and `switch_store` (one page, three fictional shops). Real stores should not ship those.

Test in ChatGPT’s in-app browser (WebMCP on by default) or Chrome with `chrome://flags/#enable-webmcp-testing`.

## Site

| Route | What |
| --- | --- |
| `/` | Landing + live multi-store demo (`#demo`) |
| `/docs` | Install tutorial + tool contract |

## Stack

- [Astro](https://astro.build) 7 + TypeScript  
- React islands + [Motion](https://motion.dev/)  
- Native `document.modelContext.registerTool` (no polyfill required for the challenge path)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Requires Node `>=22.12.0`.

## License

[MIT](./LICENSE) © 2026 retailab

Human-readable page: `/license` on the site. The root `LICENSE` file is what GitHub detects in the repository About section.
