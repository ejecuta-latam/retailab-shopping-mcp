import { coreTools, mergeTools } from "./tools";
import type { RegisterShoppingMcpOptions, ShoppingMcpTool } from "./types";

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

export function registerShoppingMcp(options: RegisterShoppingMcpOptions): () => void {
  const ctx = getModelContext();
  if (!ctx) {
    return () => {};
  }

  const extra = options.extraTools ?? [];
  const tools = mergeTools(coreTools(options.handlers), extra).map(toRegistered);

  const controller = new AbortController();

  if (typeof ctx.registerTool === "function") {
    for (const tool of tools) {
      void registerOne(ctx, tool, controller.signal);
    }
  } else if (typeof ctx.provideContext === "function") {
    ctx.provideContext({ tools });
  }

  return () => {
    controller.abort();
    if (typeof ctx.provideContext === "function") {
      ctx.provideContext({ tools: [] });
    }
  };
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
