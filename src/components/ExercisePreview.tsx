"use client";

import { useEffect, useState } from "react";
import { exerciseImg } from "@/data/exercises";
import { Pause, Play } from "lucide-react";
import { cx } from "./ui";

/**
 * Vista previa animada: alterna entre la foto de posición inicial y final,
 * como un GIF, para ver el movimiento antes de hacerlo.
 */
export function ExercisePreview({
  id,
  size = "md",
  labels = false,
  className,
  speed = 1100,
}: {
  id: string;
  size?: "xs" | "sm" | "md" | "lg";
  labels?: boolean;
  className?: string;
  speed?: number;
}) {
  const [frame, setFrame] = useState<0 | 1>(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setFrame((f) => (f ? 0 : 1)), speed);
    return () => clearInterval(t);
  }, [playing, speed]);

  const dims = {
    xs: "h-12 w-16 rounded-lg",
    sm: "h-16 w-24 rounded-xl",
    md: "aspect-[3/2] w-full rounded-2xl",
    lg: "aspect-[3/2] w-full rounded-3xl",
  }[size];

  return (
    <div className={cx("relative shrink-0 overflow-hidden bg-surface-3", dims, className)}>
      {[0, 1].map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f}
          src={exerciseImg(id, f as 0 | 1)}
          alt={f === 0 ? "Posición inicial" : "Posición final"}
          loading="lazy"
          decoding="async"
          className={cx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            frame === f ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      {labels && (
        <>
          <div className="absolute left-2 top-2 flex gap-1">
            {(["Inicio", "Final"] as const).map((l, i) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setFrame(i as 0 | 1);
                }}
                className={cx(
                  "rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur",
                  frame === i ? "grad text-accent-ink" : "bg-black/50 text-white",
                )}
              >
                {i + 1}. {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
            aria-label={playing ? "Pausar" : "Reproducir"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </>
      )}
    </div>
  );
}
