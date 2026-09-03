import type { CartLine, Product } from "./types";

export const CART_STORAGE_KEY = "shopping-mcp.demo.cart";

export function emptyCart(): CartLine[] {
  return [];
}

export function addLine(cart: CartLine[], product: Product, quantity = 1): CartLine[] {
  const nextQty = Math.max(1, Math.floor(quantity));
  const existing = cart.find((line) => line.skuId === product.skuId);
  if (existing) {
    return cart.map((line) =>
      line.skuId === product.skuId
        ? { ...line, quantity: line.quantity + nextQty }
        : line,
    );
  }
  return [
    ...cart,
    {
      skuId: product.skuId,
      storeId: product.storeId,
      name: product.name,
      priceCents: product.priceCents,
      quantity: nextQty,
    },
  ];
}

export function setLineQuantity(cart: CartLine[], skuId: string, quantity: number): CartLine[] {
  if (quantity < 1) {
    return removeLine(cart, skuId);
  }
  return cart.map((line) =>
    line.skuId === skuId ? { ...line, quantity: Math.floor(quantity) } : line,
  );
}

export function removeLine(cart: CartLine[], skuId: string): CartLine[] {
  return cart.filter((line) => line.skuId !== skuId);
}

export function cartTotalCents(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

export function cartItemCount(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function loadCart(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return emptyCart();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return emptyCart();
    }
    return parsed.filter(isCartLine);
  } catch {
    return emptyCart();
  }
}

export function saveCart(cart: CartLine[]): void {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Private mode / quota — keep the in-memory cart.
  }
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const line = value as Record<string, unknown>;
  return (
    typeof line.skuId === "string" &&
    (line.storeId === "nilemart" ||
      line.storeId === "widemart" ||
      line.storeId === "darthouse") &&
    typeof line.name === "string" &&
    typeof line.priceCents === "number" &&
    typeof line.quantity === "number" &&
    line.quantity >= 1
  );
}
