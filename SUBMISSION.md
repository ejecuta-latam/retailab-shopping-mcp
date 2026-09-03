# Devpost submission draft — shopping-mcp

Copy these into [The WebMCP Challenge](https://webmcp.devpost.com/) form. Keep the live URL and repo public through judging (21 Sep 2026).

## Links

- **Live URL (agent page):** https://shopping.realslab.xyz/demo
- **Landing:** https://shopping.realslab.xyz/
- **Repo:** https://github.com/ejecuta-latam/retailab-shopping-mcp
- **License:** MIT (`LICENSE` at repo root)
- **Demo video:** _paste the public YouTube URL here — under 3 minutes, with audio_

## Text description

### Why this use case is a strong fit for WebMCP

Retail sites are built for eyes and clicks. Agents today scrape the DOM or guess at “Add to cart” buttons, so they fill the wrong SKU, the wrong store, or skip the human. WebMCP lets each storefront expose the same shopping tools (`search_products`, `list_products`, `add_to_cart`, `get_cart`, `remove_from_cart`, optional `checkout`, `open_ui`). The agent reads the open page’s catalog — not the whole internet — and mutates that origin’s cart. shopping-mcp is that shared profile, as a small library stores can install.

### How it creates a better user experience

People still choose. The agent lists options, the shopper picks, then `add_to_cart` runs. The shared cart island (`open_ui`) is the same UI humans and agents update. Crossing NileMart → WideMart → DartHouse does not wipe the basket; tools stay page-scoped so milk is not sold on NileMart.

### What people and agents can do together that was difficult before

Shop a trip across stores without scraping or a silent mega-checkout. The human watches the island; the agent calls `switch_store` and `add_to_cart`. Checkout stays per origin (optional `checkout` handler). That was awkward with DOM automation and unsafe as one hidden payment.

### How we implemented WebMCP

`packages/shopping-mcp` registers tools on `document.modelContext.registerTool` (fallback `provideContext`) from the browser. `/demo` wires handlers to a static catalog and `sessionStorage` cart, plus demo-only `list_stores` / `switch_store`. The cart island is closed shadow DOM owned by the library, not `inject_html`. No login. Test with ChatGPT’s in-app browser or Chrome + `chrome://flags/#enable-webmcp-testing`.

## Testing instructions (private field is fine)

1. Open https://shopping.realslab.xyz/demo in ChatGPT’s in-app browser or Chrome with WebMCP testing enabled.
2. Confirm tools: `search_products`, `list_products`, `add_to_cart`, `get_cart`, `remove_from_cart`, `open_ui`, `list_stores`, `switch_store`.
3. `list_products` on NileMart → `add_to_cart` a SKU → `switch_store` `{ "storeId": "widemart" }` → `get_cart` still has the NileMart line.
4. Click Add to cart as a human; the island matches the tools.

No credentials.
