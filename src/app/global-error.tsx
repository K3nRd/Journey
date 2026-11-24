"use client";

// Se muestra si falla el layout principal. No hereda los estilos globales.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#07080a", color: "#f3f5f1", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
        <title>Journey · Error</title>
        <div style={{ maxWidth: 300, padding: 16 }}>
          <div style={{ fontSize: 48 }}>🧭</div>
          <h1 style={{ fontSize: 22 }}>Algo se desvió del camino</h1>
          <p style={{ color: "#8a9196", fontSize: 14 }}>Ocurrió un error inesperado. Tus datos están a salvo en tu teléfono.</p>
          <button
            onClick={() => retry()}
            style={{ marginTop: 12, height: 48, padding: "0 24px", borderRadius: 999, border: 0, fontWeight: 600, background: "linear-gradient(120deg,#e4ff7a,#c8f135 40%,#2ee6c0)", color: "#0a1100" }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
