import { coreTools, mergeTools } from "./tools";
import type {
  RegisterShoppingMcpOptions,
  ShoppingMcpHandlers,
  ShoppingMcpTool,
  ShoppingMcpUiOptions,
  ToolResult,
} from "./types";
import { createCartUi, type CartUi } from "./ui";

type JsonSchema = Record<string, unknown>;

interface ModelContext {
  provideContext?: (input: { tools: RegisteredTool[] }) => void;
  registerTool?: (
    tool: RegisteredTool,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
}

interface RegisteredTool {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

let activeUi: CartUi | null = null;

export async function openCartUi(): Promise<ToolResult> {
  if (!activeUi) {
    return { ok: false, message: "Cart UI is not enabled" };
  }
  return activeUi.open();
}

export async function refreshCartUi(): Promise<void> {
  await activeUi?.refresh();
}

export function registerShoppingMcp(options: RegisterShoppingMcpOptions): () => void {
  const uiOptions = resolveUiOptions(options.ui);
  const handlers = wrapHandlers(options.handlers, () => activeUi?.refresh());
  const ui = uiOptions ? createCartUi(handlers, uiOptions) : null;
  activeUi = ui;

  if (ui && uiOptions?.startOpen) {
    void ui.open();
  }

  const extra = options.extraTools ?? [];
  const tools = mergeTools(coreTools(handlers), extra);
  if (ui) {
    tools.push(openUiTool());
  }

  const ctx = getModelContext();
  const controller = new AbortController();
  const registered = tools.map(toRegistered);

  if (ctx && typeof ctx.registerTool === "function") {
    for (const tool of registered) {
      void registerOne(ctx, tool, controller.signal);
    }
  } else if (ctx && typeof ctx.provideContext === "function") {
    ctx.provideContext({ tools: registered });
  }

  return () => {
    controller.abort();
    if (ctx && typeof ctx.provideContext === "function") {
      ctx.provideContext({ tools: [] });
    }
    ui?.destroy();
    if (activeUi === ui) {
      activeUi = null;
    }
  };
}

function openUiTool(): ShoppingMcpTool {
  return {
    name: "open_ui",
    description:
      "Show the shared shopping cart island on this page so the shopper can see items and the current total.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => openCartUi(),
  };
}

function wrapHandlers(
  handlers: ShoppingMcpHandlers,
  refresh: () => Promise<void> | undefined,
): ShoppingMcpHandlers {
  const after = async (result: ToolResult): Promise<ToolResult> => {
    if (result.ok) {
      await refresh();
    }
    return result;
  };
  return {
    listProducts: handlers.listProducts,
    searchProducts: handlers.searchProducts,
    getCart: handlers.getCart,
    addToCart: async (skuId, quantity) => after(await handlers.addToCart(skuId, quantity)),
    removeFromCart: async (skuId) => after(await handlers.removeFromCart(skuId)),
    setQuantity: handlers.setQuantity
      ? async (skuId, quantity) => after(await handlers.setQuantity!(skuId, quantity))
      : undefined,
    checkout: handlers.checkout,
  };
}

function resolveUiOptions(
  ui: RegisterShoppingMcpOptions["ui"],
): ShoppingMcpUiOptions | null {
  if (ui === false) {
    return null;
  }
  if (ui === true || ui === undefined) {
    return {};
  }
  return ui;
}

async function registerOne(
  ctx: ModelContext,
  tool: RegisteredTool,
  signal: AbortSignal,
): Promise<void> {
  const register = ctx.registerTool;
  if (!register) {
    return;
  }
  try {
    await register(tool, { signal });
  } catch {
    try {
      await register(tool);
    } catch {
      // Store page must keep working if this browser’s WebMCP shape differs.
    }
  }
}

function toRegistered(tool: ShoppingMcpTool): RegisteredTool {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    execute: async (input) => tool.execute(input ?? {}),
  };
}

function getModelContext(): ModelContext | null {
  if (typeof navigator === "undefined" && typeof document === "undefined") {
    return null;
  }
  const nav =
    typeof navigator === "undefined"
      ? undefined
      : (navigator as Navigator & { modelContext?: ModelContext });
  const doc =
    typeof document === "undefined"
      ? undefined
      : (document as Document & { modelContext?: ModelContext });
  return nav?.modelContext ?? doc?.modelContext ?? null;
}
