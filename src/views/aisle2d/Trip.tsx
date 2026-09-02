import { nextStand } from "../../domain/actions";
import { needLabel } from "../../domain/catalog";
import type { NeedId, Trip as TripState } from "../../domain/types";

type Props = {
  trip: TripState;
  current: NeedId | null;
};

export function Trip({ trip, current }: Props) {
  if (trip.needs.length < 2) return null;
  const remaining = trip.needs.filter((need) => !trip.done.includes(need) && need !== current);

  return (
    <aside className="trip" aria-label="Lista" data-trip={trip.needs.join(",")} data-trip-remaining={remaining.length}>
      <h2>Lista</h2>
      <ol>
        {trip.needs.map((need) => {
          const done = trip.done.includes(need);
          const here = need === current;
          return (
            <li key={need} className={here ? "is-here" : done ? "is-done" : undefined} data-trip-need={need}>
              {needLabel(need)}
            </li>
          );
        })}
      </ol>
      {remaining.length > 0 ? (
        <button type="button" onClick={() => nextStand()}>
          Seguir
        </button>
      ) : null}
    </aside>
  );
}
