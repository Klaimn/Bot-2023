const {Client} = require('discord.js');
const mongoose = require('mongoose');
const config = require('../../config.json');
const Levels = require("discord-xp");
const Logs = require('../../Handlers/Utils/Logs')

module.exports = {
    name: 'ready',
    once: true,
    runEvent: async (client) => {
        await mongoose.connect(config.db || '', {
            keepAlive: true,
        });

        if (mongoose.connect) {
            Logs.client('Database connection succesful.')
        }

        Levels.setURL(config.db);

        Logs.client(`${client.user.username} is now online in ${client.guilds.cache.size} servers.`);
    },
};