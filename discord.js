const axios = require("axios");
require("dotenv").config();

async function updateWidget(payload) {
  return axios.patch(
    `https://discord.com/api/v9/applications/${process.env.APPLICATION_ID}/users/${process.env.USER_ID}/identities/0/profile`,
    payload,
    {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "DiscordBot (lastfm-widget, 1.0.0)",
      },
    },
  );
}

module.exports = updateWidget;
