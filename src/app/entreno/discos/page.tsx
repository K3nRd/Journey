"use client";

import { useState } from "react";
import { PageHeader, Card } from "@/components/ui";
import { PlateCalc } from "@/components/PlateCalc";

export default function Discos() {
  const [w, setW] = useState(135);
  const [bar, setBar] = useState(45);
  return (
    <div>
      <PageHeader title="Calculadora de discos" back="/entreno" />
      <Card>
        <PlateCalc w={w} setW={setW} bar={bar} setBar={setBar} />
      </Card>
      <p className="mt-3 text-center text-xs text-muted">Discos disponibles: 45, 35, 25, 10, 5 y 2.5 lb.</p>
    </div>
  );
}
