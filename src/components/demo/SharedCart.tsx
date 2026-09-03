import { cartItemCount, cartTotalCents, formatUsd } from "../../lib/demo/cart";
import { getStore } from "../../lib/demo/catalog";
import type { CartLine } from "../../lib/demo/types";

interface SharedCartProps {
  cart: CartLine[];
  onQuantity: (skuId: string, quantity: number) => void;
  onRemove: (skuId: string) => void;
}

export default function SharedCart({ cart, onQuantity, onRemove }: SharedCartProps) {
  const count = cartItemCount(cart);
  const total = cartTotalCents(cart);

  return (
    <section className="cart" aria-labelledby="cart-heading">
      <header className="cart__head">
        <div>
          <h3 id="cart-heading">Shared cart</h3>
          <p>One basket across every storefront.</p>
        </div>
        <span className="cart__count" aria-live="polite">
          {count}
        </span>
      </header>

      {cart.length === 0 ? (
        <p className="cart__empty">
          Cart is empty. Add from this page — or let the agent do it.
        </p>
      ) : (
        <ul className="cart__list">
          {cart.map((line) => {
            const store = getStore(line.storeId);
            return (
              <li key={line.skuId} className="cart__line">
                <div className="cart__line-main">
                  <p className="cart__name">{line.name}</p>
                  <span className={`cart__pill cart__pill--${line.storeId}`}>
                    {store.name}
                  </span>
                </div>
                <p className="cart__price">{formatUsd(line.priceCents * line.quantity)}</p>
                <div className="cart__qty">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name}`}
                    onClick={() => onQuantity(line.skuId, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name}`}
                    onClick={() => onQuantity(line.skuId, line.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="cart__remove"
                    onClick={() => onRemove(line.skuId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <footer className="cart__foot">
        <span>Subtotal</span>
        <strong>{formatUsd(total)}</strong>
      </footer>
    </section>
  );
}
