# shopping-mcp

WebMCP tool profile for retail. Your store registers the same shopping tools so agents can browse, add, and check out without scraping the DOM.

This package is the **library stores integrate**. The landing demo and full tutorial live in the same repo: [retailab-shopping-mcp](https://github.com/ejecuta-latam/retailab-shopping-mcp) → `/docs`.

## Install

```bash
npm install shopping-mcp
```

Until the package is on npm, use this repo:

```json
{
  "dependencies": {
    "shopping-mcp": "file:./packages/shopping-mcp"
  }
}
```

## Register

Call once in the **browser** on the storefront page (not on your Node server).

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

Each handler returns `{ ok, message, data? }`. You map those to your cart and catalog. The library only registers names, schemas, and argument checks.

`checkout` is optional. If you omit it, that tool is not registered.

## Tools

| Tool | Role |
| --- | --- |
| `list_products` | Catalog on this page |
| `search_products` | Search this page |
| `add_to_cart` | Add a SKU from this page |
| `get_cart` | This store’s cart |
| `remove_from_cart` | Remove a line |
| `checkout` | This origin only, after the shopper confirms |
| `open_ui` | Show the cart island on this page |

`open_ui` ships with a floating island (shadow DOM). Pass `ui: false` to skip it. From your own Cart button, call `openCartUi()`.

Agents keep a **trip list** across stores. Each store keeps its own real cart and checkout.

## License

MIT © 2026 retailab
