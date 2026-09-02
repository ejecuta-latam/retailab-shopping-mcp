# Vista 3D

Raw Three.js in a canvas. The store lives in `AisleScene`; React only mounts it and forwards the domain snapshot.

- `player.aisleId` → camera rig (standing height)
- `stand` → counter + 4 packs in that aisle
- `focusSkuId` → lift / emissive on the chosen pack
- `add_to_cart` witness → the stand pack pops and stays, so you can add it again
- Click a 3D stand pack → `addToCart`

Do not put aisle rules here. Call `src/domain/actions`.
