import * as THREE from "three";
import { addToCart, showStand, visualizeProduct } from "../../domain/actions";
import { aisleById, canVisualize, formatMoney, isStoreBrand, skuById, skusInAisle } from "../../domain/catalog";
import { makeGarment } from "./garments";
import type { Sku } from "../../domain/types";
import type { AisleId, State } from "../../domain/types";
import { AISLE_X, AISLE_Z0, AISLE_Z1, cameraRig, PRODUCT_AISLES } from "./layout";
import { canvasMap, packFaceTexture, signTexture } from "./textures";

const hex = (value: string) => new THREE.Color(value);

const SHELF_YS = [0.38, 0.98, 1.58];
const GONDOLA_X = 1.32;
const SHELF_DEPTH = 0.4;
const AISLE_LEN = AISLE_Z1 - AISLE_Z0;

function packSize(sku: Sku): [number, number, number] {
  if (sku.need === "leche") return [0.16, 0.4, 0.12];
  if (sku.need === "arroz") return [0.18, 0.28, 0.11];
  if (sku.need === "jabon") return [0.14, 0.26, 0.1];
  if (sku.need === "vestir") return [0.22, 0.7, 0.14];
  return [0.2, 0.16, 0.16];
}

function packColor(sku: Sku): string {
  const byKind: Record<string, string> = {
    entera: "#d9c27a",
    desnatada: "#e8e2d2",
    avena: "#c4a15a",
    "marca blanca": "#f0ece3",
    redondo: "#d8c48a",
    largo: "#c9b27a",
    integral: "#8a6a3d",
    manos: "#7aa0a8",
    platos: "#4f7c8a",
    ropa: "#3f6b5a",
    rama: "#c45c3a",
    pera: "#c46b4a",
    cherry: "#b33b32",
    triturado: "#8a3a2c",
    vestido: "#2c2432",
    camisa: "#efe8dc",
    pantalon: "#3a4d68",
  };
  return byKind[sku.kind] ?? aisleById(sku.aisleId).hue;
}

function skuFromObject(object: THREE.Object3D | undefined): string | undefined {
  let current: THREE.Object3D | undefined = object;
  while (current) {
    if (typeof current.userData.skuId === "string") return current.userData.skuId;
    current = current.parent ?? undefined;
  }
  return undefined;
}

export class AisleScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private lastTick = performance.now();
  private raf = 0;
  private disposed = false;
  private target = cameraRig("entrada", false);
  private look = new THREE.Vector3(...this.target.lookAt);
  private standGroup = new THREE.Group();
  private crateGroup = new THREE.Group();
  private crateFill = new THREE.Group();
  private lastCrateKey = "";
  private packMeshes = new Map<string, THREE.Object3D>();
  private shelfClicks: THREE.Object3D[] = [];
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private lastStandKey = "";
  private lastFocus: string | null = null;
  private lastWitnessAt = 0;
  private take: { skuId: string; mesh: THREE.Object3D; origin: THREE.Vector3; t: number } | null = null;
  private observer: ResizeObserver | null = null;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = hex("#cbb79a");
    this.scene.fog = new THREE.Fog("#cbb79a", 16, 42);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.08, 80);
    this.camera.position.set(...this.target.position);

    this.buildStore();
    this.standGroup.name = "stand";
    this.crateGroup.name = "crate";
    this.buildCrate();
    this.scene.add(this.standGroup, this.crateGroup);

    this.resize();
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(this.canvas.parentElement ?? this.canvas);
    requestAnimationFrame(this.resize);
    this.canvas.addEventListener("pointerdown", this.onPointer);
    window.addEventListener("resize", this.resize);
    this.tick();
  }

  sync(state: State): void {
    this.target = cameraRig(
      state.player.aisleId,
      state.stand !== null,
      state.ticket !== null,
      state.previewSkuId !== null,
    );
    this.refreshStand(state);
    this.refreshCrate(state);
    this.purgeGhosts();
    if (state.lastWitness && state.lastWitness.at !== this.lastWitnessAt) {
      this.lastWitnessAt = state.lastWitness.at;
      if (state.lastWitness.tool === "add_to_cart") this.playTake(state.lastWitness.detail);
    }
    for (const [skuId, mesh] of this.packMeshes) {
      if (this.take?.skuId === skuId) continue;
      mesh.visible = true;
      const preview = state.previewSkuId === skuId;
      const hot = skuId === state.focusSkuId;
      mesh.scale.setScalar(preview ? 1.28 : hot ? 1.08 : 1);
    }
    this.applyFocus(state.previewSkuId ?? state.focusSkuId);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    this.canvas.removeEventListener("pointerdown", this.onPointer);
    window.removeEventListener("resize", this.resize);
    this.renderer.dispose();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      }
    });
  }

  private resize = (): void => {
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private tick = (): void => {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTick) / 1000, 0.05);
    this.lastTick = now;
    const ease = 1 - Math.exp(-dt * 3.2);
    this.camera.position.lerp(new THREE.Vector3(...this.target.position), ease);
    this.look.lerp(new THREE.Vector3(...this.target.lookAt), ease);
    this.camera.lookAt(this.look);
    this.stepTake(dt);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  private onPointer = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const standHits = this.raycaster.intersectObjects([...this.packMeshes.values()], true);
    const standHit = standHits[0]?.object;
    const standId = skuFromObject(standHit);
    if (standId) {
      const sku = skuById(standId);
      if (sku && canVisualize(sku)) visualizeProduct(standId);
      else addToCart(standId);
      return;
    }
    const shelfHits = this.raycaster.intersectObjects(this.shelfClicks, true);
    const need = shelfHits[0]?.object.userData.need as string | undefined;
    if (need) showStand(need);
  };

  private buildStore(): void {
    const matFloor = new THREE.MeshStandardMaterial({ color: "#d7c4a4", roughness: 0.92 });
    const matWall = new THREE.MeshStandardMaterial({ color: "#e6d7c0", roughness: 0.88 });
    const matCeil = new THREE.MeshStandardMaterial({ color: "#efe4d2", roughness: 1 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(42, 28), matFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(42, 28), matCeil);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.55;
    this.scene.add(ceiling);

    const wallGeoA = new THREE.BoxGeometry(42, 3.5, 0.35);
    const wallGeoB = new THREE.BoxGeometry(0.35, 3.5, 26);
    const back = new THREE.Mesh(wallGeoA, matWall);
    back.position.set(0, 1.75, -12.2);
    const front = new THREE.Mesh(wallGeoA.clone(), matWall);
    front.position.set(0, 1.75, 13.2);
    const left = new THREE.Mesh(wallGeoB, matWall);
    left.position.set(-20.8, 1.75, 0.5);
    const right = new THREE.Mesh(wallGeoB.clone(), matWall);
    right.position.set(20.8, 1.75, 0.5);
    this.scene.add(back, front, left, right);

    this.scene.add(new THREE.AmbientLight("#f3e7d4", 0.55));
    this.scene.add(new THREE.HemisphereLight("#fff6e8", "#8a7358", 0.7));
    const sun = new THREE.DirectionalLight("#fff3dc", 1.05);
    sun.position.set(8, 12, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);

    this.buildFacade();

    for (const aisleId of PRODUCT_AISLES) {
      this.scene.add(this.buildAisle(aisleId));
    }
  }

  private buildFacade(): void {
    const mat = new THREE.MeshStandardMaterial({ color: "#dfd0b8", roughness: 0.84 });
    const z = AISLE_Z1 + 0.7;
    const spans: Array<[number, number]> = [
      [-20.6, -10.15],
      [-7.85, -4.15],
      [-1.85, 1.85],
      [4.15, 7.85],
      [10.15, 13.85],
      [16.15, 20.6],
    ];
    for (const [a, b] of spans) {
      const width = b - a;
      const wall = new THREE.Mesh(new THREE.BoxGeometry(width, 3.5, 0.22), mat);
      wall.position.set((a + b) / 2, 1.75, z);
      this.scene.add(wall);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(42, 0.45, 0.22), mat);
    lintel.position.set(0, 3.32, z);
    this.scene.add(lintel);
  }

  private buildAisle(aisleId: Exclude<AisleId, "entrada">): THREE.Group {
    if (aisleId === "moda") return this.buildModaAisle();
    const aisle = aisleById(aisleId);
    const group = new THREE.Group();
    group.position.x = AISLE_X[aisleId];
    const wood = new THREE.MeshStandardMaterial({ color: "#5c4634", roughness: 0.72 });
    const plank = new THREE.MeshStandardMaterial({ color: "#cbb396", roughness: 0.62 });
    const metal = new THREE.MeshStandardMaterial({ color: "#2a241e", roughness: 0.55 });

    for (const side of [-1, 1] as const) {
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.05, AISLE_LEN), metal);
      back.position.set(side * (GONDOLA_X + SHELF_DEPTH / 2 + 0.04), 1.12, 0);
      group.add(back);

      const kick = new THREE.Mesh(new THREE.BoxGeometry(SHELF_DEPTH + 0.08, 0.14, AISLE_LEN), wood);
      kick.position.set(side * GONDOLA_X, 0.07, 0);
      group.add(kick);

      const endcap = new THREE.Mesh(
        new THREE.BoxGeometry(SHELF_DEPTH + 0.1, 2.05, 0.08),
        new THREE.MeshStandardMaterial({ color: aisle.hue, roughness: 0.55 }),
      );
      endcap.position.set(side * GONDOLA_X, 1.12, AISLE_Z1);
      group.add(endcap);

      for (const z of [AISLE_Z0 + 0.08, AISLE_Z1 - 0.08]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 2.05, 0.07), metal);
        post.position.set(side * (GONDOLA_X + 0.14), 1.12, z);
        group.add(post);
      }

      for (const y of SHELF_YS) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(SHELF_DEPTH, 0.045, AISLE_LEN - 0.12), plank);
        board.position.set(side * GONDOLA_X, y, 0);
        board.receiveShadow = true;
        group.add(board);
      }
    }

    const skus = skusInAisle(aisleId);
    skus.forEach((sku, index) => {
      const shelfY = SHELF_YS[index % SHELF_YS.length];
      const side = index % 2 === 0 ? -1 : 1;
      const slot = Math.floor(index / 2);
      const pack = this.makePack(sku, 1);
      const [, h] = packSize(sku);
      pack.position.set(side * (GONDOLA_X - 0.06), shelfY + 0.022 + h / 2, 3.2 - slot * 1.05);
      pack.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      pack.userData.need = sku.need;
      this.shelfClicks.push(pack);
      group.add(pack);
    });

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.06, AISLE_LEN - 0.4),
      new THREE.MeshStandardMaterial({ color: "#fff6d6", emissive: "#f4e0a8", emissiveIntensity: 1.8 }),
    );
    lamp.position.set(0, 3.28, 0);
    group.add(lamp);
    const light = new THREE.PointLight("#fff1d0", 18, 9, 2);
    light.position.set(0, 3.05, 0);
    group.add(light);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.42, 0.08),
      new THREE.MeshStandardMaterial({
        map: canvasMap(signTexture(aisle.name)),
        roughness: 0.45,
      }),
    );
    sign.position.set(0, 2.55, AISLE_Z1 + 0.2);
    group.add(sign);

    return group;
  }

  private buildModaAisle(): THREE.Group {
    const aisle = aisleById("moda");
    const group = new THREE.Group();
    group.position.x = AISLE_X.moda;
    const metal = new THREE.MeshStandardMaterial({ color: "#2a241e", roughness: 0.5 });
    const wood = new THREE.MeshStandardMaterial({ color: "#5c4634", roughness: 0.7 });

    for (const side of [-1, 1] as const) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, AISLE_LEN - 0.4), metal);
      rail.position.set(side * 1.15, 1.85, 0);
      group.add(rail);
      for (const z of [AISLE_Z0 + 0.2, 0, AISLE_Z1 - 0.2]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.05), metal);
        post.position.set(side * 1.15, 0.95, z);
        group.add(post);
      }
      const kick = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, AISLE_LEN), wood);
      kick.position.set(side * 1.15, 0.06, 0);
      group.add(kick);
    }

    const skus = skusInAisle("moda");
    skus.forEach((sku, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      const slot = Math.floor(index / 2);
      const garment = makeGarment(sku, 0.85);
      garment.position.set(side * 1.05, 0.72, 2.6 - slot * 1.4);
      garment.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      this.shelfClicks.push(garment);
      group.add(garment);
    });

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.06, AISLE_LEN - 0.4),
      new THREE.MeshStandardMaterial({ color: "#fff6d6", emissive: "#f4e0a8", emissiveIntensity: 1.8 }),
    );
    lamp.position.set(0, 3.28, 0);
    group.add(lamp);
    const light = new THREE.PointLight("#fff1d0", 18, 9, 2);
    light.position.set(0, 3.05, 0);
    group.add(light);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.42, 0.08),
      new THREE.MeshStandardMaterial({
        map: canvasMap(signTexture(aisle.name)),
        roughness: 0.45,
      }),
    );
    sign.position.set(0, 2.55, AISLE_Z1 + 0.2);
    group.add(sign);
    return group;
  }

  private makeDisplay(sku: Sku, faceScale: number): THREE.Object3D {
    if (canVisualize(sku)) return makeGarment(sku, faceScale);
    return this.makePack(sku, faceScale);
  }

  private makePack(sku: Sku, faceScale: number): THREE.Mesh {
    const [w, h, d] = packSize(sku);
    const color = packColor(sku);
    const body = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.03 });
    const face = new THREE.MeshStandardMaterial({
      map: canvasMap(
        packFaceTexture({
          kind: sku.kind,
          brand: sku.brand,
          fill: color,
          price: formatMoney(sku.price),
          storeBrand: isStoreBrand(sku),
        }),
      ),
      roughness: 0.48,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w * faceScale, h * faceScale, d * faceScale), [
      body,
      body,
      body,
      body,
      face,
      body,
    ]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.skuId = sku.id;
    return mesh;
  }

  private refreshStand(state: State): void {
    const key = state.stand ? `${state.player.aisleId}:${state.stand.skuIds.join(",")}` : "";
    if (key === this.lastStandKey) return;
    this.lastStandKey = key;
    this.take = null;
    this.packMeshes.clear();
    this.standGroup.clear();
    this.lastFocus = null;

    if (!state.stand || state.player.aisleId === "entrada") {
      this.standGroup.visible = false;
      return;
    }

    this.standGroup.visible = true;
    this.standGroup.position.set(AISLE_X[state.player.aisleId], 0, 1.35);

    const wood = new THREE.MeshStandardMaterial({ color: "#4a3728", roughness: 0.6 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.07, 0.72), wood);
    top.position.y = 0.92;
    top.castShadow = true;
    top.receiveShadow = true;
    this.standGroup.add(top);
    for (const x of [-1.05, 1.05]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.92, 0.07), wood);
      leg.position.set(x, 0.46, 0.28);
      this.standGroup.add(leg);
      const legB = leg.clone();
      legB.position.z = -0.28;
      this.standGroup.add(legB);
    }

    state.stand.skuIds.forEach((skuId, index) => {
      const sku = skuById(skuId);
      if (!sku) return;
      const item = this.makeDisplay(sku, canVisualize(sku) ? 0.95 : 1.15);
      const y = canVisualize(sku) ? 0.955 : 0.955 + (packSize(sku)[1] * 1.15) / 2;
      item.position.set(-0.78 + index * 0.52, y, 0);
      item.userData.origin = item.position.clone();
      this.standGroup.add(item);
      this.packMeshes.set(skuId, item);
    });
  }

  private applyFocus(focusSkuId: string | null): void {
    if (focusSkuId === this.lastFocus) return;
    this.lastFocus = focusSkuId;
    for (const [skuId, mesh] of this.packMeshes) {
      if (this.take?.skuId === skuId) continue;
      const hot = skuId === focusSkuId;
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive = hex(hot ? "#c45c26" : "#000000");
          child.material.emissiveIntensity = hot ? 0.2 : 0;
        }
      });
    }
  }

  private playTake(skuId: string): void {
    const mesh = this.packMeshes.get(skuId);
    if (!mesh) return;
    if (!mesh.userData.origin) {
      mesh.userData.origin = mesh.position.clone();
    }
    const origin = mesh.userData.origin as THREE.Vector3;
    mesh.visible = true;
    this.take = { skuId, mesh, origin, t: 0 };
  }

  private stepTake(dt: number): void {
    if (!this.take) return;
    this.take.t += dt * 3.4;
    const u = Math.min(this.take.t, 1);
    const { mesh, origin } = this.take;
    const k = u < 0.5 ? u * 2 : (1 - u) * 2;
    mesh.scale.setScalar(Math.max(0.12, 1 - k * 0.88));
    mesh.position.set(origin.x, origin.y + k * 0.28, origin.z);
    mesh.rotation.y = k * 0.6;
    mesh.visible = true;
    if (u < 1) return;
    mesh.rotation.y = 0;
    mesh.position.copy(origin);
    mesh.scale.setScalar(1);
    this.take = null;
  }

  private buildCrate(): void {
    const wood = new THREE.MeshStandardMaterial({ color: "#6a4a2e", roughness: 0.7 });
    const slat = new THREE.MeshStandardMaterial({ color: "#8a6238", roughness: 0.62 });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.38), wood);
    floor.position.y = 0.12;
    floor.castShadow = true;
    floor.receiveShadow = true;
    this.crateGroup.add(floor);
    for (const [x, z, w, d] of [
      [-0.24, 0, 0.04, 0.38],
      [0.24, 0, 0.04, 0.38],
      [0, -0.17, 0.52, 0.04],
      [0, 0.17, 0.52, 0.04],
    ] as const) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), slat);
      wall.position.set(x, 0.24, z);
      wall.castShadow = true;
      this.crateGroup.add(wall);
    }
    const tag = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.07, 0.02),
      new THREE.MeshStandardMaterial({ color: "#1b1713", roughness: 0.5 }),
    );
    tag.position.set(0, 0.36, 0.2);
    this.crateGroup.add(tag);
    this.crateFill.name = "crate-fill";
    this.crateGroup.add(this.crateFill);
    this.crateGroup.visible = false;
  }

  private refreshCrate(state: State): void {
    const show = state.ticket === null && (state.stand !== null || state.basket.length > 0);
    this.crateGroup.visible = show;
    if (!show) {
      this.crateFill.clear();
      this.lastCrateKey = "";
      return;
    }

    if (state.player.aisleId === "entrada") {
      this.crateGroup.position.set(0.7, 0, 8.4);
    } else {
      this.crateGroup.position.set(AISLE_X[state.player.aisleId] + 0.62, 0, 2.72);
    }
    this.crateGroup.rotation.y = -0.15;

    const key = state.basket.map((line) => `${line.skuId}:${line.qty}`).join("|");
    if (key === this.lastCrateKey) return;
    this.lastCrateKey = key;
    this.crateFill.clear();

    let slot = 0;
    for (const line of state.basket) {
      const sku = skuById(line.skuId);
      if (!sku) continue;
      for (let qty = 0; qty < line.qty && slot < 8; qty += 1) {
        const pack = this.makeDisplay(sku, canVisualize(sku) ? 0.28 : 0.52);
        const [, h] = packSize(sku);
        const col = slot % 2;
        const row = Math.floor(slot / 2);
        const y = canVisualize(sku) ? 0.16 + row * 0.13 : 0.16 + (h * 0.52) / 2 + row * 0.13;
        pack.position.set(-0.1 + col * 0.2, y, 0);
        pack.userData.crateItem = true;
        this.crateFill.add(pack);
        slot += 1;
      }
    }
  }

  private purgeGhosts(): void {
    const doomed: THREE.Object3D[] = [];
    for (const child of this.scene.children) {
      if (child === this.standGroup || child === this.crateGroup) continue;
      if (child.userData.flyGhost || child.userData.skuId) doomed.push(child);
    }
    for (const leftover of doomed) this.scene.remove(leftover);
  }
}
