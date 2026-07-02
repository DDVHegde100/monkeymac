# MonkeyMac Mobile

Local-only Zetamac Classic trainer for iOS/Android. No login — scores stay on your device.

## Requirements

- Node 20+
- Expo Go with **SDK 54** on your phone

## Run in Expo Go

**Do not use `--tunnel` by default** — Expo’s shared ngrok tunnel often returns **HTTP 402** (rate limit / payment required).

### Option A — iOS Simulator (easiest on Mac)

```bash
cd mobile
npm install
npm run start:simulator
```

### Option B — Physical phone (recommended)

1. Turn on **iPhone Personal Hotspot**
2. Connect your **Mac to the hotspot** (same network as phone)
3. Run:

```bash
cd mobile
npm run start:lan
```

4. Scan the **QR code** in the terminal with Expo Go (SDK 54)

### Option C — Your own ngrok account (if LAN fails)

1. Free account at [ngrok.com](https://ngrok.com) → copy authtoken
2. Run:

```bash
export NGROK_AUTHTOKEN=your_token_here
npm run start:tunnel
```

### Troubleshooting

| Error | Fix |
|-------|-----|
| HTTP 402 / stuck on “Opening project” | Stop tunnel; use **hotspot + LAN** or **simulator** |
| Can't reach Metro | Same Wi‑Fi/hotspot; disable VPN; allow Node in firewall |
| SDK mismatch | Expo Go must be **SDK 54** |

## Features

- Zetamac Classic (120s, weighted problem generation)
- Session history (AsyncStorage)
- Profile stats (best score, accuracy, ppm)
- Mobile-first UI with number pad keyboard

## Build for App Store (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios
```

Bundle ID: `com.monkeymac.app`
