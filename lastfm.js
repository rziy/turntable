const axios = require("axios");
require("dotenv").config();

const API = process.env.LASTFM_API_KEY;
const USER = process.env.LASTFM_USERNAME;

async function fetch(method, extra = "") {
  const url = `https://ws.audioscrobbler.com/2.0/?method=${method}&user=${USER}&api_key=${API}&format=json${extra}`;
  const { data } = await axios.get(url);
  return data;
}

async function getStats() {
  const [info, recent, loved, artists, albums, tracks] = await Promise.all([
    fetch("user.getinfo"),
    fetch("user.getrecenttracks", "&limit=1"),
    fetch("user.getlovedtracks", "&limit=1"),
    fetch("user.gettopartists", "&limit=1"),
    fetch("user.gettopalbums", "&limit=1"),
    fetch("user.gettoptracks", "&limit=1"),
  ]);

  return {
    username: info.user.name,
    playcount: info.user.playcount,
    registered: info.user.registered.unixtime,

    loved: loved.lovedtracks["@attr"].total,
    artists: artists.topartists["@attr"].total,
    albums: albums.topalbums["@attr"].total,
    tracks: tracks.toptracks["@attr"].total,

    nowPlaying: recent.recenttracks.track[0],
  };
}

module.exports = getStats;
