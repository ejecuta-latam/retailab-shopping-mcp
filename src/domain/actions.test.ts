import { afterEach, describe, expect, it } from "vitest";
import { addToCart, goToAisle, showStand } from "./actions";
import { resetStore, store } from "./store";

afterEach(() => {
  resetStore();
});

describe("showStand", () => {
  it("walks to lacteos and opens 4 milk options", () => {
    const result = showStand("leche");
    const state = store.getState();

    expect(result.ok).toBe(true);
    expect(state.player.aisleId).toBe("lacteos");
    expect(state.stand?.need).toBe("leche");
    expect(state.stand?.skuIds).toHaveLength(4);
    expect(state.stand?.skuIds).toContain("leche-avena");
    expect(result).toMatchObject({
      data: {
        question: "¿Qué tipo de leche te gusta, o alguna de estas 4?",
      },
    });
  });

  it("accepts the English alias milk", () => {
    expect(showStand("milk").ok).toBe(true);
    expect(store.getState().stand?.need).toBe("leche");
  });

  it("replaces the previous stand", () => {
    showStand("leche");
    const next = showStand("arroz");
    expect(next.ok).toBe(true);
    expect(store.getState().player.aisleId).toBe("despensa");
    expect(store.getState().stand?.need).toBe("arroz");
    expect(store.getState().stand?.skuIds).toHaveLength(4);
  });

  it("rejects an unknown need", () => {
    const result = showStand("saffron");
    expect(result.ok).toBe(false);
    expect(store.getState().stand).toBeNull();
    expect(store.getState().pendingNeed).toBe("saffron");
  });
});

describe("addToCart", () => {
  it("adds a sku that is on the open stand", () => {
    showStand("leche");
    const result = addToCart("leche-avena");
    expect(result.ok).toBe(true);
    expect(store.getState().basket).toEqual([{ skuId: "leche-avena", qty: 1 }]);
  });

  it("refuses a sku that is not on the stand", () => {
    showStand("leche");
    const result = addToCart("arroz-redondo");
    expect(result.ok).toBe(false);
    expect(store.getState().basket).toEqual([]);
  });

  it("refuses add without a stand", () => {
    goToAisle("lacteos");
    const result = addToCart("leche-entera");
    expect(result.ok).toBe(false);
    expect(store.getState().basket).toEqual([]);
  });
});
