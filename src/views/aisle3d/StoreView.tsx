import { standQuestion } from "../../domain/actions";
import { useStore } from "../../hooks/useStore";
import { Basket } from "../aisle2d/Basket";
import { Stand } from "../aisle2d/Stand";
import { Aisle3D } from "./Aisle3D";

export function StoreView() {
  const { stand, focusSkuId, basket } = useStore();

  return (
    <div className="store">
      <Aisle3D />
      {stand ? <Stand stand={stand} focusSkuId={focusSkuId} question={standQuestion(stand.need)} /> : null}
      <Basket basket={basket} />
    </div>
  );
}
