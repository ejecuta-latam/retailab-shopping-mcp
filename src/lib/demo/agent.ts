import { getStore, findStoreForTags, tokenize } from "./catalog";
import {
  addToCart,
  listProducts,
  searchProducts,
  type ShoppingMutators,
  type ShoppingState,
} from "./tools";
import type { AgentLogEntry, Product } from "./types";

const ADD_INTENT = /\b(add|get|buy|grab|put|need)\b/i;

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
  const tokens = tokenize(query);
  const wantsList = tokens.length === 0 || /\b(list|show|what('s| is) on)\b/i.test(query);

  if (wantsList && tokens.length === 0 && !/under\s*\$?\d+/i.test(query)) {
    const listed = listProducts(state);
    entries.push(toolEntry("list_products", {}, listed.message));
    const products = (listed.data as { products: Product[] }).products;
    entries.push(
      noteEntry(
        `On ${getStore(state.storeId).name} I see ${products.map((p) => p.name).join(", ")}.`,
      ),
    );
    return { entries };
  }

  const searched = searchProducts(state, query);
  entries.push(toolEntry("search_products", { query }, searched.message));
  const matches = (searched.data as { products: Product[] }).products;
  const wantsAdd = ADD_INTENT.test(query) || matches.length === 1;

  if (matches.length === 0) {
    const otherStore = findStoreForTags(tokens);
    const hint =
      otherStore && otherStore !== state.storeId
        ? ` Try ${getStore(otherStore).name} — that catalog has a match. Your cart will stay.`
        : "";
    entries.push(
      noteEntry(
        `Nothing on this ${getStore(state.storeId).name} page matches that.${hint}`,
      ),
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
  const added = addToCart(state, mutators, pick.skuId, 1);
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
