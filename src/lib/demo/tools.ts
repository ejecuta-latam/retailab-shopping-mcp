import {
  addLine,
  cartItemCount,
  cartTotalCents,
  removeLine,
} from "./cart";
import {
  getProduct,
  getStore,
  parseStoreId,
  productsForStore,
  searchStoreProducts,
  STORES,
} from "./catalog";
import type { CartLine, StoreId, ToolResult } from "./types";

export interface ShoppingState {
  storeId: StoreId;
  cart: CartLine[];
}

export interface ShoppingMutators {
  setCart: (cart: CartLine[]) => void;
  setStoreId: (storeId: StoreId) => void;
}

export function listStores(state: ShoppingState): ToolResult {
  return {
    ok: true,
    message: `${STORES.length} storefronts. Current: ${getStore(state.storeId).name}`,
    data: {
      currentStoreId: state.storeId,
      stores: STORES.map((store) => ({
        storeId: store.id,
        name: store.name,
        hostname: store.hostname,
        current: store.id === state.storeId,
      })),
    },
  };
}

export function switchStore(
  state: ShoppingState,
  mutators: ShoppingMutators,
  storeIdRaw: string,
): ToolResult {
  const storeId = parseStoreId(storeIdRaw) ?? parseStoreId(storeIdRaw.replace(/-/g, ""));
  if (!storeId) {
    return {
      ok: false,
      message: "Unknown store. Use storeId nilemart, widemart, or darthouse.",
    };
  }
  const store = getStore(storeId);
  if (storeId === state.storeId) {
    return {
      ok: true,
      message: `Already on ${store.name}`,
      data: { storeId, hostname: store.hostname },
    };
  }
  mutators.setStoreId(storeId);
  return {
    ok: true,
    message: `Opened ${store.name}`,
    data: { storeId, hostname: store.hostname },
  };
}

export function listProducts(state: ShoppingState): ToolResult {
  const products = productsForStore(state.storeId);
  return {
    ok: true,
    message: `${products.length} products on this page`,
    data: { storeId: state.storeId, products },
  };
}

export function searchProducts(state: ShoppingState, query: string): ToolResult {
  const products = searchStoreProducts(state.storeId, query);
  return {
    ok: true,
    message:
      products.length === 0
        ? `No matches on this page for “${query}”`
        : `${products.length} match${products.length === 1 ? "" : "es"} on this page`,
    data: { storeId: state.storeId, query, products },
  };
}

export function addToCart(
  state: ShoppingState,
  mutators: ShoppingMutators,
  skuId: string,
  quantity = 1,
): ToolResult {
  const product = getProduct(skuId);
  if (!product || product.storeId !== state.storeId) {
    return {
      ok: false,
      message:
        "SKU not on this page. Call switch_store with the storeId that carries this SKU, then add_to_cart again.",
    };
  }
  const next = addLine(state.cart, product, quantity);
  mutators.setCart(next);
  return {
    ok: true,
    message: `Added ${product.name}`,
    data: { cart: next },
  };
}

export function getCart(state: ShoppingState): ToolResult {
  return {
    ok: true,
    message: `${cartItemCount(state.cart)} item(s) in the shared cart`,
    data: {
      items: state.cart,
      totalCents: cartTotalCents(state.cart),
      itemCount: cartItemCount(state.cart),
    },
  };
}

export function removeFromCart(
  state: ShoppingState,
  mutators: ShoppingMutators,
  skuId: string,
): ToolResult {
  if (!state.cart.some((line) => line.skuId === skuId)) {
    return { ok: false, message: "Item not in cart" };
  }
  const next = removeLine(state.cart, skuId);
  mutators.setCart(next);
  return {
    ok: true,
    message: "Removed from cart",
    data: { cart: next },
  };
}
