# Devpost submission — shopping-mcp

Copy from the first question downward into the text description. Keep the live URL and repo public through judging.

**Live URL:** https://shopping.ejecuta.lat/demo  
**Landing:** https://shopping.ejecuta.lat/  
**Docs:** https://shopping.ejecuta.lat/docs  
**Repo:** https://github.com/ejecuta-latam/retailab-shopping-mcp  
**License:** MIT  
**Demo video:** _paste the public YouTube URL here — under 3 minutes, with audio_

---

## Why your use case is a strong fit for WebMCP

Retail is the web agents fail at most. Every storefront is a different layout, a different “Add to cart” button, and a different cart. That is fine for people. It is a mess for agents.

Today an agent that wants to shop has to scrape HTML, guess selectors, and hope the button it clicked was the right SKU. Sometimes it fills a cart the shopper never saw. Sometimes it adds milk on a marketplace that does not sell milk. Sometimes it tries to pay in one silent step across merchants that do not share a checkout.

WebMCP exists so a page can *say* what it already knows. A storefront already has a catalog and a cart. shopping-mcp is a shared tool profile for that: the same names on every participating site — `search_products`, `list_products`, `add_to_cart`, `get_cart`, `remove_from_cart`, optional `checkout`, and `open_ui`. The agent reads the open page’s catalog, not the whole internet, and mutates that origin’s cart.

Stores can look different. The tools do not. The agent learns the profile once. Every store that installs the library becomes a store it already knows how to use. That is a stronger fit for WebMCP than another scraper, extension, or one-off demo API: the open web stays the source of truth, and the page publishes a contract instead of HTML to reverse-engineer.

---

## How it creates a better user experience

People still choose. The agent is a shopper sitting next to you, not a bot that fills the bag behind your back.

You see the same basket the agent sees. The library mounts a floating cart island (`open_ui`). Human clicks on “Add to cart” and agent tool calls update that same island. Nothing is hidden in a side channel.

The agent proposes; you pick. It can `search_products` or `list_products` on the open storefront, show options, and wait. `add_to_cart` runs after you decide — not as a silent bulk fill.

The page is honest. Tools only see the catalog of the store that is open. Milk is not on NileMart. If you need groceries, the demo switches to WideMart. You are not tricked into a fake universal aisle.

A trip can span stores without wiping what you already chose. In the live demo, add NileBuds on NileMart, switch to WideMart, and the NileMart line is still in the island. Then add milk. One trip, three homage shops, one visible cart.

Checkout stays yours. Real stores keep their own cart and their own payment. `checkout` is optional and must require confirmation. There is no cross-origin silent pay.

The experience is the one people already understand: walk the aisle, put things in a basket, look at the basket, pay where you always pay. The agent just happens to be able to walk the aisle with you.

---

## Describe what people and agents can do together that was difficult or impossible before

They can shop a trip across stores together — without scraping, without the agent pretending to be a mouse, and without a silent mega-checkout.

Before WebMCP, that meant a custom scraper per retailer, brittle click paths, and a cart the human often never saw. Paying in one hidden step across merchants was both awkward and unsafe.

Now the human and the agent share one visible island. The agent calls structured tools on the open page (`search_products`, `list_products`, `add_to_cart`, `get_cart`, `remove_from_cart`). On the demo it can `switch_store` from NileMart to WideMart to DartHouse so a judge can watch the same profile on three shops without leaving one URL. The human watches the island, can add or remove by hand, and the agent’s lines stay. `open_ui` shows the work; the agent does not inject HTML.

Each real merchant would still keep its own cart and checkout. The agent keeps a trip — needs, picks, store URLs — by calling `get_cart` as it moves. Checkout is per origin, after the shopper confirms. That collaboration (browse together, choose together, pay where the store already charges) was not practical when the only interface was the DOM.

---

## Briefly explain how you implemented WebMCP

We shipped a small, zero-dependency browser library, `shopping-mcp` (`packages/shopping-mcp`). A store maps the profile onto the cart it already has and calls `registerShoppingMcp` once on the storefront page (not on Node):

```ts
import { registerShoppingMcp } from "shopping-mcp";

registerShoppingMcp({
  handlers: {
    listProducts: () => myApi.list(),
    searchProducts: (query) => myApi.search(query),
    addToCart: (skuId, quantity) => myApi.add(skuId, quantity),
    getCart: () => myApi.cart(),
    removeFromCart: (skuId) => myApi.remove(skuId),
    checkout: () => myApi.checkout(), // optional
  },
});
```

The library registers those tools on `document.modelContext.registerTool` (fallback `provideContext`). It validates argument shapes, then calls the store’s handlers. It does not scrape the page and it does not own inventory. If WebMCP is missing, registration is a no-op; humans can still use the cart island.

`/demo` wires handlers to a static catalog and a `sessionStorage` cart. It also registers demo-only `list_stores` and `switch_store` because NileMart, WideMart, and DartHouse share one page — real stores should not ship those. The cart island is closed shadow DOM owned by the library, not agent-injected HTML. Optional `checkout` is omitted until a merchant is ready; when present it must require shopper confirmation.

No login. Test in ChatGPT’s in-app browser (WebMCP on by default) or Chrome with `chrome://flags/#enable-webmcp-testing`. Live page: https://shopping.ejecuta.lat/demo — install tutorial: https://shopping.ejecuta.lat/docs

---

## Testing instructions (private field is fine)

1. Open https://shopping.ejecuta.lat/demo in ChatGPT’s in-app browser or Chrome with WebMCP testing enabled.
2. Confirm tools: `search_products`, `list_products`, `add_to_cart`, `get_cart`, `remove_from_cart`, `open_ui`, `list_stores`, `switch_store`.
3. `list_products` on NileMart → `add_to_cart` a SKU → `switch_store` `{ "storeId": "widemart" }` → `get_cart` still has the NileMart line.
4. Click Add to cart as a human; the island matches the tools.

No credentials.
