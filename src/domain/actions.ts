import {
  aisleById,
  availableNeeds,
  formatMoney,
  formatUnitPrice,
  pickStandSkus,
  resolveNeed,
  skuById,
} from "./catalog";
import { store } from "./store";
import type { ActionResult, AisleId, NeedId } from "./types";

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
    packHint: sku.packHint ?? null,
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
    options: stand.skuIds.map(optionPayload).filter((item) => item !== null),
  };
}

export function standQuestion(need: NeedId): string {
  const labels: Record<NeedId, string> = {
    leche: "¿Qué tipo de leche te gusta, o alguna de estas 4?",
    arroz: "¿Qué arroz te encaja, o alguna de estas 4?",
    jabon: "¿Qué jabón necesitas, o alguna de estas 4?",
    tomate: "¿Qué tomate quieres, o alguno de estos 4?",
  };
  return labels[need];
}

export function showStand(rawNeed: string): ActionResult {
  const need = resolveNeed(rawNeed);
  if (!need) {
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

  const options = pickStandSkus(need);
  if (options.length === 0) {
    return { ok: false, message: `No hay existencias para ${need}.` };
  }

  store.setState((state) => ({
    ...state,
    player: { aisleId: options[0].aisleId },
    stand: { need, skuIds: options.map((sku) => sku.id) },
    focusSkuId: null,
    pendingNeed: null,
    lastWitness: {
      tool: "show_stand",
      at: Date.now(),
      detail: `${need} · ${options.length} opciones`,
    },
  }));

  return {
    ok: true,
    message: `Estás en ${aisleById(options[0].aisleId).name}. ${standQuestion(need)}`,
    data: describeStand(),
  };
}

export function lookStand(): ActionResult {
  const described = describeStand();
  if (!described) {
    return { ok: false, message: "No hay stand abierto. Llama show_stand con un need." };
  }
  witness("look_stand", described.need);
  return {
    ok: true,
    message: `${described.aisleName}. ${described.question}`,
    data: described,
  };
}

export function goToAisle(aisleId: AisleId): ActionResult {
  const aisle = aisleById(aisleId);
  store.setState((state) => ({
    ...state,
    player: { aisleId },
    stand: null,
    focusSkuId: null,
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
      basket,
      lastWitness: { tool: "add_to_cart", at: Date.now(), detail: skuId },
    };
  });

  return {
    ok: true,
    message: `Añadido: ${sku.name}.`,
    data: { skuId, basket: store.getState().basket },
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
