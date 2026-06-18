# Turntable

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Last.fm](https://img.shields.io/badge/Last.fm-API-D51007?logo=lastdotfm)
![Discord](https://img.shields.io/badge/Discord-Social%20SDK-5865F2?logo=discord)

A customizable Discord Social SDK widget powered by Last.fm.

## Features

- 🎵 Live Last.fm scrobbling
- 🖼️ Album artwork with fallback
- 👤 Personal profile mode
- 🎧 Music mode
- 🔄 Auto updates
- 📊 Listening statistics

## Installation

```bash
git clone https://github.com/rziy/turntable.git
cd turntable
npm install
```

Create a `.env` file:

```env
LASTFM_USER=
LASTFM_API_KEY=
DISCORD_APP_ID=
DISCORD_USER_ID=
DISCORD_BOT_TOKEN=
MODE=music
```

Run:

```bash
npm start
```

Development:

```bash
npm run dev
```

## Modes

### Music

![Music Mode](assets/music_mode.png)

Displays your currently playing track.

### Personal

![Personal Mode](assets/personal_mode.png)

Displays your custom profile.

## License

MIT

Copyright (c) 2026 rziy.
