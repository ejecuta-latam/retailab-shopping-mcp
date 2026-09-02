import { afterEach, describe, expect, it } from "vitest";
import {
  addToCart,
  checkout,
  compareOptions,
  giveUpProduct,
  goToAisle,
  nextStand,
  showStand,
  visualizeProduct,
} from "./actions";
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

  it("keeps a multi-need trip and walks it in order", () => {
    const start = showStand("necesito leche, arroz y jabón");
    expect(start.ok).toBe(true);
    expect(store.getState().player.aisleId).toBe("lacteos");
    expect(store.getState().stand?.need).toBe("leche");
    expect(store.getState().trip).toEqual({
      needs: ["leche", "arroz", "jabon"],
      done: [],
    });

    expect(nextStand().ok).toBe(true);
    expect(store.getState().player.aisleId).toBe("despensa");
    expect(store.getState().stand?.need).toBe("arroz");
    expect(store.getState().trip?.done).toEqual(["leche"]);

    expect(nextStand().ok).toBe(true);
    expect(store.getState().player.aisleId).toBe("limpieza");
    expect(store.getState().stand?.need).toBe("jabon");

    const end = nextStand();
    expect(end.ok).toBe(false);
    expect(store.getState().stand?.need).toBe("jabon");
  });
});

describe("checkout", () => {
  it("refuses an empty basket", () => {
    const result = checkout();
    expect(result.ok).toBe(false);
    expect(store.getState().ticket).toBeNull();
    expect(store.getState().player.aisleId).toBe("entrada");
  });

  it("prints a ticket and walks to the door", () => {
    showStand("leche");
    addToCart("leche-avena");
    const result = checkout();
    const state = store.getState();

    expect(result.ok).toBe(true);
    expect(state.player.aisleId).toBe("entrada");
    expect(state.stand).toBeNull();
    expect(state.basket).toEqual([]);
    expect(state.trip).toBeNull();
    expect(state.ticket?.total).toBeCloseTo(1.49);
    expect(state.ticket?.lines).toEqual([
      { skuId: "leche-avena", name: "Bebida de avena 1 L", qty: 1, total: 1.49 },
    ]);
  });
});

describe("compareOptions", () => {
  it("refuses without a stand", () => {
    expect(compareOptions().ok).toBe(false);
  });

  it("advises on the four without adding", () => {
    showStand("leche");
    const result = compareOptions();
    expect(result.ok).toBe(true);
    expect(store.getState().basket).toEqual([]);
    expect(result).toMatchObject({
      data: {
        need: "leche",
        options: [
          { skuId: "leche-entera", storeBrand: false },
          { skuId: "leche-desnatada", storeBrand: false },
          { skuId: "leche-avena", why: "Sin lactosa, de avena" },
          { skuId: "leche-blanca", storeBrand: true, tags: ["marca blanca", "más barato"] },
        ],
      },
    });
  });
});

describe("visualizeProduct", () => {
  it("opens moda for dress and lets you put it back", () => {
    expect(showStand("dress").ok).toBe(true);
    expect(store.getState().player.aisleId).toBe("moda");
    expect(store.getState().stand?.skuIds).toHaveLength(4);

    expect(visualizeProduct("vestir-vestido").ok).toBe(true);
    expect(store.getState().previewSkuId).toBe("vestir-vestido");
    expect(store.getState().basket).toEqual([]);

    expect(giveUpProduct().ok).toBe(true);
    expect(store.getState().previewSkuId).toBeNull();
    expect(store.getState().basket).toEqual([]);
  });

  it("refuses to visualize groceries", () => {
    showStand("leche");
    expect(visualizeProduct("leche-avena").ok).toBe(false);
    expect(store.getState().previewSkuId).toBeNull();
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
