import { useEffect, useRef } from "react";

export function LifeCanvas({
  cols,
  total,
  lived,
  mode,
}: {
  cols: number;
  total: number;
  lived: number;
  mode: "weeks" | "years";
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const paint = () => {
      const cssW = parent.clientWidth;
      const gap = mode === "years" ? 6 : 2;
      const cell = mode === "years" ? Math.max(18, (cssW - gap * (cols - 1)) / cols) : Math.max(3.2, (cssW - gap * (cols - 1)) / cols);
      const rows = Math.ceil(total / cols);
      const cssH = rows * cell + (rows - 1) * gap;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);
      const styles = getComputedStyle(document.documentElement);
      const livedColor = styles.getPropertyValue("--lived").trim() || "#cbbba3";
      const remain = styles.getPropertyValue("--remain-dot").trim() || "#e4d9c8";
      const accent = styles.getPropertyValue("--accent").trim() || "#c45c26";
      const radius = mode === "years" ? 6 : 1.1;
      for (let i = 0; i < total; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = c * (cell + gap);
        const y = r * (cell + gap);
        ctx.fillStyle = i < lived ? livedColor : i === lived ? accent : remain;
        roundRect(ctx, x, y, cell, cell, radius);
        ctx.fill();
      }
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [cols, total, lived, mode]);

  return <canvas ref={ref} className="block w-full" />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
