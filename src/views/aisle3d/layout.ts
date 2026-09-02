import type { AisleId } from "../../domain/types";

export const EYE = 1.6;

export const AISLE_X: Record<Exclude<AisleId, "entrada">, number> = {
  lacteos: -9,
  despensa: -3,
  limpieza: 3,
  fresco: 9,
};

export const AISLE_Z0 = -4.5;
export const AISLE_Z1 = 4.5;

export type Rig = {
  position: [number, number, number];
  lookAt: [number, number, number];
};

export function cameraRig(aisleId: AisleId, standOpen: boolean): Rig {
  if (aisleId === "entrada") {
    return { position: [0, 1.65, 9.6], lookAt: [0, 1.42, 5.15] };
  }
  const x = AISLE_X[aisleId];
  if (standOpen) {
    return { position: [x, 1.55, 3.6], lookAt: [x, 1.18, 1.15] };
  }
  return { position: [x, EYE, 5.4], lookAt: [x, 1.25, -1.6] };
}

export const PRODUCT_AISLES = ["lacteos", "despensa", "limpieza", "fresco"] as const;
