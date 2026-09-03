import type { ShoppingMcpHandlers, ShoppingMcpTool, ToolResult } from "./types";

const EMPTY_SCHEMA = { type: "object", properties: {} } as const;

export function coreTools(handlers: ShoppingMcpHandlers): ShoppingMcpTool[] {
  const tools: ShoppingMcpTool[] = [
    {
      name: "list_products",
      description:
        "List products this store is selling on the current page. Use this to read the open catalog.",
      inputSchema: EMPTY_SCHEMA,
      execute: async () => runHandler(() => handlers.listProducts()),
    },
    {
      name: "search_products",
      description:
        "Search this store’s current page catalog by keyword. Does not search other stores.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search text, e.g. headphones or milk",
          },
        },
        required: ["query"],
      },
      execute: async (input) => {
        const query = typeof input.query === "string" ? input.query : "";
        return runHandler(() => handlers.searchProducts(query));
      },
    },
    {
      name: "add_to_cart",
      description:
        "Add a SKU from this store’s current catalog to this store’s cart. Fails if the SKU is not on this page.",
      inputSchema: {
        type: "object",
        properties: {
          skuId: { type: "string" },
          quantity: { type: "integer", minimum: 1 },
        },
        required: ["skuId"],
      },
      execute: async (input) => {
        const skuId = typeof input.skuId === "string" ? input.skuId.trim() : "";
        if (!skuId) {
          return fail("skuId is required");
        }
        const quantity = parseQuantity(input.quantity);
        if (quantity === null) {
          return fail("quantity must be an integer >= 1");
        }
        return runHandler(() => handlers.addToCart(skuId, quantity));
      },
    },
    {
      name: "get_cart",
      description: "Read this store’s cart.",
      inputSchema: EMPTY_SCHEMA,
      execute: async () => runHandler(() => handlers.getCart()),
    },
    {
      name: "remove_from_cart",
      description: "Remove one SKU line from this store’s cart.",
      inputSchema: {
        type: "object",
        properties: { skuId: { type: "string" } },
        required: ["skuId"],
      },
      execute: async (input) => {
        const skuId = typeof input.skuId === "string" ? input.skuId.trim() : "";
        if (!skuId) {
          return fail("skuId is required");
        }
        return runHandler(() => handlers.removeFromCart(skuId));
      },
    },
  ];

  if (handlers.checkout) {
    const checkout = handlers.checkout;
    tools.push({
      name: "checkout",
      description:
        "Start checkout on this origin only. Must not pay silently; the store should require shopper confirmation.",
      inputSchema: EMPTY_SCHEMA,
      execute: async () => runHandler(() => checkout()),
    });
  }

  return tools;
}

export function mergeTools(
  core: ShoppingMcpTool[],
  extra: ShoppingMcpTool[],
): ShoppingMcpTool[] {
  const taken = new Set(core.map((tool) => tool.name));
  return [...core, ...extra.filter((tool) => !taken.has(tool.name))];
}

function parseQuantity(raw: unknown): number | null {
  if (raw === undefined) {
    return 1;
  }
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 1) {
    return null;
  }
  return raw;
}

async function runHandler(run: () => ToolResult | Promise<ToolResult>): Promise<ToolResult> {
  try {
    return await run();
  } catch {
    return fail("Tool failed");
  }
}

function fail(message: string): ToolResult {
  return { ok: false, message };
}
