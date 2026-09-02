import { formatMoney, skuById } from "../../domain/catalog";
import { removeFromCart } from "../../domain/actions";
import type { BasketLine } from "../../domain/types";

type Props = {
  basket: BasketLine[];
};

export function Basket({ basket }: Props) {
  const total = basket.reduce((sum, line) => {
    const sku = skuById(line.skuId);
    return sum + (sku ? sku.price * line.qty : 0);
  }, 0);

  return (
    <aside className="basket" aria-label="Cesta" data-basket-count={basket.reduce((sum, line) => sum + line.qty, 0)}>
      <h2>Cesta</h2>
      {basket.length === 0 ? (
        <p className="basket-empty">Vacía. Elige en el stand.</p>
      ) : (
        <ul>
          {basket.map((line) => {
            const sku = skuById(line.skuId);
            if (!sku) return null;
            return (
              <li key={line.skuId}>
                <span>
                  {sku.name}
                  {line.qty > 1 ? ` ×${line.qty}` : ""}
                </span>
                <span>{formatMoney(sku.price * line.qty)}</span>
                <button type="button" onClick={() => removeFromCart(line.skuId)} aria-label={`Quitar ${sku.name}`}>
                  Quitar
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="basket-total">{formatMoney(total)}</p>
    </aside>
  );
}
