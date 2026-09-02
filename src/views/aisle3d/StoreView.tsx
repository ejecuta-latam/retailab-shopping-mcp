import { standQuestion } from "../../domain/actions";
import { useStore } from "../../hooks/useStore";
import { Basket } from "../aisle2d/Basket";
import { Stand } from "../aisle2d/Stand";
import { Ticket } from "../aisle2d/Ticket";
import { Trip } from "../aisle2d/Trip";
import { Aisle3D } from "./Aisle3D";

export function StoreView() {
  const { stand, focusSkuId, previewSkuId, basket, trip, ticket } = useStore();

  return (
    <div className="store">
      <Aisle3D />
      {ticket ? <Ticket ticket={ticket} /> : null}
      {!ticket && trip ? <Trip trip={trip} current={stand?.need ?? null} /> : null}
      {!ticket && stand ? (
        <Stand
          stand={stand}
          focusSkuId={focusSkuId}
          previewSkuId={previewSkuId}
          question={standQuestion(stand.need)}
        />
      ) : null}
      {!ticket ? <Basket basket={basket} /> : null}
    </div>
  );
}
