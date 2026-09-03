import { getStore, findStoreForTags, matchStoreInText, tokenize } from "./catalog";
import {
  addToCart,
  listProducts,
  listStores,
  searchProducts,
  switchStore,
  type ShoppingMutators,
  type ShoppingState,
} from "./tools";
import type { AgentLogEntry, Product, StoreId } from "./types";

const ADD_INTENT = /\b(add|get|buy|grab|put|need)\b/i;
const SWITCH_INTENT = /\b(go to|switch to|open|visit)\b/i;
const LIST_STORES_INTENT = /\b(list stores|which stores|what stores|available stores|show stores)\b/i;

export interface AgentTurn {
  entries: AgentLogEntry[];
}

export function runAgentTurn(
  prompt: string,
  state: ShoppingState,
  mutators: ShoppingMutators,
): AgentTurn {
  const query = prompt.trim();
  const entries: AgentLogEntry[] = [];
  let current = state;

  if (LIST_STORES_INTENT.test(query)) {
    const listed = listStores(current);
    entries.push(toolEntry("list_stores", {}, listed.message));
    entries.push(noteEntry(describeStores(listed)));
    return { entries };
  }

  const namedStore = matchStoreInText(query);
  const wantsSwitch = Boolean(namedStore) && (SWITCH_INTENT.test(query) || isMostlyStoreName(query));

  if (namedStore && wantsSwitch) {
    current = applySwitch(current, mutators, namedStore, entries);
    const leftover = stripStoreAndSwitchWords(query);
    if (!leftover && !ADD_INTENT.test(query)) {
      const listed = listProducts(current);
      entries.push(toolEntry("list_products", {}, listed.message));
      entries.push(
        noteEntry(
          `Now reading ${getStore(current.storeId).name}. Cart stays put.`,
        ),
      );
      return { entries };
    }
  }

  return shopOnPage(query, current, mutators, entries);
}

function shopOnPage(
  query: string,
  state: ShoppingState,
  mutators: ShoppingMutators,
  entries: AgentLogEntry[],
): AgentTurn {
  let current = state;
  const tokens = tokenize(query);
  const wantsList = tokens.length === 0 || /\b(list|show|what('s| is) on)\b/i.test(query);

  if (wantsList && tokens.length === 0 && !/under\s*\$?\d+/i.test(query)) {
    const listed = listProducts(current);
    entries.push(toolEntry("list_products", {}, listed.message));
    const products = (listed.data as { products: Product[] }).products;
    entries.push(
      noteEntry(
        `On ${getStore(current.storeId).name} I see ${products.map((p) => p.name).join(", ")}.`,
      ),
    );
    return { entries };
  }

  const searched = searchProducts(current, query);
  entries.push(toolEntry("search_products", { query }, searched.message));
  let matches = (searched.data as { products: Product[] }).products;
  const wantsAdd = ADD_INTENT.test(query) || matches.length === 1;

  if (matches.length === 0) {
    const otherStore = findStoreForTags(tokens);
    if (otherStore && otherStore !== current.storeId) {
      current = applySwitch(current, mutators, otherStore, entries);
      const retry = searchProducts(current, query);
      entries.push(toolEntry("search_products", { query }, retry.message));
      matches = (retry.data as { products: Product[] }).products;
    }
  }

  if (matches.length === 0) {
    entries.push(
      noteEntry(`Nothing in these storefronts matches that.`),
    );
    return { entries };
  }

  if (!wantsAdd) {
    entries.push(
      noteEntry(
        `On this page: ${matches.map((p) => p.name).join(", ")}. Say “add” to put one in the shared cart.`,
      ),
    );
    return { entries };
  }

  const pick = pickBest(matches);
  const added = addToCart(current, mutators, pick.skuId, 1);
  entries.push(
    toolEntry("add_to_cart", { skuId: pick.skuId, quantity: 1 }, added.message),
  );
  if (added.ok) {
    entries.push(
      noteEntry(
        `${pick.name} is in the shared cart. Switch stores whenever — it stays.`,
      ),
    );
  }
  return { entries };
}

function applySwitch(
  state: ShoppingState,
  mutators: ShoppingMutators,
  storeId: StoreId,
  entries: AgentLogEntry[],
): ShoppingState {
  const switched = switchStore(state, mutators, storeId);
  entries.push(toolEntry("switch_store", { storeId }, switched.message));
  return switched.ok ? { ...state, storeId } : state;
}

function describeStores(listed: { data?: unknown }): string {
  const data = listed.data as {
    currentStoreId: StoreId;
    stores: { storeId: StoreId; name: string; current: boolean }[];
  };
  const names = data.stores.map((store) =>
    store.current ? `${store.name} (open)` : store.name,
  );
  return `Storefronts: ${names.join(", ")}.`;
}

function isMostlyStoreName(query: string): boolean {
  const stripped = stripStoreAndSwitchWords(query);
  return stripped.length === 0;
}

function stripStoreAndSwitchWords(query: string): string {
  return query
    .replace(SWITCH_INTENT, " ")
    .replace(/\b(nile\s*mart|wide\s*mart|dart\s*house|nilemart|widemart|darthouse)\b/gi, " ")
    .replace(/\b(please|the|page|store|shop)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickBest(products: Product[]): Product {
  return [...products].sort((a, b) => b.rating - a.rating || a.priceCents - b.priceCents)[0];
}

function toolEntry(toolName: string, args: unknown, result: string): AgentLogEntry {
  return {
    id: newId(),
    kind: "tool",
    toolName,
    args,
    result,
  };
}

function noteEntry(result: string): AgentLogEntry {
  return { id: newId(), kind: "note", result };
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
