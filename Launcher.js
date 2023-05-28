const { Client, Partials, GatewayIntentBits, Collection } = require('discord.js');
const logs = require('discord-logs');

const {DisTube} = require('distube');
const {SpotifyPlugin} = require('@distube/spotify');
const YoutubePoster = require('discord-youtube')

const {loadEvents, loadCommands, loadGiveawaysManager, loadGiveawaysEvents, loadLogs} = require('./Handlers/Handlers');

const client = new Client({
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Object.keys(Partials)]
});

logs(client, {debug: true});

client.distube = new DisTube(client, {emitNewSongOnly: true, leaveOnFinish: true, emitAddSongWhenCreatingQueue: false, plugins: [new SpotifyPlugin()]});
client.ytb = new YoutubePoster(client);
client.commands = new Collection();
client.config = require('./config.json');
client.giveawayConfig = require('./config.js');

module.exports = client;

client.login(client.config.token).then(() => {
    loadGiveawaysManager(client);
    loadGiveawaysEvents(client);
    loadLogs(client);
    loadEvents(client);
    loadCommands(client); 
});