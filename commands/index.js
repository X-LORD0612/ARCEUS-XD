import { menuCategories } from "./menu-data.js";

export const commands = new Map();

function add(name, execute, ownerOnly = false) {
  commands.set(name, { execute, ownerOnly });
}

add("ping", async ({ sock, chat, message }) => {
  const start = Date.now();
  const sent = await sock.sendMessage(chat, { text: "🏓 Pinging..." }, { quoted: message });
  const ms = Date.now() - start;
  await sock.sendMessage(chat, { text: `🏓 Pong!\nSpeed: ${ms} ms` }, { quoted: sent });
});

add("alive", async ({ sock, chat, message }) => {
  await sock.sendMessage(chat, { text: "┏▣ ◈ ARCEUS XD ◈\n┃ Status: Online\n┃ Version: 1.9.9\n┗▣" }, { quoted: message });
});

add("botinfo", async ({ sock, chat, message }) => {
  const owner = process.env.OWNER_NAME || "Not configured";
  const prefix = process.env.PREFIX || ".";
  const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
  await sock.sendMessage(chat, { text:
`┏▣ ◈ ARCEUS XD ◈
┃ ᴏᴡɴᴇʀ : ${owner}
┃ ᴘʀᴇғɪx : ${prefix}
┃ ʜᴏsᴛ : ${process.env.HOST_NAME || "Node.js"}
┃ ᴘʟᴜɢɪɴs : ${commands.size}
┃ ᴍᴏᴅᴇ : ${(process.env.MODE || "public").toUpperCase()}
┃ ᴠᴇʀsɪᴏɴ : 1.9.9
┃ sᴘᴇᴇᴅ : online
┃ ᴜsᴀɢᴇ : ${process.uptime().toFixed(0)} sec uptime
┃ ʀᴀᴍ: ${ram} MB
┗▣` }, { quoted: message });
});

add("menu", async ({ sock, chat, message, prefix }) => {
  const lines = ["┏▣ ◈ ARCEUS XD ◈", "┃ Version : 1.9.9", `┃ Prefix : ${prefix}`, "┗▣"];
  for (const [category, names] of Object.entries(menuCategories)) {
    lines.push("", `┏▣ ◈ ${category} MENU ◈`);
    for (const name of names) lines.push(`│➽ ${name}`);
    lines.push("┗▣");
  }
  lines.push("", `Use ${prefix}help <command> for command status.`);
  await sock.sendMessage(chat, { text: lines.join("\n") }, { quoted: message });
});

add("help", async ({ sock, chat, message, args, prefix }) => {
  const name = (args[0] || "").toLowerCase();
  if (!name) {
    await sock.sendMessage(chat, { text: `Use ${prefix}menu to view all categories.\nCore working commands: menu, help, ping, alive, botinfo, echo.` }, { quoted: message });
    return;
  }
  const command = commands.get(name);
  await sock.sendMessage(chat, { text: command
    ? `.${name}: Available in this starter build.`
    : `${name}: Listed in the ARCEUS XD catalogue, but its plugin is not implemented yet.` }, { quoted: message });
});

add("echo", async ({ sock, chat, message, text }) => {
  if (!text) return sock.sendMessage(chat, { text: "Usage: .echo your message" }, { quoted: message });
  await sock.sendMessage(chat, { text: text.slice(0, 1500) }, { quoted: message });
});

add("repo", async ({ sock, chat, message }) => {
  await sock.sendMessage(chat, { text: "ARCEUS XD v1.9.9 — add your GitHub repository URL in README.md after publishing." }, { quoted: message });
});

add("restart", async ({ sock, chat, message }) => {
  await sock.sendMessage(chat, { text: "Restart is managed by the hosting platform. Use the platform's restart control." }, { quoted: message });
}, true);

// The catalogue is intentionally visible, but unimplemented integrations do not pretend to work.
for (const [category, names] of Object.entries(menuCategories)) {
  for (const name of names) {
    if (!commands.has(name)) {
      commands.set(name, {
        category,
        execute: async ({ sock, chat, message, prefix }) => {
          await sock.sendMessage(chat, {
            text: `⚙️ *${name}* (${category})\nThis command is listed in ARCEUS XD v1.9.9 but its plugin is not installed yet.\nUse ${prefix}help ${name} for details.`
          }, { quoted: message });
        }
      });
    }
  }
}
