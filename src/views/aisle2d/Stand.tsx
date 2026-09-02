import { addToCart, focusProduct, giveUpProduct, visualizeProduct } from "../../domain/actions";
import { canVisualize, formatMoney, skuById } from "../../domain/catalog";
import type { Stand as StandState } from "../../domain/types";

type Props = {
  stand: StandState;
  focusSkuId: string | null;
  previewSkuId: string | null;
  question: string;
};

export function Stand({ stand, focusSkuId, previewSkuId, question }: Props) {
  return (
    <section
      className="stand-dock"
      data-stand-need={stand.need}
      data-stand-count={stand.skuIds.length}
      data-preview={previewSkuId ?? ""}
    >
      <p className="stand-question">
        {previewSkuId ? "Así se ve. Añádelo o déjalo." : question}
      </p>
      <ol className="stand-row">
        {stand.skuIds.map((skuId) => {
          const sku = skuById(skuId);
          if (!sku) return null;
          const focused = focusSkuId === skuId;
          const previewing = previewSkuId === skuId;
          return (
            <li key={skuId}>
              <article className={`stand-chip${focused ? " is-focus" : ""}`} data-sku={skuId}>
                <button type="button" className="stand-face" onClick={() => focusProduct(skuId)}>
                  <span className="stand-kind">{sku.kind}</span>
                  <strong>{sku.name}</strong>
                  <span className="stand-price">{formatMoney(sku.price)}</span>
                </button>
                <div className="stand-actions">
                  {canVisualize(sku) ? (
                    previewing ? (
                      <button type="button" className="stand-drop" onClick={() => giveUpProduct()}>
                        Dejar
                      </button>
                    ) : (
                      <button type="button" className="stand-see" onClick={() => visualizeProduct(skuId)}>
                        Ver
                      </button>
                    )
                  ) : null}
                  <button type="button" className="stand-add" onClick={() => addToCart(skuId)}>
                    Añadir
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
