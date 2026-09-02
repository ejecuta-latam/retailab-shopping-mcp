import { useWebMCP } from "usewebmcp";
import { useStore } from "../hooks/useStore";
import {
  AISLE_SCHEMA,
  EMPTY_SCHEMA,
  SHOW_STAND_SCHEMA,
  SKU_SCHEMA,
  runAddToCart,
  runCheckout,
  runCompareOptions,
  runFocusProduct,
  runGiveUpProduct,
  runGoToAisle,
  runLookStand,
  runNextStand,
  runRemoveFromCart,
  runShowStand,
  runVisualizeProduct,
} from "./tools";

export function ToolRegistrar() {
  const { stand, basket } = useStore();
  const hasStand = stand !== null;
  const hasBasket = basket.length > 0;

  useWebMCP({
    name: "show_stand",
    description:
      "Walk the shopper to the aisle and open a stand of up to 4 options. Use when they name one need or a list (e.g. leche, arroz y jabon). Opens the first need and remembers the rest. Then ASK which of the 4 they want. Do not add until they choose.",
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
    name: "compare_options",
    description:
      "Advise on the 4 open stand options: unit price, store brand vs brand, and a one-line why. Use when they ask which is cheaper, healthier, or the difference. Do not add to the cart.",
    inputSchema: EMPTY_SCHEMA,
    annotations: { readOnlyHint: true },
    enabled: hasStand,
    execute: runCompareOptions,
  });

  useWebMCP({
    name: "go_to_aisle",
    description:
      "Walk to an aisle without opening a stand. Use to wander. Prefer show_stand when they named a product.",
    inputSchema: AISLE_SCHEMA,
    execute: runGoToAisle,
  });

  useWebMCP({
    name: "visualize_product",
    description:
      "Bring the camera close to a clothing item on the Moda stand so the shopper can see the model. Only works for vestir SKUs. Does not add to the cart. After this they can add_to_cart or give_up_product.",
    inputSchema: SKU_SCHEMA,
    enabled: hasStand,
    execute: runVisualizeProduct,
  });

  useWebMCP({
    name: "give_up_product",
    description:
      "Put the previewed garment back. Use when they say déjalo / no lo quiero after visualize_product. Does not add to the cart.",
    inputSchema: EMPTY_SCHEMA,
    execute: runGiveUpProduct,
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

  useWebMCP({
    name: "next_stand",
    description:
      "Walk to the next need still on the trip list and open that stand. Use after they picked something and want to continue (e.g. ahora el arroz). Does not add to the cart.",
    inputSchema: EMPTY_SCHEMA,
    execute: runNextStand,
  });

  useWebMCP({
    name: "checkout",
    description:
      "Close the trip only after the shopper says they are done (ya está). Prints the ticket and walks to the door. Do not call this yourself.",
    inputSchema: EMPTY_SCHEMA,
    execute: runCheckout,
  });

  return null;
}
