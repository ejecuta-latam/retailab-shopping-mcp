import type { CSSProperties } from "react";
import { goToAisle } from "../../domain/actions";
import { AISLES } from "../../domain/catalog";
import type { AisleId } from "../../domain/types";

type Props = {
  aisleId: AisleId;
};

export function Minimap({ aisleId }: Props) {
  return (
    <nav className="minimap" aria-label="Planta del súper">
      {AISLES.map((aisle) => {
        const here = aisle.id === aisleId;
        return (
          <button
            key={aisle.id}
            type="button"
            className={`minimap-aisle${here ? " is-here" : ""}`}
            style={{ "--aisle": aisle.hue } as CSSProperties}
            onClick={() => goToAisle(aisle.id)}
            data-aisle-button={aisle.id}
          >
            <span className="minimap-dot" aria-hidden />
            <span className="minimap-name">{aisle.name}</span>
            {here ? <span className="minimap-you">tú</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
