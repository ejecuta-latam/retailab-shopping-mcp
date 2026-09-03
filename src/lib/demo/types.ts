export type StoreId = "nilemart" | "widemart" | "darthouse";

export interface Store {
  id: StoreId;
  name: string;
  hostname: string;
  tagline: string;
  searchPlaceholder: string;
}

export interface Product {
  skuId: string;
  storeId: StoreId;
  name: string;
  description: string;
  priceCents: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  badge: string | null;
  category: string;
}

export interface CartLine {
  skuId: string;
  storeId: StoreId;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface ToolResult {
  ok: boolean;
  message: string;
  data?: unknown;
}
