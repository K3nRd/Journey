import { connection } from "next/server";
import { pushConfigured } from "@/lib/server/push";

export async function GET() {
  await connection();
  const db = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return Response.json({
    push: db && pushConfigured(),
    sync: db,
    cron: Boolean(process.env.CRON_SECRET),
  });
}
