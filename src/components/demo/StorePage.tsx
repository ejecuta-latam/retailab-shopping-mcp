import { cartItemCount, formatUsd } from "../../lib/demo/cart";
import type { CartLine, Product, Store } from "../../lib/demo/types";

interface StorePageProps {
  store: Store;
  products: Product[];
  cart: CartLine[];
  onAdd: (skuId: string) => void;
  onOpenCart: () => void;
  highlightSkuId?: string | null;
}

export default function StorePage({
  store,
  products,
  cart,
  onAdd,
  onOpenCart,
  highlightSkuId = null,
}: StorePageProps) {
  const count = cartItemCount(cart);

  return (
    <div className="store" data-store={store.id}>
      {store.id === "nilemart" ? (
        <NileChrome store={store} count={count} onOpenCart={onOpenCart} />
      ) : null}
      {store.id === "widemart" ? (
        <WideChrome store={store} count={count} onOpenCart={onOpenCart} />
      ) : null}
      {store.id === "darthouse" ? (
        <DartChrome store={store} count={count} onOpenCart={onOpenCart} />
      ) : null}

      <div className="store__body">
        <div className="store__intro">
          <h3>{headingFor(store.id)}</h3>
          <p>{store.tagline}</p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article
              key={product.skuId}
              className={[
                "product",
                highlightSkuId === product.skuId
                  ? "product--hot"
                  : highlightSkuId
                    ? "product--dim"
                    : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-sku={product.skuId}
            >
              <div className="product__tile" aria-hidden="true">
                <img src={product.imageSrc} alt="" />
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

function NileChrome({
  store,
  count,
  onOpenCart,
}: {
  store: Store;
  count: number;
  onOpenCart: () => void;
}) {
  return (
    <>
      <header className="store-top">
        <div className="store-top__brand">
          <span className="logo-nile">
            nile<span>mart</span>
          </span>
        </div>
        <SearchBar placeholder={store.searchPlaceholder} showGo />
        <div className="store-top__meta">
          <span>
            Hello, sign in
            <strong>Account</strong>
          </span>
          <span>
            Returns
            <strong>& Orders</strong>
          </span>
          <button type="button" className="store-cart-chip" onClick={onOpenCart}>
            Cart <b>{count}</b>
          </button>
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

function WideChrome({
  store,
  count,
  onOpenCart,
}: {
  store: Store;
  count: number;
  onOpenCart: () => void;
}) {
  return (
    <>
      <header className="store-top">
        <div className="store-top__brand">
          <span className="logo-wide" aria-hidden="true">
            ✦
          </span>
          <span className="logo-wide-word">WideMart</span>
        </div>
        <SearchBar placeholder={store.searchPlaceholder} />
        <div className="store-top__meta">
          <span>
            Reorder
            <strong>My items</strong>
          </span>
          <span>
            Sign in
            <strong>Account</strong>
          </span>
          <button type="button" className="store-cart-chip" onClick={onOpenCart}>
            Cart <b>{count}</b>
          </button>
        </div>
      </header>
      <div className="store-fulfillment">
        Pickup or delivery? <strong>Springfield 62704</strong>
      </div>
    </>
  );
}

function DartChrome({
  store,
  count,
  onOpenCart,
}: {
  store: Store;
  count: number;
  onOpenCart: () => void;
}) {
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
        <SearchBar placeholder={store.searchPlaceholder} />
        <div className="store-top__meta">
          <span>
            Bullseye Club
            <strong>Rewards</strong>
          </span>
          <button type="button" className="store-cart-chip" onClick={onOpenCart}>
            Cart <b>{count}</b>
          </button>
        </div>
      </header>
    </>
  );
}

function SearchBar({
  placeholder,
  showGo = false,
}: {
  placeholder: string;
  showGo?: boolean;
}) {
  return (
    <div className="store-search" aria-hidden="true">
      <span className="store-search__fake">{placeholder}</span>
      {showGo ? <span className="store-search__go">Go</span> : null}
    </div>
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
