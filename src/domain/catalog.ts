import type { Aisle, AisleId, NeedId, Sku } from "./types";

export const AISLES: Aisle[] = [
  { id: "entrada", name: "Entrada", short: "In", hue: "#8a8178" },
  { id: "lacteos", name: "Lácteos", short: "Lác", hue: "#4f7c8a" },
  { id: "despensa", name: "Despensa", short: "Des", hue: "#8a6a3d" },
  { id: "limpieza", name: "Limpieza", short: "Lim", hue: "#3f6b5a" },
  { id: "fresco", name: "Fresco", short: "Fre", hue: "#6a7a3d" },
];

export const NEEDS: { id: NeedId; label: string; aisleId: Exclude<AisleId, "entrada">; aliases: string[] }[] = [
  { id: "leche", label: "leche", aisleId: "lacteos", aliases: ["leche", "milk", "lácteos"] },
  { id: "arroz", label: "arroz", aisleId: "despensa", aliases: ["arroz", "rice"] },
  { id: "jabon", label: "jabón", aisleId: "limpieza", aliases: ["jabon", "jabón", "soap", "detergente"] },
  { id: "tomate", label: "tomate", aisleId: "fresco", aliases: ["tomate", "tomates", "tomato"] },
];

export const SKUS: Sku[] = [
  {
    id: "leche-entera",
    name: "Leche entera 1 L",
    brand: "Prado",
    aisleId: "lacteos",
    need: "leche",
    kind: "entera",
    price: 1.19,
    grams: 1000,
    unit: "l",
  },
  {
    id: "leche-desnatada",
    name: "Leche desnatada 1 L",
    brand: "Prado",
    aisleId: "lacteos",
    need: "leche",
    kind: "desnatada",
    price: 1.15,
    grams: 1000,
    unit: "l",
  },
  {
    id: "leche-avena",
    name: "Bebida de avena 1 L",
    brand: "Campo Lento",
    aisleId: "lacteos",
    need: "leche",
    kind: "avena",
    price: 1.49,
    grams: 1000,
    unit: "l",
  },
  {
    id: "leche-blanca",
    name: "Leche entera marca blanca 1 L",
    brand: "Pasillo",
    aisleId: "lacteos",
    need: "leche",
    kind: "marca blanca",
    price: 0.89,
    grams: 1000,
    unit: "l",
    packHint: "Mismo litro, menos marca",
  },
  {
    id: "yogurt-natural",
    name: "Yogur natural pack 4",
    brand: "Prado",
    aisleId: "lacteos",
    need: "leche",
    kind: "yogur",
    price: 1.35,
    grams: 500,
    unit: "kg",
  },
  {
    id: "arroz-redondo",
    name: "Arroz redondo 1 kg",
    brand: "Era",
    aisleId: "despensa",
    need: "arroz",
    kind: "redondo",
    price: 1.59,
    grams: 1000,
    unit: "kg",
  },
  {
    id: "arroz-largo",
    name: "Arroz largo 1 kg",
    brand: "Era",
    aisleId: "despensa",
    need: "arroz",
    kind: "largo",
    price: 1.72,
    grams: 1000,
    unit: "kg",
  },
  {
    id: "arroz-integral",
    name: "Arroz integral 1 kg",
    brand: "Campo Lento",
    aisleId: "despensa",
    need: "arroz",
    kind: "integral",
    price: 2.15,
    grams: 1000,
    unit: "kg",
  },
  {
    id: "arroz-blanco",
    name: "Arroz redondo marca blanca 1 kg",
    brand: "Pasillo",
    aisleId: "despensa",
    need: "arroz",
    kind: "marca blanca",
    price: 1.05,
    grams: 1000,
    unit: "kg",
  },
  {
    id: "aceite-oliva",
    name: "Aceite de oliva 1 L",
    brand: "Era",
    aisleId: "despensa",
    need: "arroz",
    kind: "aceite",
    price: 7.9,
    grams: 1000,
    unit: "l",
  },
  {
    id: "jabon-mano",
    name: "Jabón de manos 300 ml",
    brand: "Nítido",
    aisleId: "limpieza",
    need: "jabon",
    kind: "manos",
    price: 1.85,
    grams: 300,
    unit: "l",
  },
  {
    id: "jabon-plato",
    name: "Lavavajillas 750 ml",
    brand: "Nítido",
    aisleId: "limpieza",
    need: "jabon",
    kind: "platos",
    price: 1.99,
    grams: 750,
    unit: "l",
  },
  {
    id: "jabon-ropa",
    name: "Detergente ropa 1.5 L",
    brand: "Nítido",
    aisleId: "limpieza",
    need: "jabon",
    kind: "ropa",
    price: 4.5,
    grams: 1500,
    unit: "l",
  },
  {
    id: "jabon-blanco",
    name: "Jabón de manos marca blanca 500 ml",
    brand: "Pasillo",
    aisleId: "limpieza",
    need: "jabon",
    kind: "marca blanca",
    price: 0.95,
    grams: 500,
    unit: "l",
  },
  {
    id: "tomate-rama",
    name: "Tomate en rama 500 g",
    brand: "Huerta",
    aisleId: "fresco",
    need: "tomate",
    kind: "rama",
    price: 1.8,
    grams: 500,
    unit: "kg",
  },
  {
    id: "tomate-pera",
    name: "Tomate pera 1 kg",
    brand: "Huerta",
    aisleId: "fresco",
    need: "tomate",
    kind: "pera",
    price: 2.1,
    grams: 1000,
    unit: "kg",
  },
  {
    id: "tomate-cherry",
    name: "Cherry bandeja 250 g",
    brand: "Huerta",
    aisleId: "fresco",
    need: "tomate",
    kind: "cherry",
    price: 1.6,
    grams: 250,
    unit: "kg",
  },
  {
    id: "tomate-lata",
    name: "Tomate triturado 400 g",
    brand: "Pasillo",
    aisleId: "fresco",
    need: "tomate",
    kind: "triturado",
    price: 0.72,
    grams: 400,
    unit: "kg",
    packHint: "Para guisar, no para ensalada",
  },
];

const ALIAS_TO_NEED = new Map<string, NeedId>();
for (const need of NEEDS) {
  for (const alias of need.aliases) {
    ALIAS_TO_NEED.set(normalizeNeed(alias), need.id);
  }
}

export function normalizeNeed(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function resolveNeed(raw: string): NeedId | null {
  return ALIAS_TO_NEED.get(normalizeNeed(raw)) ?? null;
}

export function aisleById(id: AisleId): Aisle {
  const aisle = AISLES.find((item) => item.id === id);
  if (!aisle) throw new Error(`Unknown aisle: ${id}`);
  return aisle;
}

export function skuById(id: string): Sku | undefined {
  return SKUS.find((item) => item.id === id);
}

export function skusInAisle(aisleId: AisleId): Sku[] {
  return SKUS.filter((item) => item.aisleId === aisleId);
}

export function skusForNeed(need: NeedId): Sku[] {
  return SKUS.filter((item) => item.need === need);
}

export function pickStandSkus(need: NeedId, max = 4): Sku[] {
  const matches = skusForNeed(need);
  const chosen: Sku[] = [];
  const seenKinds = new Set<string>();

  for (const sku of matches) {
    if (seenKinds.has(sku.kind)) continue;
    if (sku.kind === "yogur" || sku.kind === "aceite") continue;
    seenKinds.add(sku.kind);
    chosen.push(sku);
    if (chosen.length >= max) break;
  }

  if (chosen.length < max) {
    for (const sku of matches) {
      if (chosen.some((item) => item.id === sku.id)) continue;
      chosen.push(sku);
      if (chosen.length >= max) break;
    }
  }

  return chosen.slice(0, max);
}

export function unitPrice(sku: Sku): number {
  const amount = sku.unit === "ud" ? 1 : sku.grams / 1000;
  return sku.price / amount;
}

export function formatMoney(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

export function formatUnitPrice(sku: Sku): string {
  const suffix = sku.unit === "ud" ? "ud" : sku.unit;
  return `${formatMoney(unitPrice(sku))}/${suffix}`;
}

export function availableNeeds(): string {
  return NEEDS.map((need) => need.label).join(", ");
}
