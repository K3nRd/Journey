import type { Metadata, Viewport } from "next";
import { Geist, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "@/components/Providers";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Journey",
  description: "Entrenamiento, nutrición y hábitos para tu transformación física.",
  appleWebApp: { capable: true, title: "Journey", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/apple-touch-icon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Aplica el tema antes de pintar para evitar parpadeo.
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem('journey-v1')||'{}');var t=(s.state&&s.state.theme)||'dark';if(t==='system'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="dark" className={`${geist.variable} ${display.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <Suspense
          fallback={
            <div className="grid min-h-dvh place-items-center">
              <div className="font-display text-3xl font-bold grad-text">journey</div>
            </div>
          }
        >
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}
