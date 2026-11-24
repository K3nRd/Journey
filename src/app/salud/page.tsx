"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { HealthStep } from "@/components/HealthStep";
import { validateHealth } from "@/lib/validation";
import { Button } from "@/components/ui";

/** Cuestionario de salud para quien ya usaba la app antes de que existiera. */
export default function Salud() {
  const router = useRouter();
  const p = useApp((s) => s.profile);
  const [tried, setTried] = useState(false);
  return (
    <div className="safe-top pt-6">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-accent-text">Nuevo · una sola vez</p>
      <HealthStep showErrors={tried} />
      <div className="safe-bottom sticky bottom-0 -mx-4 mt-4 bg-bg/90 px-4 pt-3 backdrop-blur">
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            if (Object.keys(validateHealth(p)).length) {
              setTried(true);
              setTimeout(() => document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
              return;
            }
            router.replace("/");
          }}
        >
          <Check className="h-5 w-5" /> Guardar y continuar
        </Button>
      </div>
    </div>
  );
}
