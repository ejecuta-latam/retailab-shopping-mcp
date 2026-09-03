import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { runAgentTurn } from "../../lib/demo/agent";
import {
  loadCart,
  saveCart,
  setLineQuantity,
  removeLine,
} from "../../lib/demo/cart";
import { getStore, productsForStore, STORES } from "../../lib/demo/catalog";
import { addToCart } from "../../lib/demo/tools";
import type { LiveRef } from "../../lib/demo/webmcp";
import { registerShoppingMcp } from "../../lib/demo/webmcp";
import type { AgentLogEntry, CartLine, StoreId } from "../../lib/demo/types";
import AgentPanel from "./AgentPanel";
import SharedCart from "./SharedCart";
import StorePage from "./StorePage";

export default function DemoShowcase() {
  const [storeId, setStoreId] = useState<StoreId>("nilemart");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [log, setLog] = useState<AgentLogEntry[]>([]);
  const liveRef = useRef<LiveRef | null>(null);

  liveRef.current = {
    state: { storeId, cart },
    mutators: { setCart },
  };

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveCart(cart);
    }
  }, [cart, hydrated]);

  useEffect(() => {
    return registerShoppingMcp(liveRef);
  }, []);

  const store = getStore(storeId);
  const products = productsForStore(storeId);

  function handleAdd(skuId: string) {
    addToCart({ storeId, cart }, { setCart }, skuId, 1);
  }

  function handlePrompt(prompt: string) {
    const turn = runAgentTurn(prompt, { storeId, cart }, { setCart });
    setLog((prev) => [...prev, ...turn.entries]);
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

  return (
    <section className="demo" id="demo" aria-labelledby="demo-heading">
      <div className="demo__intro">
        <p className="demo__kicker">Live showcase</p>
        <h2 id="demo-heading">Same tools. Every store. One cart.</h2>
        <p className="demo__support">
          An agent reads the current storefront through the shopping-mcp profile,
          then drops items into a shared cart. Switch pages — NileMart, WideMart,
          DartHouse — and the basket stays put.
        </p>
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
            />
          </div>
        </div>

        <aside className="demo__side">
          <SharedCart
            cart={cart}
            onQuantity={(skuId, quantity) =>
              setCart((prev) => setLineQuantity(prev, skuId, quantity))
            }
            onRemove={(skuId) => setCart((prev) => removeLine(prev, skuId))}
          />
          <AgentPanel
            storeId={storeId}
            storeName={store.name}
            log={log}
            onPrompt={handlePrompt}
          />
        </aside>
      </div>
    </section>
  );
}
