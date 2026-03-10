import { useRef, useEffect } from "react";

interface IdeaCardProps {
  title: string;
  onClick: () => void;
}

export function IdeaCard({ title, onClick }: IdeaCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const maxTilt = 6; // degrees
    const ease = 0.12;

    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    if (isTouch) return; // disable tilt on touch devices

    function onMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const nx = (mx / rect.width) - 0.5;
      const ny = (my / rect.height) - 0.5;
      targetX = clamp(-ny * maxTilt, -maxTilt, maxTilt);
      targetY = clamp(nx * maxTilt, -maxTilt, maxTilt);
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
    }

    function clamp(v: number, a: number, b: number) {
      return Math.max(a, Math.min(b, v));
    }

    function loop() {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      el.style.transform = `perspective(900px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
      raf = requestAnimationFrame(loop);
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (el) el.style.transform = "";
    };
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="relative w-full h-32 rounded-xl glass-panel p-5 cursor-pointer transition-colors flex flex-col justify-center group"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <div
        style={{ transform: "translateZ(18px)" }}
        className="font-medium text-[15px] leading-snug text-white/70 group-hover:text-white transition-colors"
      >
        {title}
      </div>
      <div
        style={{ transform: "translateZ(12px)" }}
        className="mt-3 text-xs text-white/30 group-hover:text-white/50 transition-colors flex items-center"
      >
        Use this idea <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
      </div>
    </div>
  );
}
