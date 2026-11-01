# ARCEUS XD WhatsApp Bot

**Version:** 1.9.9  
**Connection:** WhatsApp Web using Baileys  
**Runtime:** Node.js 20+

> This is a GitHub-ready starter project. The menu catalogue contains the commands requested, but only `menu`, `help`, `ping`, `alive`, `botinfo`, `echo`, `repo`, and the owner-protected `restart` response are implemented as functional commands. Other catalogue entries reply that their plugin is not installed. Add and test each plugin before relying on it.

## Features

- QR login or WhatsApp phone-number pairing code
- Modular command registry and category menu
- Environment-based configuration
- Railway, Render Background Worker, VPS, and Pterodactyl deployment files
- Basic command cooldown and owner-only command guard
- No mass messaging or automated group-member removal functionality

## Requirements

- Node.js 20 or newer
- A WhatsApp account you control
- A computer or hosting service that can run a persistent Node.js process

## Local setup

```bash
git clone https://github.com/YOUR-USERNAME/ARCEUS-XD.git
cd ARCEUS-XD
npm install
cp .env.example .env
```

Edit `.env`:
- `OWNER_NAME`: display name
- `OWNER_NUMBER`: owner number in international format, digits only
- `PREFIX`: command prefix, default `.`
- `MODE`: `public` or `private`
- `PHONE_NUMBER`: optional number for pairing code; leave empty to use QR

Start:

```bash
npm start
```

### QR login

Leave `PHONE_NUMBER` blank. Open WhatsApp on your phone:
**Settings → Linked devices → Link a device**, then scan the terminal QR.

### Pairing-code login

Set `PHONE_NUMBER` to your full international number without `+`, for example `919876543210`. Start the bot and enter the displayed code in:
**WhatsApp → Linked devices → Link with phone number**.

Keep the `auth_info/` folder private. Never upload it to GitHub or share the pairing code/QR. If you suspect it has been exposed, unlink the device from WhatsApp and create a fresh session.

## Commands

| Command | Status |
|---|---|
| `.menu` | Working — full requested category catalogue |
| `.help` | Working |
| `.ping` | Working |
| `.alive` | Working |
| `.botinfo` | Working |
| `.echo <text>` | Working |
| `.repo` | Working — customize with your repository URL |
| `.restart` | Owner-only informational response; restart through host panel |
| Other listed commands | Catalogue placeholders; plugin implementation required |

## Deploy on Railway

1. Push this project to a GitHub repository.
2. In Railway, create a new project from that GitHub repository.
3. Add the variables from `.env.example` in **Variables**.
4. Ensure the service runs `npm start`.
5. Use a persistent volume mounted at `/app/auth_info` and set `AUTH_DIR=/app/auth_info` so login survives redeploys.
6. View deployment logs and scan the QR or enter the pairing code.

Use a persistent worker/service, not a short-lived request handler.

## Deploy on Render

Use a **Background Worker**, not a static site or ordinary web service:

1. Create a new Background Worker and connect the GitHub repository.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables from `.env.example`.
5. Attach persistent disk storage if available for your plan, mount it at `/opt/render/project/src/auth_info`, and set `AUTH_DIR` to that path.

If persistent storage is unavailable, the WhatsApp session may be lost on redeploy/restart and you may need to pair again.

## Deploy on VPS

```bash
sudo apt update
sudo apt install -y nodejs npm
git clone https://github.com/YOUR-USERNAME/ARCEUS-XD.git
cd ARCEUS-XD
npm install
cp .env.example .env
nano .env
```

Run with PM2:

```bash
sudo npm install -g pm2
pm2 start index.js --name arceus-xd
pm2 save
pm2 startup
pm2 logs arceus-xd
```

Back up `auth_info/` securely. Restrict access to the server and do not expose the session folder publicly.

## Deploy on Pterodactyl

1. Create a server using a Node.js 20+ egg.
2. Upload the project or use the panel's Git deployment feature.
3. Set the startup command to `npm start`.
4. Set install command to `npm install` if the egg supports it.
5. Add environment variables in the Startup/Variables panel.
6. Keep the server running and use the console to scan the QR or read the pairing code.
7. If the panel provides persistent server storage, keep `auth_info/` there.

## Add a command plugin

Add a command to `commands/index.js` using the existing pattern:

```js
add("hello", async ({ sock, chat, message, text }) => {
  await sock.sendMessage(chat, {
    text: `Hello! ${text || "Welcome to ARCEUS XD."}`
  }, { quoted: message });
});
```

For a larger project, move each feature into its own module under `commands/` and register it in `commands/index.js`.

## Safety and account notes

- Use only with an account you own or are authorized to operate.
- Follow WhatsApp's terms and applicable laws.
- Do not spam, scrape private data, impersonate people, or send unsolicited bulk messages.
- Group moderation plugins should verify that the bot is an admin and that the requesting user is authorized.
- Keep API keys, `.env`, and `auth_info/` out of public repositories.
- Baileys is an unofficial WhatsApp Web library; WhatsApp may change its protocol and access may stop working.

## Publish to GitHub

```bash
git init
git add .
git commit -m "ARCEUS XD WhatsApp Bot v1.9.9"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ARCEUS-XD.git
git push -u origin main
```
