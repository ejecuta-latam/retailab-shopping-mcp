import { useWebMCP } from "usewebmcp";
import { useStore } from "../hooks/useStore";
import {
  AISLE_SCHEMA,
  EMPTY_SCHEMA,
  SHOW_STAND_SCHEMA,
  SKU_SCHEMA,
  runAddToCart,
  runFocusProduct,
  runGoToAisle,
  runLookStand,
  runRemoveFromCart,
  runShowStand,
} from "./tools";

export function ToolRegistrar() {
  const { stand, basket } = useStore();
  const hasStand = stand !== null;
  const hasBasket = basket.length > 0;

  useWebMCP({
    name: "show_stand",
    description:
      "Walk the shopper to the aisle for a need and open a stand with up to 4 real options. Use when they say they need something (e.g. leche/milk). Then ASK which of the 4 they want. Do not add to the cart until they choose.",
    inputSchema: SHOW_STAND_SCHEMA,
    execute: runShowStand,
  });

  useWebMCP({
    name: "look_stand",
    description: "Re-read the open stand: aisle, question, and the 4 options. Use if you lost context.",
    inputSchema: EMPTY_SCHEMA,
    annotations: { readOnlyHint: true },
    enabled: hasStand,
    execute: runLookStand,
  });

  useWebMCP({
    name: "go_to_aisle",
    description:
      "Walk to an aisle without opening a stand. Use to wander. Prefer show_stand when they named a product.",
    inputSchema: AISLE_SCHEMA,
    execute: runGoToAisle,
  });

  useWebMCP({
    name: "focus_product",
    description: "Highlight one of the 4 stand options so the shopper can look at it.",
    inputSchema: SKU_SCHEMA,
    enabled: hasStand,
    execute: runFocusProduct,
  });

  useWebMCP({
    name: "add_to_cart",
    description:
      "Add one stand option to the basket AFTER the shopper chose it. Fails if that skuId is not on the open stand.",
    inputSchema: SKU_SCHEMA,
    enabled: hasStand,
    execute: runAddToCart,
  });

  useWebMCP({
    name: "remove_from_cart",
    description: "Remove one item from the basket.",
    inputSchema: SKU_SCHEMA,
    enabled: hasBasket,
    execute: runRemoveFromCart,
  });

  return null;
}
