import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[80dvh] place-items-center text-center">
      <div className="max-w-xs space-y-4">
        <div className="text-5xl">🗺️</div>
        <h1 className="font-display text-2xl font-bold">Esta página no existe</h1>
        <p className="text-sm text-muted">Puede que el enlace esté mal o que la página se haya movido.</p>
        <Link href="/" className="tap grad glow inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-accent-ink">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
