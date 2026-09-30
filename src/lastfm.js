"use strict";

const axios = require("axios");
const logger = require("./logger");

const PLACEHOLDER_HASH = "2a96cbd8b46e442fc41c2b86b821562f"; // Last.fm's grey "no artwork" star
const EMPTY_STATS = { playcount: 0, loved: 0, friends: 0, tracks: 0, albums: 0, artists: 0 };

function pickCover(images) {
  const list = Array.isArray(images) ? images : [];
  for (const size of ["extralarge", "large", "medium"]) {
    const url = list.find((img) => img.size === size)?.["#text"];
    if (url && !url.includes(PLACEHOLDER_HASH)) return url;
  }
  return "";
}

function createLastfmClient({ user, apiKey, statsTtlMs }) {
  const http = axios.create({ baseURL: "https://ws.audioscrobbler.com/2.0/", timeout: 10000 });

  let cache = { at: 0, value: { ...EMPTY_STATS } };

  async function call(method, params = {}) {
    let data;
    try {
      ({ data } = await http.get("", { params: { method, user, api_key: apiKey, format: "json", ...params } }));
    } catch (err) {
      if (err.response?.status === 403) err.hint = "check LASTFM_API_KEY";
      throw err;
    }
    // Last.fm sometimes reports failures as HTTP 200 with an error field.
    if (data && data.error) {
      const err = new Error(`Last.fm error ${data.error}: ${data.message}`);
      if ([6, 10, 26].includes(data.error)) err.hint = "check LASTFM_USER and LASTFM_API_KEY";
      throw err;
    }
    return data;
  }

  async function getNowPlaying() {
    const data = await call("user.getrecenttracks", { limit: 1 });
    const raw = data?.recenttracks?.track;
    const t = Array.isArray(raw) ? raw[0] : raw;

    return {
      name: t?.name || "Nothing Playing",
      artist: t?.artist?.["#text"] || t?.artist?.name || "Unknown Artist",
      album: t?.album?.["#text"] || "Unknown Album",
      cover: pickCover(t?.image),
      isNowPlaying: t?.["@attr"]?.nowplaying === "true",
    };
  }

  /** Profile totals change slowly, so they are cached for statsTtlMs. */
  async function getStats() {
    if (Date.now() - cache.at < statsTtlMs) return cache.value;

    const [info, loved, friends] = await Promise.allSettled([
      call("user.getinfo"),
      call("user.getlovedtracks", { limit: 1 }),
      call("user.getfriends", { limit: 1 }),
    ]);

    const next = { ...cache.value };
    let anyOk = false;

    if (info.status === "fulfilled") {
      const u = info.value?.user || {};
      next.playcount = u.playcount ?? next.playcount;
      next.tracks = u.track_count ?? next.tracks;
      next.albums = u.album_count ?? next.albums;
      next.artists = u.artist_count ?? next.artists;
      anyOk = true;
    }
    if (loved.status === "fulfilled") {
      next.loved = loved.value?.lovedtracks?.["@attr"]?.total ?? next.loved;
      anyOk = true;
    }
    if (friends.status === "fulfilled") {
      next.friends = friends.value?.friends?.["@attr"]?.total ?? next.friends;
      anyOk = true;
    }

    if (anyOk) {
      cache = { at: Date.now(), value: next };
    } else {
      logger.warn("Could not refresh Last.fm stats, using the last known values");
    }
    return cache.value;
  }

  return { getNowPlaying, getStats };
}

module.exports = { createLastfmClient, pickCover };
