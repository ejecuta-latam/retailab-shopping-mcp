import { cartItemCount, formatUsd } from "../../lib/demo/cart";
import type { CartLine, Product, Store } from "../../lib/demo/types";

interface StorePageProps {
  store: Store;
  products: Product[];
  cart: CartLine[];
  onAdd: (skuId: string) => void;
}

export default function StorePage({ store, products, cart, onAdd }: StorePageProps) {
  const count = cartItemCount(cart);

  return (
    <div className="store" data-store={store.id}>
      {store.id === "nilemart" ? <NileChrome store={store} count={count} /> : null}
      {store.id === "widemart" ? <WideChrome store={store} count={count} /> : null}
      {store.id === "darthouse" ? <DartChrome store={store} count={count} /> : null}

      <div className="store__body">
        <div className="store__intro">
          <h3>{headingFor(store.id)}</h3>
          <p>{store.tagline}</p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.skuId} className="product">
              <div
                className="product__tile"
                style={{ background: tileGradient(product.skuId) }}
                aria-hidden="true"
              >
                <span>{initials(product.name)}</span>
              </div>
              {product.badge ? (
                <span className="product__badge">{product.badge}</span>
              ) : null}
              <h4>{product.name}</h4>
              <p className="product__desc">{product.description}</p>
              <p className="product__rating">
                <Stars value={product.rating} />
                <span>{product.rating.toFixed(1)}</span>
                <span className="product__reviews">
                  ({product.reviewCount.toLocaleString("en-US")})
                </span>
              </p>
              <Price cents={product.priceCents} storeId={store.id} />
              <button
                type="button"
                className="product__add"
                onClick={() => onAdd(product.skuId)}
              >
                {store.id === "nilemart"
                  ? "Add to Cart"
                  : store.id === "widemart"
                    ? "Add"
                    : "Add to cart"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function NileChrome({ store, count }: { store: Store; count: number }) {
  return (
    <>
      <header className="store-top">
        <div className="store-top__brand">
          <span className="logo-nile">
            nile<span>mart</span>
          </span>
        </div>
        <label className="store-search">
          <span className="visually-hidden">{store.searchPlaceholder}</span>
          <input readOnly tabIndex={-1} placeholder={store.searchPlaceholder} />
          <span className="store-search__go" aria-hidden="true">
            Go
          </span>
        </label>
        <div className="store-top__meta">
          <span>
            Hello, sign in
            <strong>Account</strong>
          </span>
          <span>
            Returns
            <strong>& Orders</strong>
          </span>
          <span className="store-cart-chip">
            Cart <b>{count}</b>
          </span>
        </div>
      </header>
      <nav className="store-subnav" aria-label="NileMart departments">
        <span>All</span>
        <span>Nile+</span>
        <span>Today’s Deals</span>
        <span>Electronics</span>
        <span>Home</span>
        <span>Fashion</span>
        <span>Books</span>
      </nav>
    </>
  );
}

function WideChrome({ store, count }: { store: Store; count: number }) {
  return (
    <>
      <header className="store-top">
        <div className="store-top__brand">
          <span className="logo-wide" aria-hidden="true">
            ✦
          </span>
          <span className="logo-wide-word">WideMart</span>
        </div>
        <label className="store-search">
          <span className="visually-hidden">{store.searchPlaceholder}</span>
          <input readOnly tabIndex={-1} placeholder={store.searchPlaceholder} />
        </label>
        <div className="store-top__meta">
          <span>
            Reorder
            <strong>My items</strong>
          </span>
          <span>
            Sign in
            <strong>Account</strong>
          </span>
          <span className="store-cart-chip">
            Cart <b>{count}</b>
          </span>
        </div>
      </header>
      <div className="store-fulfillment">
        Pickup or delivery? <strong>Springfield 62704</strong>
      </div>
    </>
  );
}

function DartChrome({ store, count }: { store: Store; count: number }) {
  return (
    <>
      <header className="store-top">
        <div className="store-top__brand">
          <span className="logo-dart" aria-hidden="true">
            <i />
          </span>
          <span className="logo-dart-word">DartHouse</span>
        </div>
        <nav className="store-cats" aria-label="DartHouse categories">
          <span>Categories</span>
          <span>Deals</span>
          <span>New</span>
        </nav>
        <label className="store-search">
          <span className="visually-hidden">{store.searchPlaceholder}</span>
          <input readOnly tabIndex={-1} placeholder={store.searchPlaceholder} />
        </label>
        <div className="store-top__meta">
          <span>
            Bullseye Club
            <strong>Rewards</strong>
          </span>
          <span className="store-cart-chip">
            Cart <b>{count}</b>
          </span>
        </div>
      </header>
    </>
  );
}

function headingFor(id: Store["id"]): string {
  if (id === "nilemart") {
    return "Inspired by your browsing";
  }
  if (id === "widemart") {
    return "Get it in store today";
  }
  return "New this week";
}

function Price({ cents, storeId }: { cents: number; storeId: Store["id"] }) {
  if (storeId === "nilemart") {
    const dollars = Math.floor(cents / 100);
    const remainder = String(cents % 100).padStart(2, "0");
    return (
      <p className="price price--nile">
        <span className="price__sym">$</span>
        <span className="price__dollars">{dollars}</span>
        <span className="price__cents">{remainder}</span>
      </p>
    );
  }
  return <p className="price">{formatUsd(cents)}</p>;
}

function Stars({ value }: { value: number }) {
  const width = `${(value / 5) * 100}%`;
  return (
    <span className="stars" aria-hidden="true">
      <span className="stars__empty">★★★★★</span>
      <span className="stars__fill" style={{ width }}>
        ★★★★★
      </span>
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function tileGradient(skuId: string): string {
  let hash = 0;
  for (const char of skuId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const hue = hash % 360;
  return `linear-gradient(145deg, hsl(${hue} 38% 42%), hsl(${(hue + 28) % 360} 32% 28%))`;
}
