import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { refreshCartUi } from "shopping-mcp";
import { addLine, cartItemCount, cartTotalCents } from "../../lib/demo/cart";
import {
  getProduct,
  getStore,
  productsForStore,
  searchStoreProducts,
  STORES,
} from "../../lib/demo/catalog";
import type { CartLine, StoreId } from "../../lib/demo/types";
import { openCartUi, registerShoppingMcp, type LiveRef } from "../../lib/demo/webmcp";
import LogoMark from "../LogoMark";
import StorePage from "../demo/StorePage";

type PageView = "title" | "home" | "demo" | "docs" | "end";

type ChatLine =
  | { id: number; kind: "user" | "agent"; text: string }
  | { id: number; kind: "tool"; name: string; args: unknown; result: unknown | null };

type Pointer = {
  visible: boolean;
  clicking: boolean;
  teleport: boolean;
  x: number;
  y: number;
};

type TourState = {
  page: PageView;
  storeId: StoreId;
  cart: CartLine[];
  highlightSkuId: string | null;
  hotTab: StoreId | null;
  storeDir: 1 | -1;
  caption: string;
  chat: ChatLine[];
  pointer: Pointer;
};

const INITIAL: TourState = {
  page: "title",
  storeId: "nilemart",
  cart: [],
  highlightSkuId: null,
  hotTab: null,
  storeDir: 1,
  caption: "",
  chat: [],
  pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 },
};

const TOOLS = [
  "list_products",
  "search_products",
  "add_to_cart",
  "get_cart",
  "remove_from_cart",
  "open_ui",
  "list_stores",
  "switch_store",
] as const;

const DOCS_SNIPPET = `import { registerShoppingMcp } from "shopping-mcp";

registerShoppingMcp({
  handlers: {
    listProducts: () => myApi.list(),
    searchProducts: (q) => myApi.search(q),
    addToCart: (sku, qty) => myApi.add(sku, qty),
    getCart: () => myApi.cart(),
  },
});`;

class Aborted extends Error {
  constructor() {
    super("aborted");
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function afterPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

const EASE = [0.22, 1, 0.36, 1] as const;

function sceneTransition(reduce: boolean, duration = 0.62) {
  return {
    duration: reduce ? 0.01 : duration,
    ease: EASE,
  };
}

const STORE_ORDER: StoreId[] = ["nilemart", "widemart", "darthouse"];

function dirForStore(from: StoreId, to: StoreId): 1 | -1 {
  return STORE_ORDER.indexOf(to) >= STORE_ORDER.indexOf(from) ? 1 : -1;
}

export default function Walkthrough() {
  const reduceMotion = useReducedMotion() ?? false;
  const scene = sceneTransition(reduceMotion);
  const storeScene = sceneTransition(reduceMotion, 0.52);
  const coverScene = sceneTransition(reduceMotion, 0.72);
  const captionScene = sceneTransition(reduceMotion, 0.35);
  const [state, setState] = useState<TourState>(INITIAL);
  const [hud, setHud] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return new URLSearchParams(window.location.search).get("record") !== "1";
  });
  const siteRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const liveRef = useRef<LiveRef | null>(null);
  const cartRef = useRef<CartLine[]>([]);
  const storeRef = useRef<StoreId>("nilemart");

  cartRef.current = state.cart;
  storeRef.current = state.storeId;
  liveRef.current = {
    state: { storeId: storeRef.current, cart: cartRef.current },
    mutators: {
      setCart: (cart) => {
        cartRef.current = cart;
        patch({ cart });
      },
      setStoreId: (storeId) => {
        storeRef.current = storeId;
        patch({ storeId });
      },
    },
  };

  function patch(next: Partial<TourState> | ((prev: TourState) => Partial<TourState>)) {
    setState((prev) => {
      const slice = typeof next === "function" ? next(prev) : next;
      return { ...prev, ...slice };
    });
  }

  async function play() {
    const run = ++runRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const beat = (ms: number) => (reduce ? Math.min(ms, 420) : ms);

    const alive = () => runRef.current === run;
    const pause = async (ms: number) => {
      await wait(beat(ms));
      if (!alive()) {
        throw new Aborted();
      }
    };
    const apply = (next: Partial<TourState> | ((prev: TourState) => Partial<TourState>)) => {
      if (!alive()) {
        throw new Aborted();
      }
      patch(next);
    };
    const push = (line: ChatLine) => {
      apply((prev) => ({ chat: [...prev.chat, line] }));
    };
    let bag: CartLine[] = [];
    const sceneWait = async (ms = 720) => {
      await pause(reduce ? 90 : ms);
    };
    const goPage = async (page: PageView, extra?: Partial<TourState>) => {
      apply({ page, ...extra });
      await sceneWait();
    };
    const goStore = async (nextStore: StoreId, extra?: Partial<TourState>) => {
      apply((prev) => ({
        storeId: nextStore,
        storeDir: dirForStore(prev.storeId, nextStore),
        hotTab: null,
        ...extra,
      }));
      await sceneWait(600);
    };
    const commitCart = async (next: CartLine[]) => {
      bag = next;
      cartRef.current = next;
      apply({ cart: next });
      await afterPaint();
      await openCartUi();
      await refreshCartUi();
    };

    try {
      cartRef.current = [];
      storeRef.current = "nilemart";
      setState(INITIAL);
      await pause(800);

      apply({ caption: "A WebMCP tool profile for retail." });
      await pause(2400);

      await goPage("home", {
        caption: "Landing — people and agents share the same shopping tools.",
      });
      push({
        id: 1,
        kind: "user",
        text: "Grab wireless earbuds, milk, and a candle — one trip, three shops.",
      });
      await pause(1600);
      push({
        id: 2,
        kind: "agent",
        text: "This page registered shopping tools. I'll shop with you — you still choose.",
      });
      await pause(2400);
      await afterPaint();
      await pointTo(siteRef.current, apply, pause, reduce, '[data-walk="view-demo"]');
      await pause(400);

      await goPage("demo", {
        storeId: "nilemart",
        pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 },
        caption: "Demo — tools are scoped to the open storefront. Shared cart island is on this page.",
      });
      push({
        id: 3,
        kind: "agent",
        text: "Same tools on every store. I'll start with list_products on NileMart.",
      });
      await pause(900);
      await afterPaint();

      await showTool(apply, push, pause, {
        id: 4,
        name: "list_products",
        args: {},
        result: {
          storeId: "nilemart",
          products: productsForStore("nilemart").map((item) => ({
            skuId: item.skuId,
            name: item.name,
          })),
        },
      });

      push({
        id: 5,
        kind: "agent",
        text: "Six SKUs on this page. Searching wireless…",
      });
      await showTool(apply, push, pause, {
        id: 6,
        name: "search_products",
        args: { query: "wireless" },
        result: {
          storeId: "nilemart",
          products: searchStoreProducts("nilemart", "wireless").map((item) => ({
            skuId: item.skuId,
            name: item.name,
          })),
        },
      });
      apply({
        highlightSkuId: "nm-nilebuds",
        caption: "NileBuds are on this page — the agent cannot add a foreign SKU.",
      });
      await pause(120);
      await afterPaint();
      scrollControlIntoView(siteRef.current, '[data-sku="nm-nilebuds"] .product__add');
      await pause(reduce ? 80 : 420);
      await pointTo(siteRef.current, apply, pause, reduce, '[data-sku="nm-nilebuds"] .product__add');

      const buds = getProduct("nm-nilebuds");
      if (buds) {
        await commitCart(addLine(bag, buds, 1));
      }
      await showTool(apply, push, pause, {
        id: 7,
        name: "add_to_cart",
        args: { skuId: "nm-nilebuds" },
        result: { ok: true, message: "Added NileBuds Wireless Pro" },
      });
      await pointTo(siteRef.current, apply, pause, reduce, ".store-cart-chip");
      apply({
        pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 },
        caption: "Island updated. Switching stores will not wipe this line.",
      });
      push({
        id: 8,
        kind: "agent",
        text: "NileBuds are in. Milk is not sold on NileMart — I'll switch_store first.",
      });
      await pause(2200);

      apply({ hotTab: "widemart", caption: "Milk is on WideMart — switch the page first." });
      await afterPaint();
      await pointTo(siteRef.current, apply, pause, reduce, '[data-walk="store-widemart"]');
      await showTool(apply, push, pause, {
        id: 9,
        name: "switch_store",
        args: { storeId: "widemart" },
        result: { ok: true, storeId: "widemart", hostname: "widemart.shop" },
      });
      await goStore("widemart", {
        highlightSkuId: null,
        pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 },
        caption: "WideMart chrome. NileMart line is still in the island.",
      });
      await pause(900);

      await showTool(apply, push, pause, {
        id: 10,
        name: "search_products",
        args: { query: "milk" },
        result: {
          storeId: "widemart",
          products: searchStoreProducts("widemart", "milk").map((item) => ({
            skuId: item.skuId,
            name: item.name,
          })),
        },
      });
      apply({ highlightSkuId: "wm-milk" });
      await pause(120);
      await afterPaint();
      scrollControlIntoView(siteRef.current, '[data-sku="wm-milk"] .product__add');
      await pause(reduce ? 80 : 420);
      await pointTo(siteRef.current, apply, pause, reduce, '[data-sku="wm-milk"] .product__add');
      const milk = getProduct("wm-milk");
      if (milk) {
        await commitCart(addLine(bag, milk, 1));
      }
      await showTool(apply, push, pause, {
        id: 11,
        name: "add_to_cart",
        args: { skuId: "wm-milk" },
        result: { ok: true, message: "Added FairChoice 2% Milk 1gal" },
      });
      await pointTo(siteRef.current, apply, pause, reduce, ".store-cart-chip");
      apply({
        pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 },
        caption: "Two stores in one island.",
      });
      push({
        id: 12,
        kind: "agent",
        text: "Milk is in. One more shop — DartHouse for a candle.",
      });
      await pause(1800);

      apply({ hotTab: "darthouse", caption: "One more shop — DartHouse." });
      await afterPaint();
      await pointTo(siteRef.current, apply, pause, reduce, '[data-walk="store-darthouse"]');
      await showTool(apply, push, pause, {
        id: 13,
        name: "switch_store",
        args: { storeId: "darthouse" },
        result: { ok: true, storeId: "darthouse", hostname: "darthouse.shop" },
      });
      await goStore("darthouse", {
        highlightSkuId: "dh-candle",
        pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 },
        caption: "DartHouse. Prior lines stay in the island.",
      });
      await pause(120);
      await afterPaint();
      scrollControlIntoView(siteRef.current, '[data-sku="dh-candle"] .product__add');
      await pause(reduce ? 80 : 420);
      await pointTo(siteRef.current, apply, pause, reduce, '[data-sku="dh-candle"] .product__add');
      const candle = getProduct("dh-candle");
      if (candle) {
        await commitCart(addLine(bag, candle, 1));
      }
      await showTool(apply, push, pause, {
        id: 14,
        name: "add_to_cart",
        args: { skuId: "dh-candle" },
        result: { ok: true, message: "Added Orchard Soy Candle" },
      });
      apply({ pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 } });

      await showTool(apply, push, pause, {
        id: 15,
        name: "get_cart",
        args: {},
        result: {
          itemCount: cartItemCount(bag),
          totalCents: cartTotalCents(bag),
          items: bag.map((line) => ({
            skuId: line.skuId,
            storeId: line.storeId,
            name: line.name,
            quantity: line.quantity,
          })),
        },
      });
      await showTool(apply, push, pause, {
        id: 16,
        name: "open_ui",
        args: {},
        result: { ok: true, message: "Opened shared cart island" },
      });
      await openCartUi();
      apply({
        highlightSkuId: null,
        caption: "People and agents share this island. Checkout stays per origin.",
      });
      await afterPaint();
      await pointTo(siteRef.current, apply, pause, reduce, "[data-shopping-mcp-cart]");
      push({
        id: 17,
        kind: "agent",
        text: "Three shops, one cart. Stores ship this as a library — not a scraper.",
      });
      await pause(3600);

      await goPage("docs", {
        highlightSkuId: null,
        pointer: { visible: false, clicking: false, teleport: true, x: 0, y: 0 },
        caption: "Install the same profile on a real storefront.",
      });
      await pause(4200);

      await goPage("end", { caption: "" });
      await pause(7000);
    } catch (error) {
      if (!(error instanceof Aborted)) {
        throw error;
      }
    }
  }

  useEffect(() => {
    void play();
    return () => {
      runRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (state.page !== "demo") {
      return;
    }
    let stop: (() => void) | undefined;
    let cancelled = false;
    const mount = () => {
      if (cancelled) {
        return;
      }
      const root = document.querySelector(".walk .demo-browser");
      if (!root) {
        window.requestAnimationFrame(mount);
        return;
      }
      stop = registerShoppingMcp(liveRef, { startOpen: true });
      void openCartUi();
    };
    mount();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [state.page]);

  useEffect(() => {
    const node = logRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [state.chat]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        void play();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const store = getStore(state.storeId);
  const products = productsForStore(state.storeId);
  const url =
    state.page === "docs"
      ? "https://shopping.ejecuta.lat/docs"
      : state.page === "home"
        ? "https://shopping.ejecuta.lat/"
        : "https://shopping.ejecuta.lat/demo";

  return (
    <div className="walk">
      {hud ? (
        <div className="walk__hud">
          <button type="button" onClick={() => void play()}>
            Replay
          </button>
          <button type="button" onClick={() => setHud(false)}>
            Hide chrome
          </button>
        </div>
      ) : null}
      <div className={state.page === "title" ? "walk__frame is-intro" : "walk__frame"}>
        <AnimatePresence>
          {state.page === "title" ? (
            <motion.div
              key="title"
              className="walk-cover"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={coverScene}
            >
              <div>
                <LogoMark className="mark" />
                <p className="walk-cover__kicker">retailab</p>
                <h1>shopping-mcp</h1>
                <p>Same tools. Every store. One cart.</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {state.page === "end" ? (
            <motion.div
              key="end"
              className="walk-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={coverScene}
            >
              <div>
                <p className="walk-cover__kicker">Live demo</p>
                <h2>shopping.ejecuta.lat/demo</h2>
                <p>
                  Open in ChatGPT’s in-app browser or Chrome with WebMCP testing.{" "}
                  <a href="https://shopping.ejecuta.lat/demo">Try it live</a>
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="walk__site">
          <div className="walk__url">
            <span className="walk__url-lock">HTTPS</span>
            <span>{url}</span>
          </div>
          <div className="walk__site-body" ref={siteRef}>
            <AnimatePresence>
              {state.page === "home" ? (
                <motion.div
                  key="home"
                  className="walk-scene"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={scene}
                >
                  <HomePane />
                </motion.div>
              ) : null}
              {state.page === "demo" ? (
                <motion.div
                  key="demo"
                  className="walk-scene demo demo--page"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={scene}
                >
                <div className="demo__intro">
                  <p className="demo__kicker">Agent showcase</p>
                  <h1>Same tools. Every store. One cart.</h1>
                  <ul className="demo__tools" aria-label="Tools registered on this page">
                    {TOOLS.map((name) => (
                      <li key={name}>
                        <code>{name}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="demo__stage">
                  <div className="demo-browser">
                    <div className="demo-browser__chrome">
                      <span className="demo-browser__dots" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <div className="demo-browser__tabs" role="tablist" aria-label="Demo stores">
                        {STORES.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            role="tab"
                            data-walk={`store-${item.id}`}
                            aria-selected={item.id === state.storeId}
                            className={[
                              item.id === state.storeId ? "is-active" : "",
                              item.id === state.hotTab ? "is-tour-hot" : "",
                            ]
                              .filter(Boolean)
                              .join(" ") || undefined}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="demo-browser__url">
                      <span className="demo-browser__lock" aria-hidden="true">
                        HTTPS
                      </span>
                      <span>https://{store.hostname}</span>
                    </div>
                    <div className="demo-browser__page">
                      <div className="walk-store-stage">
                        <AnimatePresence initial={false}>
                          <motion.div
                            key={state.storeId}
                            className="walk-store-pane"
                            initial={{ opacity: 0, x: 28 * state.storeDir }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -28 * state.storeDir }}
                            transition={storeScene}
                          >
                            <StorePage
                              store={store}
                              products={products}
                              cart={state.cart}
                              highlightSkuId={state.highlightSkuId}
                              onAdd={() => undefined}
                              onOpenCart={() => undefined}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
                </motion.div>
              ) : null}
              {state.page === "docs" || state.page === "end" ? (
                <motion.div
                  key="docs"
                  className="walk-scene"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={scene}
                >
                  <div className="walk__docs">
                    <h2>Install shopping-mcp</h2>
                    <p>Every store exposes the same WebMCP shopping tools. Agents stop scraping the DOM.</p>
                    <pre>
                      <code>npm install shopping-mcp</code>
                    </pre>
                    <pre>
                      <code>{DOCS_SNIPPET}</code>
                    </pre>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <AnimatePresence>
              {state.caption && state.page !== "title" && state.page !== "end" ? (
                <motion.p
                  key={state.caption}
                  className="walk__caption"
                  aria-live="polite"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={captionScene}
                >
                  {state.caption}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <aside className="walk__agent">
          <div className="walk__agent-head">
            <strong>Agent</strong>
            <span className="walk__chip">WebMCP</span>
          </div>
          <div className="walk__log" ref={logRef}>
            {state.chat.map((line) =>
              line.kind === "tool" ? (
                <div className="walk-tool" key={line.id}>
                  <header>
                    <span>{line.name}</span>
                    <span>{line.result ? "ok" : "…"}</span>
                  </header>
                  <pre>{JSON.stringify(line.args, null, 2)}</pre>
                  {line.result ? (
                    <pre className="result">{JSON.stringify(line.result, null, 2)}</pre>
                  ) : null}
                </div>
              ) : (
                <p key={line.id} className={`walk-msg walk-msg--${line.kind}`}>
                  {line.text}
                </p>
              ),
            )}
          </div>
        </aside>
      </div>
      <div
        className={[
          "walk-pointer",
          state.pointer.clicking ? "is-click" : "",
          state.pointer.teleport ? "is-teleport" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          left: `${state.pointer.x}px`,
          top: `${state.pointer.y}px`,
          opacity: state.pointer.visible ? 1 : 0,
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32">
          <path
            d="M4 3v22l6.2-6.1 3.6 8.6 3.2-1.4-3.6-8.5H24L4 3z"
            fill="#10242c"
            stroke="#ffffff"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function HomePane() {
  return (
    <div className="walk__home">
      <header className="nav" style={{ position: "relative" }}>
        <div className="nav__inner" style={{ padding: "0.75rem 0" }}>
          <span className="nav__brand">
            <LogoMark />
            <span className="nav__brand-text">
              <span className="nav__company">retailab</span>
              <span className="nav__product">shopping-mcp</span>
            </span>
          </span>
          <nav className="nav__links" aria-label="Tour">
            <span className="nav__link">Home</span>
            <span className="nav__link">Docs</span>
            <span className="nav__link">Demo</span>
          </nav>
        </div>
      </header>
      <section className="banner" aria-labelledby="walk-banner">
        <div className="banner__content">
          <p className="banner__kicker">WebMCP for retail</p>
          <h1 id="walk-banner" className="banner__brand">
            shopping-mcp
          </h1>
          <p className="banner__support">
            A shared tool profile so agents shop the same way on every store.
          </p>
          <div className="banner__actions">
            <span className="banner__cta banner__cta--primary">Get started</span>
            <span className="banner__cta banner__cta--ghost" data-walk="view-demo">
              View demo
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

async function pointTo(
  pane: HTMLDivElement | null,
  apply: (next: Partial<TourState>) => void,
  pause: (ms: number) => Promise<void>,
  reduce: boolean,
  selector: string,
) {
  await afterPaint();
  const target = pane?.querySelector(selector);
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const hit = target.getBoundingClientRect();
  if (hit.width < 2 || hit.height < 2) {
    return;
  }
  const x = hit.left + hit.width * 0.5 - 5;
  const y = hit.top + hit.height * 0.5 - 3;
  apply({ pointer: { visible: true, clicking: false, teleport: true, x, y } });
  await afterPaint();
  apply({ pointer: { visible: true, clicking: false, teleport: false, x, y } });
  await pause(reduce ? 160 : 520);
  apply({ pointer: { visible: true, clicking: true, teleport: false, x, y } });
  target.classList.add("walk-hit");
  window.setTimeout(() => target.classList.remove("walk-hit"), 650);
  await pause(180);
  apply({ pointer: { visible: true, clicking: false, teleport: false, x, y } });
}

function scrollControlIntoView(pane: HTMLDivElement | null, selector: string) {
  const target = pane?.querySelector(selector);
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const scroller = target.closest(".demo-browser__page");
  if (!(scroller instanceof HTMLElement)) {
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
    return;
  }
  const hit = target.getBoundingClientRect();
  const box = scroller.getBoundingClientRect();
  const pad = 28;
  let delta = 0;
  if (hit.bottom > box.bottom - pad) {
    delta = hit.bottom - (box.bottom - pad);
  }
  if (hit.top < box.top + pad) {
    delta = hit.top - (box.top + pad);
  }
  if (delta !== 0) {
    scroller.scrollTop += delta;
  }
}

async function showTool(
  apply: (next: Partial<TourState> | ((prev: TourState) => Partial<TourState>)) => void,
  push: (line: ChatLine) => void,
  pause: (ms: number) => Promise<void>,
  call: { id: number; name: string; args: unknown; result: unknown },
) {
  push({
    id: call.id,
    kind: "tool",
    name: call.name,
    args: call.args,
    result: null,
  });
  await pause(700);
  apply((prev) => ({
    chat: prev.chat.map((line) =>
      line.id === call.id && line.kind === "tool" ? { ...line, result: call.result } : line,
    ),
  }));
  await pause(1100);
}
