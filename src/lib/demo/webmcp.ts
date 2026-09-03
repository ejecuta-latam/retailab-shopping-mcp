import type { RefObject } from "react";
import {
  addToCart,
  getCart,
  listProducts,
  removeFromCart,
  searchProducts,
  type ShoppingMutators,
  type ShoppingState,
} from "./tools";

type JsonSchema = Record<string, unknown>;

interface ModelContext {
  provideContext?: (input: { tools: RegisteredTool[] }) => void;
  registerTool?: (tool: RegisteredTool) => void;
}

interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

export interface LiveRef {
  state: ShoppingState;
  mutators: ShoppingMutators;
}

function getModelContext(): ModelContext | null {
  const nav = navigator as Navigator & { modelContext?: ModelContext };
  const doc = document as Document & { modelContext?: ModelContext };
  return nav.modelContext ?? doc.modelContext ?? null;
}

export function registerShoppingMcp(live: RefObject<LiveRef | null>): () => void {
  const ctx = getModelContext();
  if (!ctx) {
    return () => {};
  }

  const tools: RegisteredTool[] = [
    {
      name: "list_products",
      description:
        "List products on the current store page. Use this to read what this shop is selling right now.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const snap = snapshot(live);
        return listProducts(snap.state);
      },
    },
    {
      name: "search_products",
      description:
        "Search the current store page catalog by keyword. Does not search other stores.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search text, e.g. headphones or milk" },
        },
        required: ["query"],
      },
      execute: async (input) => {
        const query = typeof input.query === "string" ? input.query : "";
        const snap = snapshot(live);
        return searchProducts(snap.state, query);
      },
    },
    {
      name: "add_to_cart",
      description:
        "Add a SKU from the current store page to the shared cart. Fails if the SKU is not on this page.",
      inputSchema: {
        type: "object",
        properties: {
          skuId: { type: "string" },
          quantity: { type: "integer", minimum: 1 },
        },
        required: ["skuId"],
      },
      execute: async (input) => {
        const skuId = typeof input.skuId === "string" ? input.skuId : "";
        const quantity = typeof input.quantity === "number" ? input.quantity : 1;
        const snap = snapshot(live);
        return addToCart(snap.state, snap.mutators, skuId, quantity);
      },
    },
    {
      name: "get_cart",
      description: "Read the shared cart. Items may come from any store in this demo.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const snap = snapshot(live);
        return getCart(snap.state);
      },
    },
    {
      name: "remove_from_cart",
      description: "Remove one SKU line from the shared cart.",
      inputSchema: {
        type: "object",
        properties: { skuId: { type: "string" } },
        required: ["skuId"],
      },
      execute: async (input) => {
        const skuId = typeof input.skuId === "string" ? input.skuId : "";
        const snap = snapshot(live);
        return removeFromCart(snap.state, snap.mutators, skuId);
      },
    },
  ];

  if (typeof ctx.provideContext === "function") {
    ctx.provideContext({ tools });
  } else if (typeof ctx.registerTool === "function") {
    for (const tool of tools) {
      ctx.registerTool(tool);
    }
  }

  return () => {
    if (typeof ctx.provideContext === "function") {
      ctx.provideContext({ tools: [] });
    }
  };
}

function snapshot(live: RefObject<LiveRef | null>): LiveRef {
  if (!live.current) {
    throw new Error("Demo tools are not ready");
  }
  return live.current;
}
