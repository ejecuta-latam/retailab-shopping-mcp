import * as THREE from "three";

export function canvasMap(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  return map;
}

export function signTexture(title: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#1b1713";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f4efe6";
  ctx.font = "700 92px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title.toUpperCase(), 512, 128);
  return canvas;
}

export function packFaceTexture(input: {
  kind: string;
  brand: string;
  fill: string;
  price: string;
  storeBrand?: boolean;
}): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = input.fill;
  ctx.fillRect(0, 0, 256, 512);
  ctx.fillStyle = "#fff8ef";
  ctx.fillRect(16, 168, 224, 328);
  if (input.storeBrand) {
    ctx.fillStyle = "#c45c26";
    ctx.fillRect(16, 168, 224, 46);
    ctx.fillStyle = "#fff8ef";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "700 22px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("MARCA BLANCA", 128, 191);
  }
  ctx.fillStyle = "#1b1713";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const kindTop = input.storeBrand ? 250 : 228;
  ctx.font = "700 30px ui-sans-serif, system-ui, sans-serif";
  wrap(ctx, input.kind.toUpperCase(), 128, kindTop, 200);
  ctx.font = "700 44px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(input.price, 128, 360);
  ctx.font = "400 22px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#5c534a";
  ctx.fillText(input.brand, 128, 408);
  return canvas;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number) {
  const words = text.split(" ");
  let line = "";
  let row = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      ctx.fillText(line, x, row);
      line = word;
      row += 30;
    } else {
      line = next;
    }
  }
  ctx.fillText(line, x, row);
}
