# shopping-mcp

A **WebMCP tool profile for retail**: stores expose the same shopping tools so agents browse, choose, and check out without scraping the DOM.

Built for [The WebMCP Challenge](https://webmcp.devpost.com/).

**License:** [MIT](./LICENSE) — open source; GitHub should show **MIT** in the repository About section once this file is on the default branch of a public repo.

## Idea

Agents should shop *with* the user — open options, ask which one, then add — not fill a cart from a search box behind the scenes.

The **shared cart** in this demo is held by the page: needs and picks across fictional storefronts. Each “store” page only exposes its own catalog to tools; the cart persists when you switch stores.

## WebMCP tools

Tools register with the imperative API judges expect:

```ts
await document.modelContext.registerTool({
  name: "search_products",
  description: "Search the product catalog",
  inputSchema: { /* ... */ },
  execute: async (input) => { /* ... */ },
});
```

Implementation: [`src/lib/demo/webmcp.ts`](./src/lib/demo/webmcp.ts)

| Tool | Role |
| --- | --- |
| `list_stores` | List storefronts and which page is open |
| `switch_store` | Open NileMart, WideMart, or DartHouse (cart stays) |
| `search_products` | Search the current store page catalog |
| `list_products` | List products on the current store page |
| `add_to_cart` | Add a SKU from this page to the shared cart |
| `get_cart` | Read the shared cart |
| `remove_from_cart` | Remove a line from the shared cart |

Test in ChatGPT’s in-app browser (WebMCP on by default) or Chrome with `chrome://flags/#enable-webmcp-testing`.

## Site

| Route | What |
| --- | --- |
| `/` | Landing + live multi-store demo (`#demo`) |
| `/docs` | Short standard docs |

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
