import { useEffect, useRef } from "react";
import { useStore } from "../../hooks/useStore";
import { AisleScene } from "./AisleScene";

export function Aisle3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<AisleScene | null>(null);
  const state = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new AisleScene(canvas);
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.sync(state);
  }, [state]);

  return (
    <div className="aisle-3d" data-aisle={state.player.aisleId}>
      <canvas ref={canvasRef} />
    </div>
  );
}
