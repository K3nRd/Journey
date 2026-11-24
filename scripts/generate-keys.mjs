// Genera las claves VAPID (para notificaciones) y un CRON_SECRET aleatorio.
// Uso: npm run keys
import webpush from "web-push";
import { randomBytes } from "node:crypto";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();
console.log("\nCopia estas variables en Vercel → Settings → Environment Variables:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
console.log(`VAPID_SUBJECT=mailto:tu-correo@ejemplo.com`);
console.log(`CRON_SECRET=${randomBytes(24).toString("hex")}`);
console.log("\n⚠️  No compartas VAPID_PRIVATE_KEY ni CRON_SECRET con nadie.\n");
