import type { Product, Store, StoreId } from "./types";

export const STORES: Store[] = [
  {
    id: "nilemart",
    name: "NileMart",
    hostname: "nilemart.shop",
    tagline: "Everything from the river to your door",
    searchPlaceholder: "Search NileMart",
  },
  {
    id: "widemart",
    name: "WideMart",
    hostname: "widemart.shop",
    tagline: "Low prices. Wide aisles.",
    searchPlaceholder: "Search WideMart",
  },
  {
    id: "darthouse",
    name: "DartHouse",
    hostname: "darthouse.shop",
    tagline: "Aim higher. Spend less.",
    searchPlaceholder: "Search DartHouse",
  },
];

const CATALOG: Omit<Product, "imageSrc">[] = [
  {
    skuId: "nm-nilebuds",
    storeId: "nilemart",
    name: "NileBuds Wireless Pro",
    description: "Noise-cancelling earbuds with 28-hour case life and Nile+ two-day delivery.",
    priceCents: 7999,
    rating: 4.6,
    reviewCount: 18420,
    tags: ["wireless", "headphones", "earbuds", "audio", "nilebuds"],
    badge: "Nile+",
    category: "audio",
  },
  {
    skuId: "nm-lumen",
    storeId: "nilemart",
    name: "Lumen Reader 11",
    description: "Glare-free 11-inch reading tablet with weeks of battery.",
    priceCents: 13999,
    rating: 4.7,
    reviewCount: 9021,
    tags: ["reader", "tablet", "books", "lumen"],
    badge: "Nile+",
    category: "reading",
  },
  {
    skuId: "nm-kettle",
    storeId: "nilemart",
    name: "Harbor Gooseneck Kettle",
    description: "1L stainless kettle with hold-temp pour control.",
    priceCents: 3499,
    rating: 4.4,
    reviewCount: 3102,
    tags: ["kettle", "kitchen", "coffee", "tea"],
    badge: null,
    category: "kitchen",
  },
  {
    skuId: "nm-hub",
    storeId: "nilemart",
    name: "Current 7-in-1 USB-C Hub",
    description: "HDMI, SD, and two USB-A ports in a pocket aluminum shell.",
    priceCents: 2499,
    rating: 4.3,
    reviewCount: 6544,
    tags: ["usb", "hub", "cables", "electronics"],
    badge: "Nile+",
    category: "cables",
  },
  {
    skuId: "nm-trail",
    storeId: "nilemart",
    name: "Ridge Trail Runners",
    description: "Cushioned road-to-trail shoes with a breathable knit upper.",
    priceCents: 8900,
    rating: 4.5,
    reviewCount: 2210,
    tags: ["shoes", "running", "trail", "footwear"],
    badge: null,
    category: "footwear",
  },
  {
    skuId: "nm-pods",
    storeId: "nilemart",
    name: "Harbor Espresso Pods 24ct",
    description: "Dark roast pods compatible with standard capsule machines.",
    priceCents: 1849,
    rating: 4.2,
    reviewCount: 870,
    tags: ["coffee", "pods", "espresso", "kitchen"],
    badge: null,
    category: "kitchen",
  },
  {
    skuId: "wm-milk",
    storeId: "widemart",
    name: "FairChoice 2% Milk 1gal",
    description: "Vitamin D milk, gallon. Pickup today in most stores.",
    priceCents: 328,
    rating: 4.6,
    reviewCount: 12004,
    tags: ["milk", "dairy", "grocery", "gallon"],
    badge: null,
    category: "grocery",
  },
  {
    skuId: "wm-towels",
    storeId: "widemart",
    name: "FairChoice Paper Towels 12pk",
    description: "Strong 2-ply sheets. Rollback price this week.",
    priceCents: 1197,
    rating: 4.5,
    reviewCount: 8033,
    tags: ["paper", "towels", "household", "rollback"],
    badge: "Rollback",
    category: "household",
  },
  {
    skuId: "wm-buds",
    storeId: "widemart",
    name: "Wavelet Wireless Earbuds",
    description: "Value buds with a charging case. Everyday electronics aisle.",
    priceCents: 1988,
    rating: 4.1,
    reviewCount: 4412,
    tags: ["wireless", "headphones", "earbuds", "audio", "electronics"],
    badge: "Rollback",
    category: "audio",
  },
  {
    skuId: "wm-cereal",
    storeId: "widemart",
    name: "Sunbowl Family Cereal 18oz",
    description: "Toasted oat flakes. Breakfast aisle, eye-level.",
    priceCents: 448,
    rating: 4.4,
    reviewCount: 2109,
    tags: ["cereal", "breakfast", "grocery", "oat"],
    badge: null,
    category: "grocery",
  },
  {
    skuId: "wm-batteries",
    storeId: "widemart",
    name: "PowerNest AA Batteries 24pk",
    description: "Alkaline AA pack for remotes, toys, and clocks.",
    priceCents: 894,
    rating: 4.7,
    reviewCount: 15021,
    tags: ["batteries", "aa", "electronics", "household"],
    badge: null,
    category: "batteries",
  },
  {
    skuId: "wm-pizza",
    storeId: "widemart",
    name: "Hearthstone Frozen Pizza",
    description: "Rising-crust pepperoni. Frozen aisle, door 12.",
    priceCents: 547,
    rating: 4.3,
    reviewCount: 3888,
    tags: ["pizza", "frozen", "grocery", "dinner"],
    badge: null,
    category: "frozen",
  },
  {
    skuId: "dh-pillow",
    storeId: "darthouse",
    name: "Hearth Throw Pillow",
    description: "Washed linen-look square pillow in clay. Living room edit.",
    priceCents: 2400,
    rating: 4.6,
    reviewCount: 1544,
    tags: ["pillow", "throw", "home", "decor", "linen"],
    badge: "Bullseye Club",
    category: "home",
  },
  {
    skuId: "dh-lamp",
    storeId: "darthouse",
    name: "Arc Desk Lamp",
    description: "Matte steel lamp with a warm dimmer. Home office.",
    priceCents: 3900,
    rating: 4.5,
    reviewCount: 988,
    tags: ["lamp", "desk", "lighting", "home", "office"],
    badge: null,
    category: "lighting",
  },
  {
    skuId: "dh-socks",
    storeId: "darthouse",
    name: "Cloud Crew Socks 6pk",
    description: "Soft cotton crew socks. Everyday apparel.",
    priceCents: 1200,
    rating: 4.7,
    reviewCount: 4201,
    tags: ["socks", "apparel", "crew", "cotton"],
    badge: null,
    category: "apparel",
  },
  {
    skuId: "dh-bottle",
    storeId: "darthouse",
    name: "Stillwater Bottle 24oz",
    description: "Matte insulated bottle. Keeps cold all commute.",
    priceCents: 1800,
    rating: 4.4,
    reviewCount: 2760,
    tags: ["bottle", "water", "drinkware", "insulated"],
    badge: "Bullseye Club",
    category: "drinkware",
  },
  {
    skuId: "dh-tee",
    storeId: "darthouse",
    name: "Open Knit Tee",
    description: "Relaxed linen-mix tee in chalk. Spring floorset.",
    priceCents: 1600,
    rating: 4.3,
    reviewCount: 1330,
    tags: ["tee", "shirt", "apparel", "linen"],
    badge: null,
    category: "apparel",
  },
  {
    skuId: "dh-candle",
    storeId: "darthouse",
    name: "Orchard Soy Candle",
    description: "Fig and cedar soy wax. 40-hour burn.",
    priceCents: 1400,
    rating: 4.8,
    reviewCount: 890,
    tags: ["candle", "soy", "scent", "home"],
    badge: null,
    category: "scent",
  },
];

export const PRODUCTS: Product[] = CATALOG.map((product) => ({
  ...product,
  imageSrc: `/demo/products/${product.skuId}.webp`,
}));

const STORE_BY_ID = new Map(STORES.map((store) => [store.id, store]));

export function getStore(storeId: StoreId): Store {
  const store = STORE_BY_ID.get(storeId);
  if (!store) {
    throw new Error(`Unknown store: ${storeId}`);
  }
  return store;
}

export function productsForStore(storeId: StoreId): Product[] {
  return PRODUCTS.filter((product) => product.storeId === storeId);
}

export function getProduct(skuId: string): Product | undefined {
  return PRODUCTS.find((product) => product.skuId === skuId);
}

export function searchStoreProducts(storeId: StoreId, query: string): Product[] {
  const tokens = tokenize(query);
  const maxCents = parseUnderBudget(query);
  return productsForStore(storeId).filter((product) => {
    if (maxCents !== null && product.priceCents >= maxCents) {
      return false;
    }
    if (tokens.length === 0) {
      return maxCents !== null;
    }
    const haystack = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

const STORE_ALIASES: Record<string, StoreId> = {
  nilemart: "nilemart",
  nile: "nilemart",
  "nile mart": "nilemart",
  "nilemart.shop": "nilemart",
  widemart: "widemart",
  wide: "widemart",
  "wide mart": "widemart",
  "widemart.shop": "widemart",
  darthouse: "darthouse",
  dart: "darthouse",
  "dart house": "darthouse",
  "darthouse.shop": "darthouse",
};

export function parseStoreId(raw: string): StoreId | null {
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return STORE_ALIASES[key] ?? null;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "add",
  "get",
  "buy",
  "grab",
  "put",
  "cart",
  "something",
  "find",
  "please",
  "some",
  "under",
  "a",
  "an",
  "to",
  "the",
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/under\s*\$?\d+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function parseUnderBudget(query: string): number | null {
  const match = query.toLowerCase().match(/under\s*\$?(\d+)/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 100;
}
