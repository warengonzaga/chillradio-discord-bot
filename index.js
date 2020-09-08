const Discord   = require('discord.js');
const {prefix}  = require('./config.json');
const client    = new Discord.Client();

require('dotenv').config();

// credentials
const token     = process.env.TOKEN;
const livefeed  = process.env.LIVE_FEED;

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
        return msg.reply("tunning in, please wait...");
    } else if (msg.content.startsWith(`${prefix}turnoff`)) {
        tuneOff(msg);
        return msg.reply("sorry I'm sad to see you go...");
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
        return msg.reply("You need to be in a voice channel to play music!");
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return msg.reply("I need the permissions to join and speak in your voice channel!");
    }

    // connect to voice channel
    try {
        var connection = await voiceChannel.join();
        playmusic();
        return msg.reply("you're now listening to live broadcast... enjoy!");
    } catch (err) {
        console.log(err);
        return msg.channel.send(err);
    }
}

// play music
function playmusic() {
    const broadcast = client.voice.createBroadcast();
    broadcast.play(`${livefeed}`, { volume: 1 });
    for (const connection of client.voice.connections.values()) {
        connection.play(broadcast);
    }
}

// turn off music
function tuneOff(msg) {
    const voiceChannel = msg.member.voice.channel;
    const connection = msg.guild.me.voiceChannel;
    voiceChannel.leave(connection);
}

// discord authentication
client.login(token);
