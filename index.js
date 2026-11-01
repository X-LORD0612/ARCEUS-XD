import "dotenv/config";
import pino from "pino";
import qrcode from "qrcode-terminal";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import { handleMessage } from "./lib/handler.js";

const logger = pino({ level: process.env.LOG_LEVEL || "silent" });
const authDir = process.env.AUTH_DIR || "./auth_info";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("ARCEUS XD"),
    auth: state,
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr && !process.env.PHONE_NUMBER && process.env.HIDE_QR !== "true") {
      console.log("\n[ARCEUS XD] Scan this QR from WhatsApp > Linked devices:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("[ARCEUS XD] Connected successfully.");
      if (process.env.PHONE_NUMBER) {
        console.log("[ARCEUS XD] Pairing complete. Keep auth_info private.");
      }
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.log(`[ARCEUS XD] Connection closed (${code ?? "unknown"}).`);
      if (shouldReconnect) {
        setTimeout(() => startBot().catch(console.error), 3000);
      } else {
        console.error("[ARCEUS XD] Logged out. Remove auth_info and pair again.");
      }
    }
  });

  // Pairing-code flow: enter PHONE_NUMBER in .env; request code after socket is ready.
  if (process.env.PHONE_NUMBER && !state.creds.registered) {
    const number = process.env.PHONE_NUMBER.replace(/\D/g, "");
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(number);
        console.log(`\n[ARCEUS XD] WhatsApp pairing code: ${code}\n`);
        console.log("Enter it in WhatsApp > Linked devices > Link with phone number.");
      } catch (error) {
        console.error("[ARCEUS XD] Could not request pairing code:", error.message);
      }
    }, 2500);
  }

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const message of messages) {
      try {
        await handleMessage(sock, message);
      } catch (error) {
        console.error("[ARCEUS XD] Message handler error:", error);
      }
    }
  });
}

process.on("unhandledRejection", error => console.error("[ARCEUS XD] Unhandled rejection:", error));
process.on("uncaughtException", error => console.error("[ARCEUS XD] Uncaught exception:", error));
startBot().catch(error => {
  console.error("[ARCEUS XD] Startup failed:", error);
  process.exit(1);
});
