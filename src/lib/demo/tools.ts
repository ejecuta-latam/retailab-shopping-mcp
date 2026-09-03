import {
  addLine,
  cartItemCount,
  cartTotalCents,
  removeLine,
} from "./cart";
import { getProduct, productsForStore, searchStoreProducts } from "./catalog";
import type { CartLine, StoreId, ToolResult } from "./types";

export interface ShoppingState {
  storeId: StoreId;
  cart: CartLine[];
}

export interface ShoppingMutators {
  setCart: (cart: CartLine[]) => void;
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
      message: "SKU not on this page. Switch stores to shop another catalog.",
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
