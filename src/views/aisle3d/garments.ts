import * as THREE from "three";
import type { Sku } from "../../domain/types";

function cloth(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02, side: THREE.DoubleSide });
}

function garmentColor(sku: Sku): string {
  if (sku.kind === "vestido") return "#2c2432";
  if (sku.kind === "camisa") return "#efe8dc";
  if (sku.kind === "pantalon") return "#3a4d68";
  return "#c8b8a2";
}

function tag(skuId: string, object: THREE.Object3D): void {
  object.userData.skuId = skuId;
  object.userData.need = "vestir";
  object.traverse((child) => {
    child.userData.skuId = skuId;
    child.userData.need = "vestir";
  });
}

export function makeGarment(sku: Sku, scale = 1): THREE.Group {
  const group = new THREE.Group();
  const mat = cloth(garmentColor(sku));
  const dark = cloth("#1b1713");
  const kind = sku.kind === "marca blanca" ? "vestido" : sku.kind;

  if (kind === "vestido") {
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.34, 14), mat);
    torso.position.y = 0.9;
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.3, 0.52, 16), mat);
    skirt.position.y = 0.48;
    const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.16, 0.02), mat);
    strapL.position.set(-0.07, 1.14, 0);
    const strapR = strapL.clone();
    strapR.position.x = 0.07;
    group.add(torso, skirt, strapL, strapR);
  } else if (kind === "camisa") {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.12), mat);
    body.position.y = 0.88;
    const sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.1), mat);
    sleeveL.position.set(-0.22, 0.82, 0);
    sleeveL.rotation.z = 0.18;
    const sleeveR = sleeveL.clone();
    sleeveR.position.x = 0.22;
    sleeveR.rotation.z = -0.18;
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.13), dark);
    collar.position.y = 1.1;
    group.add(body, sleeveL, sleeveR, collar);
  } else {
    const waist = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.14), mat);
    waist.position.y = 0.86;
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.68, 0.13), mat);
    legL.position.set(-0.08, 0.42, 0);
    const legR = legL.clone();
    legR.position.x = 0.08;
    group.add(waist, legL, legR);
  }

  group.scale.setScalar(scale);
  tag(sku.id, group);
  group.castShadow = true;
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return group;
}
