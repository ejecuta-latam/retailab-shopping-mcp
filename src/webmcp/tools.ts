import {
  addToCart,
  checkout,
  compareOptions,
  focusProduct,
  giveUpProduct,
  visualizeProduct,
  goToAisle,
  lookStand,
  nextStand,
  removeFromCart,
  showStand,
} from "../domain/actions";
import type { ActionResult, AisleId } from "../domain/types";

export const SHOW_STAND_SCHEMA = {
  type: "object",
  properties: {
    need: {
      type: "string",
      description:
        "What the shopper asked for. One need or a list, e.g. 'leche, arroz y jabon'. Known needs: leche (milk), arroz (rice), jabon (soap), tomate (tomato), vestir (dress/ropa).",
    },
  },
  required: ["need"],
} as const;

export const AISLE_SCHEMA = {
  type: "object",
  properties: {
    aisleId: {
      type: "string",
      enum: ["entrada", "lacteos", "despensa", "limpieza", "fresco", "moda"],
      description: "Aisle to walk to. Does not add products.",
    },
  },
  required: ["aisleId"],
} as const;

export const SKU_SCHEMA = {
  type: "object",
  properties: {
    skuId: {
      type: "string",
      description: "Product id from the current stand options, e.g. leche-avena.",
    },
  },
  required: ["skuId"],
} as const;

export const EMPTY_SCHEMA = {
  type: "object",
  properties: {},
} as const;

type ToolClient = {
  requestUserInteraction?: () => Promise<unknown>;
};

export function toToolResult(result: ActionResult) {
  return result;
}

export async function runShowStand(input: { need: string }) {
  return toToolResult(showStand(input.need));
}

export async function runLookStand() {
  return toToolResult(lookStand());
}

export async function runCompareOptions() {
  return toToolResult(compareOptions());
}

export async function runGoToAisle(input: { aisleId: AisleId }) {
  return toToolResult(goToAisle(input.aisleId));
}

export async function runFocusProduct(input: { skuId: string }) {
  return toToolResult(focusProduct(input.skuId));
}

export async function runVisualizeProduct(input: { skuId: string }) {
  return toToolResult(visualizeProduct(input.skuId));
}

export async function runGiveUpProduct() {
  return toToolResult(giveUpProduct());
}

export async function runAddToCart(input: { skuId: string }, client?: ToolClient) {
  if (typeof client?.requestUserInteraction === "function") {
    await client.requestUserInteraction();
  }
  return toToolResult(addToCart(input.skuId));
}

export async function runRemoveFromCart(input: { skuId: string }) {
  return toToolResult(removeFromCart(input.skuId));
}

export async function runNextStand() {
  return toToolResult(nextStand());
}

export async function runCheckout(_input: Record<string, unknown> = {}, client?: ToolClient) {
  if (typeof client?.requestUserInteraction === "function") {
    await client.requestUserInteraction();
  }
  return toToolResult(checkout());
}
