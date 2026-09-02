# Vista 3D

Raw Three.js in a canvas. The store lives in `AisleScene`; React only mounts it and forwards the domain snapshot.

- `player.aisleId` → camera rig (standing height)
- `ticket` → camera at the door, looking back at the hall
- `stand` → counter + 4 packs in that aisle (price, kind, and marca blanca on the face)
- `basket` → crate beside the stand fills with mini packs; the stand packs stay
- `focusSkuId` → lift / emissive on the chosen pack
- `previewSkuId` → near camera on a Moda garment; `give_up_product` walks back
- `add_to_cart` witness → the stand pack pops and stays, so you can add it again
- Click a 3D stand pack → `addToCart`

Do not put aisle rules here. Call `src/domain/actions`.
