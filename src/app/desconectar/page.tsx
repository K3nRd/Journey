"use client";

import { DISCONNECT_IDEAS } from "@/data/extras";
import { PageHeader, Card } from "@/components/ui";

export default function Desconectar() {
  return (
    <div>
      <PageHeader title="Desconectar" subtitle="Vida equilibrada, no solo gimnasio" back="/mas" />
      <Card className="mb-3 text-sm text-muted">
        Desconectar del trabajo baja el estrés, y el estrés alto empeora el sueño, el hambre y la grasa abdominal. Elige una idea al día.
      </Card>
      <div className="space-y-2">
        {DISCONNECT_IDEAS.map((i) => (
          <Card key={i.title} className="flex gap-3 !p-3">
            <span className="text-3xl">{i.emoji}</span>
            <div>
              <div className="font-semibold">{i.title}</div>
              <p className="text-sm text-muted">{i.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
