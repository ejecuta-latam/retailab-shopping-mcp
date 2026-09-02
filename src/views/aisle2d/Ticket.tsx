import { formatMoney } from "../../domain/catalog";
import type { Ticket as TicketState } from "../../domain/types";

type Props = {
  ticket: TicketState;
};

export function Ticket({ ticket }: Props) {
  return (
    <section className="ticket" aria-label="Ticket" data-ticket="1" data-ticket-total={ticket.total.toFixed(2)}>
      <h2>Ticket</h2>
      <p className="ticket-thanks">Gracias. Hasta la próxima.</p>
      <ul>
        {ticket.lines.map((line) => (
          <li key={line.skuId}>
            <span>
              {line.name}
              {line.qty > 1 ? ` ×${line.qty}` : ""}
            </span>
            <span>{formatMoney(line.total)}</span>
          </li>
        ))}
      </ul>
      <p className="ticket-total">{formatMoney(ticket.total)}</p>
    </section>
  );
}
