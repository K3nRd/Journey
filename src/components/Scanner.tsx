"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ScanBarcode } from "lucide-react";
import { Button, inputCls } from "./ui";

export interface ScannedProduct {
  code: string;
  name: string;
  kcal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
  serving?: string;
}

async function lookup(code: string): Promise<ScannedProduct | null> {
  const r = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_es,brands,nutriments,serving_size`,
  );
  if (!r.ok) return null;
  const j = await r.json();
  if (j.status !== 1 || !j.product) return null;
  const p = j.product;
  const n = p.nutriments ?? {};
  const kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : 0);
  return {
    code,
    name: [p.product_name_es || p.product_name, p.brands?.split(",")[0]].filter(Boolean).join(" · ") || `Producto ${code}`,
    kcal100: Number(kcal) || 0,
    protein100: Number(n.proteins_100g) || 0,
    carbs100: Number(n.carbohydrates_100g) || 0,
    fat100: Number(n.fat_100g) || 0,
    serving: p.serving_size,
  };
}

/** Escáner de códigos de barras con la cámara + base de datos gratuita Open Food Facts. */
export function Scanner({ onFound }: { onFound: (p: ScannedProduct) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const search = async (c: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const p = await lookup(c);
      if (p) onFound(p);
      else setMsg("Producto no encontrado en Open Food Facts. Regístralo manualmente.");
    } catch {
      setMsg("Sin conexión. Inténtalo de nuevo.");
    }
    setBusy(false);
  };

  useEffect(() => {
    if (!active || !video.current) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(undefined, video.current!, (res) => {
          if (res && !cancelled) {
            cancelled = true;
            controls.stop();
            setActive(false);
            setCode(res.getText());
            search(res.getText());
          }
        });
        stop = () => controls.stop();
      } catch {
        setMsg("No se pudo abrir la cámara. Escribe el código a mano.");
        setActive(false);
      }
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="space-y-3">
      {active ? (
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video ref={video} className="aspect-[4/3] w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 -translate-y-1/2 bg-bad shadow-[0_0_12px_var(--bad)]" />
          <Button variant="secondary" size="sm" className="absolute bottom-2 right-2" onClick={() => setActive(false)}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={() => setActive(true)}>
          <ScanBarcode className="h-5 w-5" /> Escanear con la cámara
        </Button>
      )}
      <div className="flex gap-2">
        <input className={inputCls} inputMode="numeric" placeholder="O escribe el código" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
        <Button variant="secondary" className="h-12" disabled={code.length < 6 || busy} onClick={() => search(code)}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>
      {msg && <p className="text-sm text-warn">{msg}</p>}
      <p className="text-xs text-muted">Datos de Open Food Facts (gratis y colaborativo). Productos locales pueden no estar.</p>
    </div>
  );
}
