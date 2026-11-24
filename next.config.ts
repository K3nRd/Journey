import type { NextConfig } from "next";

// Política de contenido: solo se cargan recursos de la propia app, Supabase (cuentas)
// y Open Food Facts (escáner). Next.js necesita 'unsafe-inline' para sus scripts de arranque.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.openfoodfacts.org https://static.openfoodfacts.org",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://world.openfoodfacts.org",
  "media-src 'self' blob:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // La cámara solo para el escáner de códigos; nada de micrófono, ubicación ni pagos
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Las respuestas de la API con datos nunca se guardan en cachés intermedias
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      // El service worker siempre se revisa para que las actualizaciones lleguen rápido
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

export default nextConfig;
