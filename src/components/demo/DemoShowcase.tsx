import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { loadCart, saveCart } from "../../lib/demo/cart";
import { getStore, productsForStore, STORES } from "../../lib/demo/catalog";
import { addToCart } from "../../lib/demo/tools";
import type { LiveRef } from "../../lib/demo/webmcp";
import { openCartUi, registerShoppingMcp } from "../../lib/demo/webmcp";
import { refreshCartUi } from "shopping-mcp";
import type { CartLine, StoreId } from "../../lib/demo/types";
import StorePage from "./StorePage";

const REGISTERED_TOOLS = [
  "list_products",
  "search_products",
  "add_to_cart",
  "get_cart",
  "remove_from_cart",
  "open_ui",
  "list_stores",
  "switch_store",
] as const;

const TEASER_PRODUCTS = 3;

type DemoShowcaseProps = {
  fullPage?: boolean;
};

export default function DemoShowcase({ fullPage = false }: DemoShowcaseProps) {
  const [storeId, setStoreId] = useState<StoreId>("nilemart");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const liveRef = useRef<LiveRef | null>(null);

  liveRef.current = {
    state: { storeId, cart },
    mutators: { setCart, setStoreId },
  };

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveCart(cart);
      void refreshCartUi();
    }
  }, [cart, hydrated]);

  useEffect(() => {
    return registerShoppingMcp(liveRef, { startOpen: fullPage });
  }, [fullPage]);

  const store = getStore(storeId);
  const catalog = productsForStore(storeId);
  const products = fullPage ? catalog : catalog.slice(0, TEASER_PRODUCTS);

  function handleAdd(skuId: string) {
    addToCart({ storeId, cart }, { setCart, setStoreId }, skuId, 1);
  }

  function handleTabsKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = STORES.findIndex((item) => item.id === storeId);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = STORES[(index + delta + STORES.length) % STORES.length];
      setStoreId(next.id);
    }
  }

  const Heading = fullPage ? "h1" : "h2";

  return (
    <section
      className={fullPage ? "demo demo--page" : "demo demo--teaser"}
      id="demo"
      aria-labelledby="demo-heading"
    >
      <div className="demo__intro">
        <p className="demo__kicker">{fullPage ? "Agent showcase" : "Peek"}</p>
        <Heading id="demo-heading">Same tools. Every store. One cart.</Heading>
        {fullPage ? (
          <p className="demo__support">
            An agent reads the current storefront, can switch pages with{" "}
            <code>switch_store</code>, and can open the shared cart island with{" "}
            <code>open_ui</code>.
          </p>
        ) : (
          <p className="demo__support">
            Switch shops, add something, and the cart stays with you.{" "}
            <a className="demo__more" href="/demo">
              Open the full demo
            </a>
          </p>
        )}
        {fullPage ? (
          <ul className="demo__tools" aria-label="Tools registered on this page">
            {REGISTERED_TOOLS.map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="demo__stage">
        <div className="demo-browser">
          <div className="demo-browser__chrome">
            <span className="demo-browser__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <div
              className="demo-browser__tabs"
              role="tablist"
              aria-label="Demo stores"
              onKeyDown={handleTabsKey}
            >
              {STORES.map((item) => {
                const selected = item.id === storeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`store-tab-${item.id}`}
                    aria-selected={selected}
                    aria-controls="store-panel"
                    tabIndex={selected ? 0 : -1}
                    className={selected ? "is-active" : undefined}
                    onClick={() => setStoreId(item.id)}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="demo-browser__url">
            <span className="demo-browser__lock" aria-hidden="true">
              HTTPS
            </span>
            <span>https://{store.hostname}</span>
          </div>
          <div
            className="demo-browser__page"
            id="store-panel"
            role="tabpanel"
            aria-labelledby={`store-tab-${storeId}`}
          >
            <StorePage
              store={store}
              products={products}
              cart={cart}
              onAdd={handleAdd}
              onOpenCart={() => {
                void openCartUi();
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
