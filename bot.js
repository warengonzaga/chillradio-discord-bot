const Discord = require('discord.js');
const bot     = new Discord.Client();

// bot Libraries
const bot_lang      = require('./lib/lang/en-us.json');
const bot_config    = require('./lib/bot/config.json');
const bot_commands  = require('./lib/bot/commands.json');
const bot_colors    = require('./lib/bot/colors.json');
const bot_info      = require('./package.json');

// dev purposes
require('dotenv').config();

// credentials
const token     = process.env.TOKEN;
const livefeed  = process.env.LIVE_FEED;

bot.on('message', async message => {
    let prefix = bot_config.prefix;
    let msgArray = message.content.split(' ');
    let args = msgArray.slice[1];

    if(message.author.bot || message.channel.type === 'dm' || !message.content.startsWith(`${prefix}`)) return;

    const hi_cmd = `${prefix}${bot_commands.hi}`;
    const hello_cmd = `${prefix}${bot_commands.hello}`;
    const tunein_cmd = `${prefix}${bot_commands.tunein}`;
    const turnoff_cmd = `${prefix}${bot_commands.turnoff}`;
    const help_cmd = `${prefix}${bot_commands.help}`;

    // hi command
    if(message.content.startsWith(hi_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.green)
            .setDescription(`${bot_lang.bot_messages.hi_response}`);
        message.channel.send({embed: sEmbed});
        console.log('Someone hi to the bot...');
    // hello command
    } else if(message.content.startsWith(hello_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.green)
            .setDescription(`${bot_lang.bot_messages.hello_response}`);
        message.channel.send({embed: sEmbed});
        console.log('Someone hello to the bot...');
    // tunein command
    } else if(message.content.startsWith(tunein_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.yellow)
            .setDescription(`${bot_lang.bot_messages.tuning_in}`);
        message.channel.send({embed: sEmbed});
        tuneIn(message);
        console.log('Someone tune in to the bot...');
    // turnoff command
    } else if(message.content.startsWith(turnoff_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.yellow)
            .setDescription(`${bot_lang.bot_messages.turning_off}`);
        message.channel.send({embed: sEmbed});
        turnOff(message);
        console.log('Someone turn off to the bot...');
    } else if(message.content.startsWith(help_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.blue)
            .setTitle(bot.user.username+' Commands')
            .setThumbnail('https://i.imgur.com/ABBUNkI.png')
            .setDescription('This is the list of all available commands. The command format would be ``prefix<command>``. Current bot prefix is '+`${prefix}`)
            .addFields(
                {
                    name: 'Greetings',
                    value: `${bot_commands.hi}, ${bot_commands.hello}`,
                    inline: true
                },
                {
                    name:'Listen to Radio', 
                    value: `${bot_commands.tunein}`,
                    inline: true
                },
                {
                    name: 'Stop the Radio',
                    value: `${bot_commands.turnoff}`,
                    inline: true
                },
                {
                    name: 'Official Website',
                    value: 'https://chillradio.live'
                },
                {
                    name: 'Github Repo',
                    value: 'https://warengonza.ga/chillradio-repo'
                }
            )
            .setFooter(`Developed and Maintained by ${bot_info.author} | v${bot_info.version}`, 'https://i.imgur.com/QLWADZx.jpg');
        message.channel.send({embed: sEmbed});
    } else {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.red)
            .setDescription(`${bot_lang.bot_messages.err_command}`);
        message.channel.send({embed: sEmbed});
        console.log('Someone sends a wrong command to the bot...');
    }
});

// tune in command logic
async function tuneIn(message) {

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.red)
            .setDescription(`You need to be in a voice channel to tune in!`);
        return message.channel.send({embed: sEmbed});
    }

    const permissions = voiceChannel.permissionsFor(bot.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.red)
            .setDescription(`I need the permissions to join and speak in your voice channel!`);
        return message.channel.send({embed: sEmbed});
    }

    try {
        voiceChannel.join();

        const broadcast = bot.voice.createBroadcast();
        broadcast.play(`${livefeed}`, { volume: 1 });
        
        for (const connection of bot.voice.connections.values()) {
            connection.play(broadcast);
        }
        
        let sEmbed = new Discord.MessageEmbed()
        .setColor(bot_colors.green)
        .setDescription(`You're now listening to live broadcast... enjoy!`);
        message.channel.send({embed: sEmbed});
        console.log('Radio feed is being played...');
    } catch (err) {
        console.log(err);
        return message.channel.send(err);
    }
}

// turn off command logic
async function turnOff(message) {
    const voiceChannel = message.member.voice.channel;
    const connection = message.guild.me.voiceChannel;

    if(!voiceChannel) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.red)
            .setDescription(`Sorry, you need to be in a voice channel to turn off the radio!`);
        return message.channel.send({embed: sEmbed});
    }
        
    voiceChannel.leave(connection);

    let sEmbed = new Discord.MessageEmbed()
        .setColor(bot_colors.blue)
        .setDescription(`Sorry I'm sad to see you go...`);
    return message.channel.send({embed: sEmbed});
}

// online status
bot.on('ready', async () => {
    bot.user.setActivity(`${bot_config.prefix}${bot_commands.help}`, {type: "LISTENING"});
    console.log(`${bot.user.username} Discord Bot ${bot_lang.system_messages.online_status}`);
    console.log(`Build v${bot_info.version}\nDeveloped by ${bot_info.author}\nRunning...`);
});

// error handling
bot.on('error', err => {
    console.warn(err);
});

// discord authentication
bot.login(token);
