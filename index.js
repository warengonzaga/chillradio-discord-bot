const Discord   = require('discord.js');
const {prefix}  = require('./config.json');
const token     = process.env.TOKEN;
const livefeed  = process.env.LIVE_FEED;

const client = new Discord.Client();

// bot connection status
client.once('ready', () => {
    console.log(':headphones: ChillRadio is online!');
});
client.once('reconnecting', () => {
    console.log('ChillRadio is trying to reconnect...');
});
client.once('disconnect', () => {
    console.log('ChillRadio is now disconnected');
});

// bot commands
client.on('message', async msg => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(`${prefix}`)) return;
    if (msg.content.startsWith(`${prefix}hi`)) {
        msg.reply("hey there, wanna hear some internet radio music?");
    } else if (msg.content.startsWith(`${prefix}tunein`)) {
        tuneIn(msg);
        return;
    } else {
        msg.reply("hey that's a wrong command!");
    }
});

// tunning in
async function tuneIn(msg) {
    const args = msg.content.split(" ");

    // permission
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
        return msg.reply(
        "You need to be in a voice channel to play music!"
        );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return msg.reply(
        "I need the permissions to join and speak in your voice channel!"
        );
    }

    // connect to voice channel
    try {
        var connection = await voiceChannel.join();
        playmusic();
    } catch (err) {
        console.log(err);
        return msg.channel.send(err);
    }
}

// tunnig in
function playmusic() {
    const broadcast = client.voice.createBroadcast();
    broadcast.play(`${livefeed}`, { volume: 1 });
    for (const connection of client.voice.connections.values()) {
        connection.play(broadcast);
    }
}

// discord authentication
client.login(token);
