import {
  aisleById,
  availableNeeds,
  canVisualize,
  formatMoney,
  formatNeedList,
  formatUnitPrice,
  isStoreBrand,
  pickStandSkus,
  resolveNeeds,
  skuById,
  skuWhy,
  unitPrice,
} from "./catalog";
import { store } from "./store";
import type { ActionResult, AisleId, NeedId, TicketLine, Trip } from "./types";

function witness(tool: string, detail: string): void {
  store.setState((state) => ({
    ...state,
    lastWitness: { tool, at: Date.now(), detail },
  }));
}

export function optionPayload(skuId: string) {
  const sku = skuById(skuId);
  if (!sku) return null;
  return {
    skuId: sku.id,
    name: sku.name,
    brand: sku.brand,
    kind: sku.kind,
    price: formatMoney(sku.price),
    unitPrice: formatUnitPrice(sku),
    storeBrand: isStoreBrand(sku),
    why: skuWhy(sku),
    visualizable: canVisualize(sku),
    packHint: sku.packHint ?? null,
  };
}

export function describeTrip() {
  const { trip, stand } = store.getState();
  if (!trip) {
    return {
      list: [] as NeedId[],
      current: stand?.need ?? null,
      remaining: [] as NeedId[],
      done: [] as NeedId[],
    };
  }
  const current = stand?.need ?? null;
  return {
    list: trip.needs,
    current,
    remaining: trip.needs.filter((need) => !trip.done.includes(need) && need !== current),
    done: trip.done,
  };
}

export function describeStand() {
  const { stand, player, focusSkuId } = store.getState();
  if (!stand) return null;
  return {
    aisleId: player.aisleId,
    aisleName: aisleById(player.aisleId).name,
    need: stand.need,
    question: standQuestion(stand.need),
    focusSkuId,
    previewSkuId: store.getState().previewSkuId,
    options: stand.skuIds.map(optionPayload).filter((item) => item !== null),
    trip: describeTrip(),
  };
}

export function standQuestion(need: NeedId): string {
  const labels: Record<NeedId, string> = {
    leche: "¿Qué tipo de leche te gusta, o alguna de estas 4?",
    arroz: "¿Qué arroz te encaja, o alguna de estas 4?",
    jabon: "¿Qué jabón necesitas, o alguna de estas 4?",
    tomate: "¿Qué tomate quieres, o alguno de estos 4?",
    vestir: "¿Qué te pruebas, o alguna de estas 4?",
  };
  return labels[need];
}

function remainingHint(): string {
  const { remaining } = describeTrip();
  if (remaining.length === 0) {
    return "Si has terminado, llama checkout.";
  }
  return `Quedan ${formatNeedList(remaining)}. Cuando quieras el siguiente, llama next_stand.`;
}

function openNeed(need: NeedId, trip: Trip, tool: string): ActionResult {
  const options = pickStandSkus(need);
  if (options.length === 0) {
    return { ok: false, message: `No hay existencias para ${need}.` };
  }

  store.setState((state) => ({
    ...state,
    player: { aisleId: options[0].aisleId },
    stand: { need, skuIds: options.map((sku) => sku.id) },
    focusSkuId: null,
    previewSkuId: null,
    pendingNeed: null,
    ticket: null,
    trip,
    lastWitness: {
      tool,
      at: Date.now(),
      detail: `${need} · ${options.length} opciones`,
    },
  }));

  const listPrefix =
    trip.needs.length > 1 ? `Lista de ${trip.needs.length}: ${formatNeedList(trip.needs)}. ` : "";
  return {
    ok: true,
    message: `${listPrefix}Estás en ${aisleById(options[0].aisleId).name}. ${standQuestion(need)}`,
    data: describeStand(),
  };
}

export function showStand(rawNeed: string): ActionResult {
  const needs = resolveNeeds(rawNeed);
  if (needs.length === 0) {
    store.setState((state) => ({
      ...state,
      pendingNeed: rawNeed,
    }));
    witness("show_stand", `need desconocido: ${rawNeed}`);
    return {
      ok: false,
      message: `No tenemos “${rawNeed}”. Needs que sí: ${availableNeeds()}.`,
    };
  }

  const { trip, stand } = store.getState();
  const only = needs[0];
  if (needs.length === 1 && trip && trip.needs.includes(only) && !trip.done.includes(only)) {
    const current = stand?.need;
    const done =
      current && current !== only && !trip.done.includes(current) ? [...trip.done, current] : trip.done;
    return openNeed(only, { needs: trip.needs, done }, "show_stand");
  }

  return openNeed(only, { needs, done: [] }, "show_stand");
}

export function nextStand(): ActionResult {
  const trip = describeTrip();
  const next = trip.remaining[0];
  if (!next) {
    return {
      ok: false,
      message: "No queda nada en la lista. Si has terminado, llama checkout.",
    };
  }

  const current = store.getState().stand?.need;
  const done = [...trip.done];
  if (current && !done.includes(current)) done.push(current);
  return openNeed(next, { needs: trip.list, done }, "next_stand");
}

export function lookStand(): ActionResult {
  const described = describeStand();
  if (!described) {
    return { ok: false, message: "No hay stand abierto. Llama show_stand con un need." };
  }
  witness("look_stand", described.need);
  return {
    ok: true,
    message: `${described.aisleName}. ${described.question} ${remainingHint()}`,
    data: described,
  };
}

export function compareOptions(): ActionResult {
  const described = describeStand();
  if (!described) {
    return { ok: false, message: "No hay stand abierto. Llama show_stand con un need." };
  }

  const skus = described.options
    .map((option) => skuById(option.skuId))
    .filter((sku): sku is NonNullable<typeof sku> => sku !== undefined);
  const units = skus.map((sku) => unitPrice(sku));
  const cheapestUnit = Math.min(...units);
  const dearestUnit = Math.max(...units);

  const options = skus.map((sku) => {
    const unit = unitPrice(sku);
    const tags: string[] = [];
    tags.push(isStoreBrand(sku) ? "marca blanca" : "marca");
    if (unit === cheapestUnit) tags.push("más barato");
    if (unit === dearestUnit && dearestUnit !== cheapestUnit) tags.push("más caro");
    return {
      ...optionPayload(sku.id),
      tags,
    };
  });

  const cheapest = options.find((option) => option.tags.includes("más barato"));
  witness("compare_options", described.need);

  return {
    ok: true,
    message: `Comparo las ${options.length} del stand. No añado nada. ${cheapest?.name ?? "Una"} es la más barata (${cheapest?.unitPrice ?? ""}${cheapest?.storeBrand ? ", marca blanca" : ""}). Tú eliges.`,
    data: { need: described.need, question: described.question, options },
  };
}

export function goToAisle(aisleId: AisleId): ActionResult {
  const aisle = aisleById(aisleId);
  store.setState((state) => ({
    ...state,
    player: { aisleId },
    stand: null,
    focusSkuId: null,
    previewSkuId: null,
    pendingNeed: null,
    lastWitness: { tool: "go_to_aisle", at: Date.now(), detail: aisle.name },
  }));
  return { ok: true, message: `Estás en ${aisle.name}. Di qué necesitas para abrir un stand.` };
}

export function closeStand(): ActionResult {
  if (!store.getState().stand) {
    return { ok: false, message: "No hay stand que cerrar." };
  }
  store.setState((state) => ({
    ...state,
    stand: null,
    focusSkuId: null,
    previewSkuId: null,
    lastWitness: { tool: "close_stand", at: Date.now(), detail: "cerrado" },
  }));
  return { ok: true, message: "Stand cerrado. Sigues en el pasillo." };
}

export function focusProduct(skuId: string): ActionResult {
  const { stand } = store.getState();
  if (!stand || !stand.skuIds.includes(skuId)) {
    return { ok: false, message: "Ese producto no está en el stand abierto." };
  }
  const sku = skuById(skuId);
  if (!sku) return { ok: false, message: "SKU desconocido." };
  store.setState((state) => ({
    ...state,
    focusSkuId: skuId,
    lastWitness: { tool: "focus_product", at: Date.now(), detail: sku.name },
  }));
  return {
    ok: true,
    message: `Mirando ${sku.name} (${sku.kind}, ${formatMoney(sku.price)}).`,
    data: optionPayload(skuId),
  };
}

export function visualizeProduct(skuId: string): ActionResult {
  const { stand } = store.getState();
  if (!stand || !stand.skuIds.includes(skuId)) {
    return { ok: false, message: "Ese producto no está en el stand abierto." };
  }
  const sku = skuById(skuId);
  if (!sku) return { ok: false, message: "SKU desconocido." };
  if (!canVisualize(sku)) {
    return { ok: false, message: "Eso no se prueba. Solo la ropa de Moda se puede ver de cerca." };
  }
  store.setState((state) => ({
    ...state,
    focusSkuId: skuId,
    previewSkuId: skuId,
    lastWitness: { tool: "visualize_product", at: Date.now(), detail: skuId },
  }));
  return {
    ok: true,
    message: `Así se ve ${sku.name}. Si no te encaja, llama give_up_product. Si sí, add_to_cart.`,
    data: optionPayload(skuId),
  };
}

export function giveUpProduct(): ActionResult {
  const { previewSkuId } = store.getState();
  if (!previewSkuId) {
    return { ok: false, message: "No hay nada puesto. Llama visualize_product primero." };
  }
  const sku = skuById(previewSkuId);
  store.setState((state) => ({
    ...state,
    previewSkuId: null,
    lastWitness: { tool: "give_up_product", at: Date.now(), detail: previewSkuId },
  }));
  return {
    ok: true,
    message: `Dejado: ${sku?.name ?? "la prenda"}. Sigue en el stand, no está en la cesta.`,
    data: describeStand(),
  };
}

export function addToCart(skuId: string): ActionResult {
  const { stand } = store.getState();
  if (!stand || !stand.skuIds.includes(skuId)) {
    return {
      ok: false,
      message: "No puedes añadir eso: abre un stand y elige una de las opciones que ves.",
    };
  }
  const sku = skuById(skuId);
  if (!sku) return { ok: false, message: "SKU desconocido." };

  store.setState((state) => {
    const existing = state.basket.find((line) => line.skuId === skuId);
    const basket = existing
      ? state.basket.map((line) => (line.skuId === skuId ? { ...line, qty: line.qty + 1 } : line))
      : [...state.basket, { skuId, qty: 1 }];
    return {
      ...state,
      focusSkuId: skuId,
      previewSkuId: null,
      basket,
      lastWitness: { tool: "add_to_cart", at: Date.now(), detail: skuId },
    };
  });

  return {
    ok: true,
    message: `Añadido: ${sku.name}. ${remainingHint()}`,
    data: { skuId, basket: store.getState().basket, trip: describeTrip() },
  };
}

export function removeFromCart(skuId: string): ActionResult {
  const { basket } = store.getState();
  if (!basket.some((line) => line.skuId === skuId)) {
    return { ok: false, message: "Eso no está en la cesta." };
  }
  store.setState((state) => ({
    ...state,
    basket: state.basket
      .map((line) => (line.skuId === skuId ? { ...line, qty: line.qty - 1 } : line))
      .filter((line) => line.qty > 0),
    lastWitness: { tool: "remove_from_cart", at: Date.now(), detail: skuId },
  }));
  return { ok: true, message: "Quitado de la cesta.", data: { basket: store.getState().basket } };
}

export function checkout(): ActionResult {
  const { basket } = store.getState();
  if (basket.length === 0) {
    return { ok: false, message: "La cesta está vacía. Elige en el stand antes de irte." };
  }

  const lines: TicketLine[] = [];
  let total = 0;
  for (const line of basket) {
    const sku = skuById(line.skuId);
    if (!sku) continue;
    const lineTotal = sku.price * line.qty;
    total += lineTotal;
    lines.push({ skuId: sku.id, name: sku.name, qty: line.qty, total: lineTotal });
  }
  if (lines.length === 0) {
    return { ok: false, message: "La cesta está vacía. Elige en el stand antes de irte." };
  }

  const at = Date.now();
  store.setState((state) => ({
    ...state,
    player: { aisleId: "entrada" },
    stand: null,
    focusSkuId: null,
    previewSkuId: null,
    basket: [],
    trip: null,
    ticket: { lines, total, at },
    lastWitness: { tool: "checkout", at, detail: formatMoney(total) },
  }));

  return {
    ok: true,
    message: `Ticket: ${formatMoney(total)}. Gracias. Estás en la salida.`,
    data: { ticket: store.getState().ticket },
  };
}
