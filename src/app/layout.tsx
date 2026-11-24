import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/components/Providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Journey · Mi transformación",
  description: "Entrenamiento, nutrición y hábitos para tu transformación física.",
  appleWebApp: { capable: true, title: "Journey", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0f0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// Aplica el tema antes de pintar para evitar parpadeo.
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem('journey-v1')||'{}');var t=(s.state&&s.state.theme)||'dark';if(t==='system'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="dark" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <Suspense
          fallback={
            <div className="grid min-h-dvh place-items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-3 border-t-accent" />
            </div>
          }
        >
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
