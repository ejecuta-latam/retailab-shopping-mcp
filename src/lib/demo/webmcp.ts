import type { RefObject } from "react";
import { registerShoppingMcp as registerProfile, openCartUi } from "shopping-mcp";
import type { ShoppingMcpTool } from "shopping-mcp";
import {
  addToCart,
  getCart,
  listProducts,
  listStores,
  removeFromCart,
  searchProducts,
  setQuantity as setCartLineQuantity,
  switchStore,
  type ShoppingMutators,
  type ShoppingState,
} from "./tools";

export interface LiveRef {
  state: ShoppingState;
  mutators: ShoppingMutators;
}

export function registerShoppingMcp(
  live: RefObject<LiveRef | null>,
  options?: { startOpen?: boolean },
): () => void {
  return registerProfile({
    handlers: {
      listProducts: () => listProducts(snap(live).state),
      searchProducts: (query) => searchProducts(snap(live).state, query),
      addToCart: (skuId, quantity) => {
        const current = snap(live);
        return addToCart(current.state, current.mutators, skuId, quantity);
      },
      getCart: () => getCart(snap(live).state),
      removeFromCart: (skuId) => {
        const current = snap(live);
        return removeFromCart(current.state, current.mutators, skuId);
      },
      setQuantity: (skuId, quantity) => {
        const current = snap(live);
        return setCartLineQuantity(current.state, current.mutators, skuId, quantity);
      },
    },
    extraTools: demoStoreTools(live),
    ui: {
      root: () => document.querySelector(".demo-browser"),
      startOpen: options?.startOpen ?? true,
      title: "Shared cart",
    },
  });
}

function demoStoreTools(live: RefObject<LiveRef | null>): ShoppingMcpTool[] {
  return [
    {
      name: "list_stores",
      description:
        "List the demo storefronts (nilemart, widemart, darthouse) and which one is currently open. Call this before switch_store if you do not know the storeId.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => listStores(snap(live).state),
    },
    {
      name: "switch_store",
      description:
        "Open another storefront page in this demo. The shared cart is kept. Use when the shopper wants a different store, or when add_to_cart failed because the SKU is not on this page.",
      inputSchema: {
        type: "object",
        properties: {
          storeId: {
            type: "string",
            enum: ["nilemart", "widemart", "darthouse"],
            description:
              "nilemart = marketplace (electronics), widemart = value/grocery, darthouse = home/style.",
          },
        },
        required: ["storeId"],
      },
      execute: async (input) => {
        const storeId = typeof input.storeId === "string" ? input.storeId : "";
        const current = snap(live);
        return switchStore(current.state, current.mutators, storeId);
      },
    },
  ];
}

function snap(live: RefObject<LiveRef | null>): LiveRef {
  if (!live.current) {
    throw new Error("Demo tools are not ready");
  }
  return live.current;
}

export { openCartUi };
