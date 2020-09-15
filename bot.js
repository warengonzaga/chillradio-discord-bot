const Discord = require('discord.js-light');
const bot     = new Discord.Client({cacheChannels: true});

// bot Libraries
const bot_lang      = require('./lib/lang/en-us.json');
const bot_config    = require('./lib/bot/config.json');
const bot_commands  = require('./lib/bot/commands.json');
const bot_colors    = require('./lib/bot/colors.json');
const bot_info      = require('./package.json');

// credentials
const token                 = process.env.TOKEN;
const livefeed              = process.env.LIVE_FEED;
const request_channel_id    = process.env.REQ_CHANNEL_ID;

bot.on('message', async message => {
    let prefix = bot_config.prefix;

    if(message.author.bot || message.channel.type === 'dm' || !message.content.startsWith(`${prefix}`)) return;

    // commands
    const   hi_cmd      = `${prefix}${bot_commands.hi}`,
            hello_cmd   = `${prefix}${bot_commands.hello}`,
            tunein_cmd  = `${prefix}${bot_commands.tunein}`,
            turnoff_cmd = `${prefix}${bot_commands.turnoff}`,
            help_cmd    = `${prefix}${bot_commands.help}`,
            request_cmd = `${prefix}${bot_commands.request}`,

            // alias command
            in_cmd      = `${prefix}${bot_commands.tunein_alias}`,
            off_cmd     = `${prefix}${bot_commands.turnoff_alias}`,
            h_cmd       = `${prefix}${bot_commands.help_alias}`,
            req_cmd     = `${prefix}${bot_commands.request_alias}`;

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
    } else if(message.content.startsWith(tunein_cmd) || message.content.startsWith(in_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.yellow)
            .setDescription(`${bot_lang.bot_messages.tuning_in}`);
        message.channel.send({embed: sEmbed});
        tuneIn(message);
        console.log('Someone tune in to the bot...');
    // turnoff command
    } else if(message.content.startsWith(turnoff_cmd) || message.content.startsWith(off_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.yellow)
            .setDescription(`${bot_lang.bot_messages.turning_off}`);
        message.channel.send({embed: sEmbed});
        turnOff(message);
        console.log('Someone turn off to the bot...');
    } else if(message.content.startsWith(help_cmd) || message.content.startsWith(h_cmd)) {
        let sEmbed = new Discord.MessageEmbed()
            .setColor(bot_colors.blue)
            .setTitle(bot.user.username+' Commands')
            .setThumbnail('https://i.imgur.com/ABBUNkI.png')
            .setDescription(bot_info.description)
            .addFields(
                {
                    name: 'Bot Commands',
                    value: 'A full list of commands is available [here](https://github.com/warengonzaga/chillradio-discord-bot).',
                    inline: false
                },
                {
                    name: 'Bot Invite',
                    value: 'Invite this bot to your discord server by using this [invite link](https://chillradio.live/discordbot).',
                    inline: false
                },
                {
                    name: 'Official Website',
                    value: 'https://chillradio.live',
                    inline: true
                },
                {
                    name: 'Github Repo',
                    value: 'https://warengonza.ga/chillradio-repo',
                    inline: true
                }
            )
            .setFooter(`Developed and Maintained by ${bot_info.author} | v${bot_info.version}`, 'https://i.imgur.com/QLWADZx.jpg');
        message.channel.send({embed: sEmbed});
    } else if(message.content.startsWith(request_cmd) || message.content.startsWith(req_cmd)) {
        let msgArray = message.content.split('| ');
        let songTitle = msgArray[0].split(' ').splice(1).join(' ');
        let songArtist = msgArray[1];
        let greetings = msgArray[2];
        let listener = message.author.username;

        if(!songTitle) {
            let sEmbed = new Discord.MessageEmbed()
                .setColor(bot_colors.red)
                .setDescription('Ops, song title is required...\n\n**Format**: ``song | artist | greetings``')
                .setFooter('Need help? Type '+`${prefix}${bot_commands.help}`);
            
            message.channel.send({embed: sEmbed});
        }

        let sEmbed = new Discord.MessageEmbed()
        .setColor(bot_colors.green)
        .setTitle(bot.user.username+' | Song Request Receipt')
        .setDescription('Thank you for requesting...')
        .addFields(
            {
                name: 'Song Title',
                value: `${songTitle}`,
                inline: true
            },
            {
                name: 'Artist',
                value: `${!songArtist ? 'N/A' : songArtist}`,
                inline: true
            },
            {
                name: 'From Listener',
                value: `${listener}`,
                inline: true
            },
            {
                name: 'Greetings',
                value: `${!greetings ? 'N/A' : greetings}`,
                inline: false
            }
        )
        .setFooter(`Developed and Maintained by ${bot_info.author} | v${bot_info.version}`, 'https://i.imgur.com/QLWADZx.jpg');

        sendRequest(songTitle, songArtist, greetings, listener);
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
        var connect = voiceChannel.join();
            connect.then(connection => {
                connection.voice.setSelfDeaf(true);
            });

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

async function sendRequest(songTitle, songArtist, greetings, listener) {
    const requests_channel = bot.channels.cache.get(request_channel_id);

    let sEmbed = new Discord.MessageEmbed()
        .setColor(bot_colors.yellow)
        .setTitle(bot.user.username+' | Song Request')
        .addFields(
            {
                name: 'Song Title',
                value: `${songTitle}`,
                inline: true
            },
            {
                name: 'Artist',
                value: `${!songArtist ? 'N/A' : songArtist}`,
                inline: true
            },
            {
                name: 'From Listener',
                value: `${listener}`,
                inline: true
            },
            {
                name: 'Greetings',
                value: `${!greetings ? 'N/A' : greetings}`,
                inline: false
            }
        )
        .setFooter(`Developed and Maintained by ${bot_info.author} | v${bot_info.version}`, 'https://i.imgur.com/QLWADZx.jpg');
    requests_channel.send({embed: sEmbed});
}

// online status
bot.on('ready', async () => {
    bot.user.setActivity(`${bot_config.prefix}${bot_commands.help}`, {type: "LISTENING"});
    const logs_channel = bot.channels.cache.get('754119514307690506');
    
    let sEmbed = new Discord.MessageEmbed()
        .setTitle(bot.user.username+' Status')
        .setThumbnail('https://i.imgur.com/ABBUNkI.png')
        .setColor(bot_colors.green)
        .setDescription(`Discord Bot ${bot_lang.system_messages.online_status}`)
        .setFooter(`Developed and Maintained by ${bot_info.author} | v${bot_info.version}`, 'https://i.imgur.com/QLWADZx.jpg');
    logs_channel.send({embed: sEmbed});
    
    console.log(`${bot.user.username} Discord Bot ${bot_lang.system_messages.online_status}`);
    console.log(`Build v${bot_info.version}\nDeveloped by ${bot_info.author}\nRunning...`);
});

// error handling
bot.on('error', err => {
    console.warn(err);
});

// discord authentication
bot.login(token);
