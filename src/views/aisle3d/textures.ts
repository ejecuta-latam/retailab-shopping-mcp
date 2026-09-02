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

export function packFaceTexture(kind: string, brand: string, fill: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 256, 512);
  ctx.fillStyle = "#fff8ef";
  ctx.fillRect(18, 300, 220, 170);
  ctx.fillStyle = "#1b1713";
  ctx.textAlign = "center";
  ctx.font = "700 28px ui-sans-serif, system-ui, sans-serif";
  wrap(ctx, kind.toUpperCase(), 128, 360, 200);
  ctx.font = "400 22px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#5c534a";
  ctx.fillText(brand, 128, 430);
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
      row += 32;
    } else {
      line = next;
    }
  }
  ctx.fillText(line, x, row);
}
