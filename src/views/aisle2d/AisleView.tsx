import { standQuestion } from "../../domain/actions";
import { useStore } from "../../hooks/useStore";
import { AisleBackdrop } from "./AisleBackdrop";
import { Basket } from "./Basket";
import { Minimap } from "./Minimap";
import { Stand } from "./Stand";

export function AisleView() {
  const { player, stand, focusSkuId, basket } = useStore();

  return (
    <div className="aisle-view">
      <Minimap aisleId={player.aisleId} />
      <div className="aisle-stage">
        <AisleBackdrop aisleId={player.aisleId} />
        {stand ? (
          <Stand stand={stand} focusSkuId={focusSkuId} question={standQuestion(stand.need)} />
        ) : (
          <p className="aisle-prompt">
            Pide leche, arroz, jabón o tomate. El pasillo se abre; tú eliges una de las 4.
          </p>
        )}
      </div>
      <Basket basket={basket} />
    </div>
  );
}
