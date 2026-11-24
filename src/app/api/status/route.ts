import { connection } from "next/server";
import { pushConfigured } from "@/lib/server/push";
import { getSupabase } from "@/lib/server/supabase";

export async function GET() {
  await connection();
  const db = getSupabase() !== null;
  return Response.json({
    push: db && pushConfigured(),
    sync: db,
    cron: Boolean(process.env.CRON_SECRET),
  });
}
