export interface ToolResult {
  ok: boolean;
  message: string;
  data?: unknown;
}

export interface ShoppingMcpHandlers {
  listProducts: () => ToolResult | Promise<ToolResult>;
  searchProducts: (query: string) => ToolResult | Promise<ToolResult>;
  addToCart: (skuId: string, quantity: number) => ToolResult | Promise<ToolResult>;
  getCart: () => ToolResult | Promise<ToolResult>;
  removeFromCart: (skuId: string) => ToolResult | Promise<ToolResult>;
  checkout?: () => ToolResult | Promise<ToolResult>;
}

export interface ShoppingMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => unknown | Promise<unknown>;
}

export interface RegisterShoppingMcpOptions {
  handlers: ShoppingMcpHandlers;
  extraTools?: ShoppingMcpTool[];
}
