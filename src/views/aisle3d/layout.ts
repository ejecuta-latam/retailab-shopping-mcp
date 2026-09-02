import type { AisleId } from "../../domain/types";

export const EYE = 1.6;

export const AISLE_X: Record<Exclude<AisleId, "entrada">, number> = {
  lacteos: -9,
  despensa: -3,
  limpieza: 3,
  fresco: 9,
  moda: 15,
};

export const AISLE_Z0 = -4.5;
export const AISLE_Z1 = 4.5;

export type Rig = {
  position: [number, number, number];
  lookAt: [number, number, number];
};

export function cameraRig(aisleId: AisleId, standOpen: boolean, atDoor = false, preview = false): Rig {
  if (atDoor) {
    return { position: [0, 1.62, 12.2], lookAt: [0, 1.35, 6.5] };
  }
  if (aisleId === "entrada") {
    return { position: [0, 1.65, 9.6], lookAt: [0, 1.42, 5.15] };
  }
  const x = AISLE_X[aisleId];
  if (preview) {
    return { position: [x + 0.12, 1.38, 1.88], lookAt: [x, 1.18, 1.22] };
  }
  if (standOpen) {
    return { position: [x, 1.55, 3.6], lookAt: [x, 1.18, 1.15] };
  }
  return { position: [x, EYE, 5.4], lookAt: [x, 1.25, -1.6] };
}

export const PRODUCT_AISLES = ["lacteos", "despensa", "limpieza", "fresco", "moda"] as const;
