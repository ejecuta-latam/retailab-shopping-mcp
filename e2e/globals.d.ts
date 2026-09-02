export {};

declare global {
  interface Document {
    modelContext?: {
      getTools: () => Promise<Array<{ name?: string }>>;
      executeTool?: (tool: unknown, input: string) => Promise<unknown>;
    };
  }
}
