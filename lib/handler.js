import { commands } from "../commands/index.js";

const prefix = process.env.PREFIX || ".";
const mode = (process.env.MODE || "public").toLowerCase();
const owner = (process.env.OWNER_NUMBER || "").replace(/\D/g, "");

function getText(message) {
  const m = message.message || {};
  return m.conversation
    || m.extendedTextMessage?.text
    || m.imageMessage?.caption
    || m.videoMessage?.caption
    || m.documentMessage?.caption
    || "";
}

export async function handleMessage(sock, message) {
  if (!message.message || message.key.fromMe) return;

  const chat = message.key.remoteJid;
  if (!chat || chat === "status@broadcast") return;

  const sender = (message.key.participant || chat).split("@")[0].replace(/\D/g, "");
  const isOwner = Boolean(owner && sender === owner);
  const text = getText(message).trim();

  if (!text.startsWith(prefix)) return;
  if (mode === "private" && !isOwner) return;

  const [rawName, ...args] = text.slice(prefix.length).trim().split(/\s+/);
  const name = (rawName || "").toLowerCase();
  if (!name) return;

  const command = commands.get(name);
  if (!command) {
    await sock.sendMessage(chat, { text: `Unknown command: ${name}\nUse ${prefix}menu to see available commands.` }, { quoted: message });
    return;
  }

  if (command.ownerOnly && !isOwner) {
    await sock.sendMessage(chat, { text: "This command is restricted to the bot owner." }, { quoted: message });
    return;
  }

  // Simple per-chat cooldown prevents accidental rapid replies.
  const now = Date.now();
  const key = `${chat}:${sender}:${name}`;
  globalThis.commandCooldowns ||= new Map();
  const previous = globalThis.commandCooldowns.get(key) || 0;
  if (now - previous < 1500) return;
  globalThis.commandCooldowns.set(key, now);

  await command.execute({
    sock, message, chat, sender, args,
    text: args.join(" "),
    prefix, isOwner
  });
}
