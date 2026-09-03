import type { ShoppingMcpHandlers, ShoppingMcpUiOptions, ToolResult } from "./types";

const HOST_ATTR = "data-shopping-mcp-cart";

export interface CartUi {
  open: () => Promise<ToolResult>;
  close: () => void;
  refresh: () => Promise<void>;
  destroy: () => void;
  isOpen: () => boolean;
}

interface UiLine {
  skuId: string;
  name: string;
  priceCents: number;
  quantity: number;
  storeName: string | null;
  storeKey: string | null;
}

export function createCartUi(
  handlers: ShoppingMcpHandlers,
  options: ShoppingMcpUiOptions,
): CartUi | null {
  if (typeof document === "undefined") {
    return null;
  }

  const parent = resolveRoot(options.root);
  if (!parent) {
    return null;
  }

  parent.querySelectorAll(`[${HOST_ATTR}]`).forEach((node) => node.remove());

  const host = document.createElement("div");
  host.setAttribute(HOST_ATTR, "host");
  placeHost(host, parent);

  const shadow = host.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = ISLAND_CSS;
  shadow.append(style);

  const panel = document.createElement("section");
  panel.className = "island";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "shopping-mcp-cart-title");
  panel.hidden = true;
  shadow.append(panel);

  let open = false;

  function onKey(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      api.close();
    }
  }

  document.addEventListener("keydown", onKey);

  const api: CartUi = {
    async open() {
      panel.hidden = false;
      open = true;
      await render();
      const snapshot = readCartMeta(panel);
      return {
        ok: true,
        message: "Shared cart is open",
        data: snapshot,
      };
    },
    close() {
      panel.hidden = true;
      open = false;
    },
    async refresh() {
      if (open) {
        await render();
      }
    },
    destroy() {
      document.removeEventListener("keydown", onKey);
      host.remove();
      open = false;
    },
    isOpen() {
      return open;
    },
  };

  async function render(): Promise<void> {
    let result: ToolResult;
    try {
      result = await handlers.getCart();
    } catch {
      result = { ok: false, message: "Tool failed" };
    }
    const cart = parseCart(result.data);
    panel.replaceChildren(buildPanel(cart, options.title ?? "Shared cart", api, handlers, render));
    panel.hidden = !open;
  }

  return api;
}

function buildPanel(
  cart: { items: UiLine[]; totalCents: number; itemCount: number },
  title: string,
  api: CartUi,
  handlers: ShoppingMcpHandlers,
  render: () => Promise<void>,
): DocumentFragment {
  const frag = document.createDocumentFragment();

  const head = document.createElement("header");
  head.className = "head";

  const titles = document.createElement("div");
  const h3 = document.createElement("h3");
  h3.id = "shopping-mcp-cart-title";
  h3.textContent = title;
  const sub = document.createElement("p");
  sub.textContent = "Items and total on this trip.";
  titles.append(h3, sub);

  const count = document.createElement("span");
  count.className = "count";
  count.textContent = String(cart.itemCount);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "close";
  close.setAttribute("aria-label", "Close shared cart");
  close.textContent = "×";
  close.addEventListener("click", () => api.close());

  head.append(titles, count, close);
  frag.append(head);

  if (cart.items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Cart is empty.";
    frag.append(empty);
  } else {
    const list = document.createElement("ul");
    list.className = "list";
    for (const line of cart.items) {
      list.append(buildLine(line, handlers, render));
    }
    frag.append(list);
  }

  const foot = document.createElement("footer");
  foot.className = "foot";
  const label = document.createElement("span");
  label.textContent = "Subtotal";
  const total = document.createElement("strong");
  total.dataset.totalCents = String(cart.totalCents);
  total.dataset.itemCount = String(cart.itemCount);
  total.textContent = formatUsd(cart.totalCents);
  foot.append(label, total);
  frag.append(foot);

  return frag;
}

function buildLine(
  line: UiLine,
  handlers: ShoppingMcpHandlers,
  render: () => Promise<void>,
): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "line";

  const main = document.createElement("div");
  const name = document.createElement("p");
  name.className = "name";
  name.textContent = line.name;
  main.append(name);
  if (line.storeName) {
    const pill = document.createElement("span");
    pill.className = line.storeKey ? `pill pill--${line.storeKey}` : "pill";
    pill.textContent = line.storeName;
    main.append(pill);
  }

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatUsd(line.priceCents * line.quantity);

  const qty = document.createElement("div");
  qty.className = "qty";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.setAttribute("aria-label", `Decrease ${line.name}`);
  minus.textContent = "−";
  minus.addEventListener("click", () => {
    void changeQty(line, line.quantity - 1, handlers, render);
  });

  const amount = document.createElement("span");
  amount.textContent = String(line.quantity);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.setAttribute("aria-label", `Increase ${line.name}`);
  plus.textContent = "+";
  plus.addEventListener("click", () => {
    void runThenRender(() => handlers.addToCart(line.skuId, 1), render);
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    void runThenRender(() => handlers.removeFromCart(line.skuId), render);
  });

  qty.append(minus, amount, plus, remove);
  item.append(main, price, qty);
  return item;
}

async function changeQty(
  line: UiLine,
  next: number,
  handlers: ShoppingMcpHandlers,
  render: () => Promise<void>,
): Promise<void> {
  if (next < 1) {
    await runThenRender(() => handlers.removeFromCart(line.skuId), render);
    return;
  }
  if (handlers.setQuantity) {
    await runThenRender(() => handlers.setQuantity!(line.skuId, next), render);
    return;
  }
  if (next < line.quantity) {
    await runThenRender(() => handlers.removeFromCart(line.skuId), render);
    if (next >= 1) {
      await runThenRender(() => handlers.addToCart(line.skuId, next), render);
    }
  }
}

async function runThenRender(
  run: () => ToolResult | Promise<ToolResult>,
  render: () => Promise<void>,
): Promise<void> {
  try {
    await run();
  } catch {
    // Island stays; next refresh shows truth.
  }
  await render();
}

function parseCart(data: unknown): { items: UiLine[]; totalCents: number; itemCount: number } {
  if (typeof data !== "object" || data === null) {
    return { items: [], totalCents: 0, itemCount: 0 };
  }
  const record = data as Record<string, unknown>;
  const rawItems = Array.isArray(record.items) ? record.items : [];
  const items: UiLine[] = [];
  for (const raw of rawItems) {
    const line = parseLine(raw);
    if (line) {
      items.push(line);
    }
  }
  const totalCents =
    typeof record.totalCents === "number"
      ? record.totalCents
      : items.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
  const itemCount =
    typeof record.itemCount === "number"
      ? record.itemCount
      : items.reduce((sum, line) => sum + line.quantity, 0);
  return { items, totalCents, itemCount };
}

function parseLine(raw: unknown): UiLine | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const line = raw as Record<string, unknown>;
  if (
    typeof line.skuId !== "string" ||
    typeof line.name !== "string" ||
    typeof line.priceCents !== "number" ||
    typeof line.quantity !== "number"
  ) {
    return null;
  }
  const storeKey = storeTone(line);
  const storeName =
    typeof line.storeName === "string"
      ? line.storeName
      : storeKey
        ? labelForStore(storeKey)
        : typeof line.storeId === "string"
          ? line.storeId
          : null;
  return {
    skuId: line.skuId,
    name: line.name,
    priceCents: line.priceCents,
    quantity: line.quantity,
    storeName,
    storeKey,
  };
}

function storeTone(line: Record<string, unknown>): string | null {
  const id = typeof line.storeId === "string" ? line.storeId.toLowerCase() : "";
  const name = typeof line.storeName === "string" ? line.storeName.toLowerCase() : "";
  const hay = `${id} ${name}`;
  if (hay.includes("nile")) {
    return "nilemart";
  }
  if (hay.includes("wide")) {
    return "widemart";
  }
  if (hay.includes("dart")) {
    return "darthouse";
  }
  return id && /^[a-z0-9-]+$/.test(id) ? id : null;
}

function labelForStore(storeKey: string): string {
  if (storeKey === "nilemart") {
    return "NileMart";
  }
  if (storeKey === "widemart") {
    return "WideMart";
  }
  if (storeKey === "darthouse") {
    return "DartHouse";
  }
  return storeKey;
}

function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function resolveRoot(root: ShoppingMcpUiOptions["root"]): ParentNode | null {
  if (typeof root === "function") {
    return root() ?? document.body;
  }
  return root ?? document.body;
}

function placeHost(host: HTMLElement, parent: ParentNode): void {
  const isBody = parent === document.body || parent === document.documentElement;
  host.style.zIndex = "40";
  host.style.width = "min(20rem, calc(100% - 1.5rem))";
  host.style.right = "0.75rem";
  host.style.bottom = "0.75rem";
  if (isBody) {
    host.style.position = "fixed";
  } else if (parent instanceof HTMLElement) {
    const current = getComputedStyle(parent).position;
    if (current === "static") {
      parent.style.position = "relative";
    }
    host.style.position = "absolute";
  } else {
    host.style.position = "fixed";
  }
  parent.appendChild(host);
}

function readCartMeta(panel: HTMLElement): { itemCount: number; totalCents: number } {
  const total = panel.querySelector(".foot strong");
  return {
    itemCount: Number(total instanceof HTMLElement ? total.dataset.itemCount : 0) || 0,
    totalCents: Number(total instanceof HTMLElement ? total.dataset.totalCents : 0) || 0,
  };
}

const ISLAND_CSS = `
:host { font-family: ui-sans-serif, system-ui, sans-serif; color: #10242c; }
.island {
  background: #fff;
  border: 1px solid #d5dde0;
  border-radius: 0.7rem;
  box-shadow: 0 16px 40px rgba(16, 36, 44, 0.16);
  padding: 0.9rem 0.95rem 0.85rem;
}
.head { display: flex; align-items: flex-start; gap: 0.5rem; }
.head h3 { margin: 0; font-size: 0.92rem; letter-spacing: -0.03em; }
.head p { margin: 0.15rem 0 0; color: #5c6b73; font-size: 0.75rem; }
.count {
  margin-left: auto;
  display: grid;
  place-items: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: #0f766e;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
}
.close {
  appearance: none;
  border: 0;
  background: transparent;
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
  color: #5c6b73;
}
.empty { margin: 0.85rem 0; color: #5c6b73; font-size: 0.85rem; }
.list { list-style: none; margin: 0.75rem 0 0.35rem; padding: 0; display: flex; flex-direction: column; gap: 0.7rem; max-height: 14rem; overflow: auto; }
.name { margin: 0; font-size: 0.82rem; font-weight: 600; }
.pill {
  display: inline-block;
  margin-top: 0.2rem;
  padding: 0.08rem 0.4rem;
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 700;
  background: #10242c;
  color: #fff;
}
.pill--nilemart { background: #131921; color: #ffb84d; }
.pill--widemart { background: #0071dc; color: #fff; }
.pill--darthouse { background: #cc0000; color: #fff; }
.price { margin: 0.2rem 0 0; font-size: 0.8rem; }
.qty { display: flex; align-items: center; gap: 0.35rem; margin-top: 0.3rem; }
.qty button {
  appearance: none;
  border: 1px solid #d5dde0;
  background: #fff;
  min-width: 1.45rem;
  height: 1.45rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
.remove { margin-left: auto; border: 0 !important; background: transparent !important; color: #5c6b73; font-size: 0.72rem; min-width: auto !important; height: auto !important; }
.foot {
  display: flex;
  justify-content: space-between;
  padding-top: 0.65rem;
  border-top: 1px solid #d5dde0;
  font-size: 0.88rem;
}
`;
