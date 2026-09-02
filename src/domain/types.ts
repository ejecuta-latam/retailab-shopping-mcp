export type AisleId = "entrada" | "lacteos" | "despensa" | "limpieza" | "fresco" | "moda";

export type NeedId = "leche" | "arroz" | "jabon" | "tomate" | "vestir";

export type Unit = "l" | "kg" | "ud";

export type Sku = {
  id: string;
  name: string;
  brand: string;
  aisleId: Exclude<AisleId, "entrada">;
  need: NeedId;
  kind: string;
  price: number;
  grams: number;
  unit: Unit;
  packHint?: string;
  why?: string;
};

export type Aisle = {
  id: AisleId;
  name: string;
  short: string;
  hue: string;
};

export type BasketLine = {
  skuId: string;
  qty: number;
};

export type Stand = {
  need: NeedId;
  skuIds: string[];
};

export type Witness = {
  tool: string;
  at: number;
  detail: string;
};

export type Trip = {
  needs: NeedId[];
  done: NeedId[];
};

export type TicketLine = {
  skuId: string;
  name: string;
  qty: number;
  total: number;
};

export type Ticket = {
  lines: TicketLine[];
  total: number;
  at: number;
};

export type State = {
  player: { aisleId: AisleId };
  stand: Stand | null;
  focusSkuId: string | null;
  previewSkuId: string | null;
  basket: BasketLine[];
  trip: Trip | null;
  ticket: Ticket | null;
  lastWitness: Witness | null;
  pendingNeed: string | null;
};

export type ActionResult =
  | { ok: true; message: string; data?: unknown }
  | { ok: false; message: string };
