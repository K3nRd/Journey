"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Lock, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { savePhoto, loadPhoto, deletePhoto } from "@/lib/photos";
import { dateKey, fmtDate, uid, daysBetween, addDays } from "@/lib/date";
import { toggleItem } from "@/lib/actions";
import { PageHeader, Card, Button, Segmented, SectionTitle, Sheet, cx } from "@/components/ui";
import type { PhotoMeta } from "@/lib/types";

const POSES: { value: PhotoMeta["pose"]; label: string }[] = [
  { value: "frente", label: "Frente" },
  { value: "lado", label: "Lado" },
  { value: "espalda", label: "Espalda" },
];

function usePhotoUrl(id?: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let u: string | null = null;
    let alive = true;
    loadPhoto(id).then((x) => {
      u = x;
      if (alive) setUrl(x);
    });
    return () => {
      alive = false;
      if (u) URL.revokeObjectURL(u);
      setUrl(null);
    };
  }, [id]);
  return url;
}

function Thumb({ meta, onClick }: { meta: PhotoMeta; onClick?: () => void }) {
  const url = usePhotoUrl(meta.id);
  return (
    <button onClick={onClick} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt={meta.pose} className="h-full w-full object-cover" />}
      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] capitalize text-white">{meta.pose}</span>
    </button>
  );
}

export default function Fotos() {
  const photos = useApp((s) => s.photos);
  const addPhoto = useApp((s) => s.addPhoto);
  const removePhoto = useApp((s) => s.removePhoto);
  const startDate = useApp((s) => s.profile.startDate);
  const [pose, setPose] = useState<PhotoMeta["pose"]>("frente");
  const [view, setView] = useState<PhotoMeta | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const dates = useMemo(() => [...new Set(photos.map((p) => p.date))].sort().reverse(), [photos]);
  const [a, setA] = useState<string | undefined>();
  const [b, setB] = useState<string | undefined>();
  const [cmpPose, setCmpPose] = useState<PhotoMeta["pose"]>("frente");
  const [split, setSplit] = useState(50);

  const older = a ?? dates.at(-1);
  const newer = b ?? dates[0];
  const pa = photos.find((p) => p.date === older && p.pose === cmpPose);
  const pb = photos.find((p) => p.date === newer && p.pose === cmpPose);
  const ua = usePhotoUrl(pa?.id);
  const ub = usePhotoUrl(pb?.id);

  const days = daysBetween(startDate, dateKey());
  const nextPhoto = addDays(startDate, Math.ceil(Math.max(1, days) / 28) * 28);

  const onFile = async (f?: File) => {
    if (!f) return;
    const id = uid();
    await savePhoto(id, f);
    addPhoto({ id, date: dateKey(), pose });
    toggleItem(dateKey(), { id: "fotos" }, undefined, true);
  };

  return (
    <div>
      <PageHeader title="Fotos de progreso" subtitle="Cada 4 semanas" back="/progreso" />
      <Card className="flex items-start gap-3 text-sm text-muted">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-good" />
        <p>
          Tus fotos se guardan <b className="text-fg">solo en este teléfono</b>, nunca se suben a internet. Próximas fotos: <b className="text-fg">{fmtDate(nextPhoto)}</b>.
        </p>
      </Card>

      <SectionTitle>Nueva foto</SectionTitle>
      <Segmented value={pose} onChange={setPose} options={POSES} />
      <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <Button className="mt-2 w-full" onClick={() => file.current?.click()}>
        <Camera className="h-5 w-5" /> Tomar foto de {pose}
      </Button>
      <p className="mt-1.5 text-xs text-muted">Misma luz, misma hora (mañana), misma ropa y misma distancia cada vez.</p>

      {dates.length >= 2 && (
        <>
          <SectionTitle>Comparar</SectionTitle>
          <Segmented value={cmpPose} onChange={setCmpPose} options={POSES} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select className="h-10 rounded-xl border border-line bg-surface-2 px-2 text-sm" value={older} onChange={(e) => setA(e.target.value)}>
              {dates.map((d) => (
                <option key={d} value={d}>
                  Antes: {fmtDate(d, false)}
                </option>
              ))}
            </select>
            <select className="h-10 rounded-xl border border-line bg-surface-2 px-2 text-sm" value={newer} onChange={(e) => setB(e.target.value)}>
              {dates.map((d) => (
                <option key={d} value={d}>
                  Después: {fmtDate(d, false)}
                </option>
              ))}
            </select>
          </div>
          {ua && ub ? (
            <div className="relative mt-2 aspect-[3/4] overflow-hidden rounded-2xl bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ub} alt="Después" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ua} alt="Antes" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${split}%` }} />
              <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Antes</span>
              <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Después</span>
              <input
                type="range"
                min={0}
                max={100}
                value={split}
                onChange={(e) => setSplit(Number(e.target.value))}
                className="absolute inset-x-4 bottom-4 accent-[var(--accent)]"
                aria-label="Comparar"
              />
            </div>
          ) : (
            <Card className="mt-2 text-sm text-muted">Falta la foto de «{cmpPose}» en alguna de esas fechas.</Card>
          )}
        </>
      )}

      <SectionTitle>Historial</SectionTitle>
      {dates.length === 0 ? (
        <Card className="text-sm text-muted">Toma tus primeras fotos: serán tu punto de partida.</Card>
      ) : (
        dates.map((d) => (
          <div key={d} className="mb-3">
            <div className="mb-1.5 text-sm font-semibold">{fmtDate(d)}</div>
            <div className="grid grid-cols-3 gap-2">
              {photos
                .filter((p) => p.date === d)
                .map((p) => (
                  <Thumb key={p.id} meta={p} onClick={() => setView(p)} />
                ))}
            </div>
          </div>
        ))
      )}

      <Sheet open={Boolean(view)} onClose={() => setView(null)} title={view ? `${fmtDate(view.date)} · ${view.pose}` : ""}>
        {view && (
          <div className="space-y-3">
            <BigPhoto id={view.id} />
            <Button
              variant="danger"
              className="w-full"
              onClick={async () => {
                await deletePhoto(view.id);
                removePhoto(view.id);
                setView(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> Borrar foto
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function BigPhoto({ id }: { id: string }) {
  const url = usePhotoUrl(id);
  // eslint-disable-next-line @next/next/no-img-element
  return <div className={cx("aspect-[3/4] overflow-hidden rounded-2xl bg-surface-2")}>{url && <img src={url} alt="" className="h-full w-full object-cover" />}</div>;
}
