export type AisleId = "entrada" | "lacteos" | "despensa" | "limpieza" | "fresco";

export type NeedId = "leche" | "arroz" | "jabon" | "tomate";

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

export type State = {
  player: { aisleId: AisleId };
  stand: Stand | null;
  focusSkuId: string | null;
  basket: BasketLine[];
  lastWitness: Witness | null;
  pendingNeed: string | null;
};

export type ActionResult =
  | { ok: true; message: string; data?: unknown }
  | { ok: false; message: string };
