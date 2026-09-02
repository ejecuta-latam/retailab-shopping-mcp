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

test("moda lets you visualize a dress and give it up", async ({ page }) => {
  await callTool(page, "show_stand", { need: "dress" });
  await expect(page.locator("[data-aisle='moda']")).toBeVisible();
  await expect(page.locator("[data-stand-need='vestir']")).toHaveAttribute("data-stand-count", "4");

  await callTool(page, "visualize_product", { skuId: "vestir-vestido" });
  await expect(page.locator("[data-preview='vestir-vestido']")).toBeVisible();
  await expect(page.getByText("Así se ve. Añádelo o déjalo.")).toBeVisible();
  await expect(page.locator("[data-basket-count]")).toHaveAttribute("data-basket-count", "0");

  await callTool(page, "give_up_product");
  await expect(page.locator("[data-preview='']")).toBeVisible();
  await expect(page.locator("[data-basket-count]")).toHaveAttribute("data-basket-count", "0");
});

test("compare_options advises without adding", async ({ page }) => {
  await callTool(page, "show_stand", { need: "leche" });
  const result = await callTool(page, "compare_options");
  const payload = result?.structuredContent ?? result;
  const options = payload?.data?.options ?? payload?.options;
  expect(options).toHaveLength(4);
  expect(options?.some((option: { why?: string }) => option.why?.includes("lactosa"))).toBe(true);
  expect(options?.some((option: { storeBrand?: boolean }) => option.storeBrand)).toBe(true);
  await expect(page.locator("[data-basket-count]")).toHaveAttribute("data-basket-count", "0");
});

test("a new need replaces the stand", async ({ page }) => {
  await callTool(page, "show_stand", { need: "leche" });
  await callTool(page, "show_stand", { need: "arroz" });
  await expect(page.locator("[data-aisle='despensa']")).toBeVisible();
  await expect(page.locator("[data-stand-need='arroz']")).toHaveAttribute("data-stand-count", "4");
});

test("a list of needs is one trip and checkout prints a ticket", async ({ page }) => {
  await callTool(page, "show_stand", { need: "leche, arroz y jabon" });
  await expect(page.locator("[data-aisle='lacteos']")).toBeVisible();
  await expect(page.locator("[data-trip]")).toHaveAttribute("data-trip", "leche,arroz,jabon");
  await expect(page.locator("[data-trip-remaining]")).toHaveAttribute("data-trip-remaining", "2");

  await callTool(page, "add_to_cart", { skuId: "leche-avena" });
  await callTool(page, "next_stand");
  await expect(page.locator("[data-aisle='despensa']")).toBeVisible();
  await expect(page.locator("[data-stand-need='arroz']")).toBeVisible();

  await callTool(page, "add_to_cart", { skuId: "arroz-redondo" });
  await callTool(page, "checkout");
  await expect(page.locator("[data-aisle='entrada']")).toBeVisible();
  await expect(page.locator("[data-ticket]")).toBeVisible();
  await expect(page.getByText("Gracias. Hasta la próxima.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Ticket" }).getByText("Bebida de avena 1 L")).toBeVisible();
});
