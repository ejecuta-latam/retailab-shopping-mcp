import { expect, test, type Page } from "@playwright/test";

type ToolLike = { name?: string };

async function waitForTools(page: Page) {
  await page.waitForFunction(async () => {
    const context = document.modelContext;
    if (!context?.getTools) return false;
    const tools = await context.getTools();
    return tools.some((tool: ToolLike) => tool.name === "show_stand");
  });
}

async function callTool(page: Page, name: string, input: Record<string, unknown> = {}) {
  return page.evaluate(
    async ({ name, input }) => {
      const context = document.modelContext;
      if (!context) throw new Error("document.modelContext missing");
      const tools = await context.getTools();
      const tool = tools.find((candidate: ToolLike) => candidate.name === name);
      if (!tool) {
        throw new Error(`Tool ${name} not registered: ${tools.map((item: ToolLike) => item.name).join(", ")}`);
      }
      if (typeof context.executeTool !== "function") {
        throw new Error("executeTool is not available");
      }
      const raw = await context.executeTool(tool, JSON.stringify(input));
      if (raw == null) return null;
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    },
    { name, input },
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForTools(page);
});

test("registers the aisle tools", async ({ page }) => {
  const names = await page.evaluate(async () => {
    const tools = await document.modelContext.getTools();
    return tools.map((tool: ToolLike) => tool.name);
  });
  expect(names).toContain("show_stand");
  expect(names).toContain("go_to_aisle");
  expect(names).not.toContain("searchAndAdd");
});

test("necesito leche opens a 4-option dairy stand via tools", async ({ page }) => {
  const result = await callTool(page, "show_stand", { need: "leche" });
  expect(result?.ok ?? result?.structuredContent?.ok ?? true).toBeTruthy();

  await expect(page.locator("[data-aisle='lacteos']")).toBeVisible();
  await expect(page.locator("[data-stand-need='leche']")).toHaveAttribute("data-stand-count", "4");
  await expect(page.getByText("¿Qué tipo de leche te gusta, o alguna de estas 4?")).toBeVisible();
  await expect(page.locator("[data-witness='show_stand']")).toBeVisible();
});

test("add_to_cart only accepts a sku on the open stand", async ({ page }) => {
  await callTool(page, "show_stand", { need: "leche" });
  await callTool(page, "add_to_cart", { skuId: "leche-avena" });
  await expect(page.locator("[data-basket-count]")).toHaveAttribute("data-basket-count", "1");
  await expect(page.getByRole("complementary").getByText("Bebida de avena 1 L")).toBeVisible();

  await callTool(page, "add_to_cart", { skuId: "arroz-redondo" });
  await expect(page.locator("[data-basket-count]")).toHaveAttribute("data-basket-count", "1");
});

test("a new need replaces the stand", async ({ page }) => {
  await callTool(page, "show_stand", { need: "leche" });
  await callTool(page, "show_stand", { need: "arroz" });
  await expect(page.locator("[data-aisle='despensa']")).toBeVisible();
  await expect(page.locator("[data-stand-need='arroz']")).toHaveAttribute("data-stand-count", "4");
});
