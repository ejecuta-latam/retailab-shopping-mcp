import { addToCart, focusProduct } from "../../domain/actions";
import { formatMoney, skuById } from "../../domain/catalog";
import type { Stand as StandState } from "../../domain/types";

type Props = {
  stand: StandState;
  focusSkuId: string | null;
  question: string;
};

export function Stand({ stand, focusSkuId, question }: Props) {
  return (
    <section className="stand-dock" data-stand-need={stand.need} data-stand-count={stand.skuIds.length}>
      <p className="stand-question">{question}</p>
      <ol className="stand-row">
        {stand.skuIds.map((skuId) => {
          const sku = skuById(skuId);
          if (!sku) return null;
          const focused = focusSkuId === skuId;
          return (
            <li key={skuId}>
              <article className={`stand-chip${focused ? " is-focus" : ""}`} data-sku={skuId}>
                <button type="button" className="stand-face" onClick={() => focusProduct(skuId)}>
                  <span className="stand-kind">{sku.kind}</span>
                  <strong>{sku.name}</strong>
                  <span className="stand-price">{formatMoney(sku.price)}</span>
                </button>
                <button type="button" className="stand-add" onClick={() => addToCart(skuId)}>
                  Añadir
                </button>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
