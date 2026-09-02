import type { CSSProperties } from "react";
import { aisleById, skusInAisle } from "../../domain/catalog";
import type { AisleId } from "../../domain/types";

type Props = {
  aisleId: AisleId;
};

export function AisleBackdrop({ aisleId }: Props) {
  const aisle = aisleById(aisleId);
  const skus = skusInAisle(aisleId);

  return (
    <section
      className="aisle-backdrop"
      style={{ "--aisle": aisle.hue } as CSSProperties}
      data-aisle={aisleId}
    >
      <div className="aisle-sign">{aisle.name}</div>
      <div className="aisle-shelf" aria-hidden>
        {aisleId === "entrada"
          ? Array.from({ length: 8 }, (_, index) => <span key={index} className="shelf-block empty" />)
          : skus.map((sku) => (
              <span key={sku.id} className="shelf-block" title={sku.name}>
                {sku.kind}
              </span>
            ))}
      </div>
    </section>
  );
}
