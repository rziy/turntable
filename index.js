const axios = require("axios");

// ======================
// CONFIG
// ======================

require("dotenv").config();

const LASTFM_USER = process.env.LASTFM_USER;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const DISCORD_APP_ID = process.env.DISCORD_APP_ID;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// ======================
// ICONS
// ======================

const TURNTABLE_ICON = "https://i.imgur.com/37C0NjF.png";

const SCROBBLE_ICON = "https://i.imgur.com/n6IbTBq.png";

const HEART_ICON = "https://i.imgur.com/DQE9Jlt.png";

const FRIENDS_ICON = "https://i.imgur.com/UGjBN1V.png";

const TRACK_ICON = "https://i.imgur.com/lbkLamM.png";

const ALBUM_ICON = "https://i.imgur.com/vGnXroG.png";

const ARTIST_ICON = "https://i.imgur.com/ir6Keub.png";

const MUSIC_ICON = "https://i.imgur.com/rE64Q5p.png";

const HEADER_IMAGE = "https://i.imgur.com/6nTFzLf.jpeg";

const GIF_HEADER = "https://i.imgur.com/tYadIHN.gif";

function formatNumber(num) {
  num = Number(num);

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "K";
  }

  return String(num);
}

async function updateWidget() {
  try {
    const recent = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.getrecenttracks",
        user: LASTFM_USER,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit: 1,
      },
    });

    const userInfo = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.getinfo",
        user: LASTFM_USER,
        api_key: LASTFM_API_KEY,
        format: "json",
      },
    });

    const lovedTracks = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.getlovedtracks",
        user: LASTFM_USER,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit: 1,
      },
    });

    const topArtists = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.gettopartists",
        user: LASTFM_USER,
        api_key: LASTFM_API_KEY,
        format: "json",
        limit: 1,
        period: "7day",
      },
    });

    const lovedCount = lovedTracks.data.lovedtracks?.["@attr"]?.total || "0";

    const topArtist = topArtists.data.topartists.artist?.[0]?.name || "Unknown";

    const friendsCount = "0";

    const track = recent.data.recenttracks.track?.[0];

    const song = track?.name || "Nothing Playing";

    const artist = track?.artist?.["#text"] || "Unknown Artist";

    const album = track?.album?.["#text"] || "Unknown Album";

    // Avatar fallback (Imgur lu)
    const avatar = "https://i.imgur.com/6nTFzLf.jpeg";

    // Artwork dari Last.fm
    const rawCover =
      track?.image?.find((img) => img.size === "extralarge")?.["#text"] || "";

    // Placeholder artwork Last.fm
    const hasRealCover =
      rawCover && !rawCover.includes("2a96cbd8b46e442fc41c2b86b821562f");

    // Kalau cover kosong → pakai avatar Imgur
    const cover = hasRealCover ? rawCover : TURNTABLE_ICON;

    console.log("Raw Cover:", rawCover);
    console.log("Real Cover:", hasRealCover);
    console.log("Final Cover:", cover);

    const isNowPlaying = track?.["@attr"]?.nowplaying === "true";
    const MODE = isNowPlaying ? "music" : "personal";

    let payload;

    if (MODE === "music") {
      payload = {
        username: LASTFM_USER,

        data: {
          dynamic: [
            {
              type: 3,
              name: "header",
              value: {
                url: cover,
              },
            },

            {
              type: 1,
              name: "text_title",
              value: song,
            },

            {
              type: 1,
              name: "subtitle_1",
              value: artist,
            },

            {
              type: 1,
              name: "subtitle_2",
              value: album,
            },

            {
              type: 1,
              name: "subtitle_3",
              value: `@${LASTFM_USER}`,
            },

            {
              type: 1,
              name: "stat1",
              value: formatNumber(userInfo.data.user.playcount),
            },

            {
              type: 1,
              name: "label1",
              value: "Scrobbles",
            },

            {
              type: 3,
              name: "icon1",
              value: {
                url: SCROBBLE_ICON,
              },
            },

            {
              type: 1,
              name: "stat2",
              value: formatNumber(lovedCount),
            },

            {
              type: 1,
              name: "label2",
              value: "Loved Tracks",
            },

            {
              type: 3,
              name: "icon2",
              value: {
                url: HEART_ICON,
              },
            },

            {
              type: 1,
              name: "stat3",
              value: friendsCount,
            },

            {
              type: 1,
              name: "label3",
              value: "Friends",
            },

            {
              type: 3,
              name: "icon3",
              value: {
                url: FRIENDS_ICON,
              },
            },

            {
              type: 1,
              name: "stat4",
              value: formatNumber(userInfo.data.user.track_count),
            },

            {
              type: 1,
              name: "label4",
              value: "Tracks",
            },

            {
              type: 3,
              name: "icon4",
              value: {
                url: TRACK_ICON,
              },
            },

            {
              type: 1,
              name: "stat5",
              value: formatNumber(userInfo.data.user.album_count),
            },

            {
              type: 1,
              name: "label5",
              value: "Albums",
            },

            {
              type: 3,
              name: "icon5",
              value: {
                url: ALBUM_ICON,
              },
            },

            {
              type: 1,
              name: "stat6",
              value: formatNumber(userInfo.data.user.artist_count),
            },

            {
              type: 1,
              name: "label6",
              value: "Artists",
            },

            {
              type: 3,
              name: "icon6",
              value: {
                url: ARTIST_ICON,
              },
            },

            {
              type: 3,
              name: "image_preview",
              value: {
                url: cover,
              },
            },

            {
              type: 1,
              name: "stat_mini",
              value: formatNumber(userInfo.data.user.playcount),
            },

            {
              type: 3,
              name: "icon_mini",
              value: {
                url: SCROBBLE_ICON,
              },
            },

            {
              type: 3,
              name: "image_mini",
              value: {
                url: avatar,
              },
            },

            {
              type: 1,
              name: "text_activty",
              value: isNowPlaying
                ? `🎧 ${artist} — ${song}`
                : `⏸ ${artist} — ${song}`,
            },

            {
              type: 3,
              name: "icon_activity",
              value: {
                url: MUSIC_ICON,
              },
            },
          ],
        },
      };
    }

    if (MODE === "personal") {
      payload = {
        username: "az2e",

        data: {
          dynamic: [
            {
              type: 3,
              name: "header",
              value: {
                url: GIF_HEADER,
              },
            },

            {
              type: 1,
              name: "text_title",
              value: "rei",
            },

            {
              type: 1,
              name: "subtitle_1",
              value: "better known as zaza",
            },

            {
              type: 1,
              name: "subtitle_2",
              value: "‎ ",
            },

            {
              type: 1,
              name: "subtitle_3",
              value: "‎ ",
            },

            {
              type: 1,
              name: "stat1",
              value: "‎ ",
            },

            {
              type: 1,
              name: "label1",
              value: "‎ ",
            },

            {
              type: 1,
              name: "stat2",
              value: "‎ ",
            },

            {
              type: 1,
              name: "label2",
              value: "‎ ",
            },

            {
              type: 1,
              name: "stat3",
              value: "‎ ",
            },

            {
              type: 1,
              name: "label3",
              value: "@zfvrn",
            },

            {
              type: 1,
              name: "stat4",
              value: "‎ ",
            },

            {
              type: 1,
              name: "label4",
              value: "‎ ",
            },

            {
              type: 1,
              name: "stat5",
              value: "‎ ",
            },

            {
              type: 1,
              name: "label5",
              value: "‎ ",
            },

            {
              type: 1,
              name: "stat6",
              value: "‎ ",
            },

            {
              type: 1,
              name: "label6",
              value: "@syzdt",
            },

            {
              type: 3,
              name: "image_preview",
              value: {
                url: HEADER_IMAGE,
              },
            },

            {
              type: 1,
              name: "stat_mini",
              value: "rei",
            },

            {
              type: 3,
              name: "image_mini",
              value: {
                url: HEADER_IMAGE,
              },
            },

            {
              type: 1,
              name: "text_activty",
              value: "Personal Profile",
            },

            {
              type: 3,
              name: "icon_activity",
              value: {
                url: MUSIC_ICON,
              },
            },
          ],
        },
      };
    }

    const url =
      `https://discord.com/api/v9/applications/${DISCORD_APP_ID}` +
      `/users/${DISCORD_USER_ID}` +
      `/identities/0/profile`;

    const res = await axios.patch(url, payload, {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      `[${new Date().toLocaleTimeString()}] Updated: ${song} - ${artist}`,
    );

    console.log(`Top Artist: ${topArtist}`);
    console.log(`Loved: ${lovedCount}`);
    console.log(`Cover: ${cover ? "YES" : "NO"}`);
    console.log(`Discord Status: ${res.status}`);
  } catch (err) {
    console.log("ERROR:");
    console.log(err.response?.config?.params);
    console.log(err.response?.data);
  }
}

updateWidget();

setInterval(updateWidget, 30000);
