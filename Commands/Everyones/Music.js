const {EmbedBuilder, SlashCommandBuilder} = require('discord.js');
const client = require('../../Launcher');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('m')
    .setDescription('Music system.')
    .addSubcommand(subcommand => 
        subcommand.setName('play')
        .setDescription('Play a music.')
        .addStringOption(option =>
            option.setName('query')
            .setDescription('Provide the name or url for the song.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('stop')
        .setDescription('Stop the music.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('pause')
        .setDescription('Play the music.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('resume')
        .setDescription('Resume the music.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('nowplaying')
        .setDescription('Display the currently playing song.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('skip')
        .setDescription('Skip the music.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('rewind')
        .setDescription('Rewind the music.')
        .addIntegerOption(option => 
            option.setName('seconds')
            .setDescription('Amount of seconds to rewinds (10 = 10s)')
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('forward')
        .setDescription('Forward the music.')
        .addIntegerOption(option => 
            option.setName('seconds')
            .setDescription('Amount of seconds to rewinds (10 = 10s)')
            .setMinValue(0)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('shuffle')
        .setDescription('Shuffle current playlist.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('queue')
        .setDescription('Get the list of your currently active queue.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('volume')
        .setDescription('Adjust the player\'s volume.')
        .addIntegerOption(option =>
            option.setName('percent')
            .setDescription('10 = 10%')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('loop')
        .setDescription('Loop options: off, song, queue')
        .addStringOption(option => 
            option.setName('options')
            .setDescription('Loop options: off, song, queue')
            .addChoices(
                {name: 'off', value: 'off'},
                {name: 'song', value: 'song'},
                {name: 'queue', value: 'queue'},
            )
            .setRequired(true)
        )
    ),

    folder: 'Everyone',
    
    runSlash: async (interaction) => {

        const {options, member, guild, channel} = interaction;

        const sub = options.getSubcommand(['play', 'embed', 'pause', 'resume', 'nowplaying', 'skip', 'rewind', 'forward', 'shuffle', 'queue', 'volume', 'loop']);

        const voiceChannel = member.voice.channel;
        const seconds = options.getInteger('seconds');
        const embed = new EmbedBuilder();

        switch (sub) {
            case 'play': 
                const query = options.getString('query');  

                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                try {
                    
                    client.distube.play(voiceChannel, query, {textChannel: channel, member: member});
                    return interaction.reply({content: 'Request received.', ephemeral: true});

                } catch (err) {
                    console.log(err);

                    embed.setColor('Red').setDescription('Something went wrong...');

                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'stop':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                try {
                    
                    const queue = await client.distube.getQueue(voiceChannel);

                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }

                    await queue.stop(voiceChannel);
                    embed.setColor('#2F3136').setDescription('⏹ The queue has been stopped.');
                    return interaction.reply({embeds: [embed], ephemeral: true});

                } catch (err) {
                    console.log(err);

                    embed.setColor('Red').setDescription('Something went wrong...');

                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'pause':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
        
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
                    
                    await queue.pause(voiceChannel);
                    embed.setColor('#2F3136').setDescription('⏸ The queue has been paused.');
                    return interaction.reply({embeds: [embed], ephemeral: true});
        
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'resume':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
                    
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
        
                    await queue.resume(voiceChannel);
                    embed.setColor('#2F3136').setDescription('⏯ The queue has been resumed.');
                    return interaction.reply({embeds: [embed], ephemeral: true});
        
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'nowplaying':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
        
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
                    
        
                    const song = queue.songs[0];
                    embed.setColor('#2F3136').setDescription(`**Currently playing** \`${song.name}\` - \`${song.formattedDuration}\`.\n**Link:** ${song.url}`).setThumbnail(song.thumbnail);
                    return interaction.reply({embeds: [embed], ephemeral: true});
        
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'skip':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
                    
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
        
                    await queue.skip(voiceChannel);
                    embed.setColor('#2F3136').setDescription('⏭ The song has been skipped.');
                    return interaction.reply({embeds: [embed], ephemeral: true});
        
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'rewind':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                try {

                    const queue = await client.distube.getQueue(voiceChannel);

                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
                    
                    await queue.seek(queue.currentTime - seconds);
                    embed.setColor('#2F3136').setDescription(`⏪ Rewinded the song for \`${seconds}s\`.`);
                    return interaction.reply({embeds: [embed], ephemeral: true});

                } catch (err) {
                    console.log(err);

                    embed.setColor('Red').setDescription('Something went wrong...');

                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'forward':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
        
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
                    
                    await queue.seek(queue.currentTime + seconds);
                    embed.setColor('#2F3136').setDescription(`⏩ Forwarded the song for \`${seconds}s\`.`);
                    return interaction.reply({embeds: [embed], ephemeral: true});
        
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'shuffle':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
        
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
                    
        
                    await queue.shuffle();
                    embed.setColor('#2F3136').setDescription('Shuffled songs in the queue.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
        
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'queue':
                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
                    
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
        
                    embed.setColor('#2F3136').setDescription(`${queue.songs.map(
                        (song, id) => `\n**${id + 1}.** ${song.name} - \`${song.formattedDuration}\``
                    )}`);
                    return interaction.reply({embeds: [embed], ephemeral: true});
        
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'volume':
                const volume = options.getInteger('percent');

                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }

                try {

                    client.distube.setVolume(voiceChannel, volume);
                    return interaction.reply({content: `Volume has been set to ${volume}%.`, ephemeral: true});

                } catch (err) {
                    console.log(err);

                    embed.setColor('Red').setDescription('Something went wrong...');

                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
            case 'loop':
                const option = options.getString('options');

                if (!voiceChannel) {
                    embed.setColor('#2F3136').setDescription('You must be in voice channel to execute music commands.')
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                if (!member.voice.channelId === guild.members.me.voice.channelId) {
                    embed.setColor('#2F3136').setDescription(`You can't use the music player as it is already active in <#${guild.members.me.voice.channelId}`)
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
        
                try {
        
                    const queue = await client.distube.getQueue(voiceChannel);
        
                    if (!queue) {
                        embed.setColor('#2F3136').setDescription('There is no active queue.');
                        return interaction.reply({embeds: [embed], ephemeral: true});
                    }
                    
                    let mode = null
                    
                    switch(option) {
                        case 'off': 
                            mode = 0;
                        break;
                        case 'song': 
                            mode = 1;
                        break;
                        case 'queue':
                            mode = 2; 
                        break;
                    }
        
                    mode = await queue.setRepeatMode(mode);
                    
                    embed.setColor('#2F3136').setDescription(`🔁 Set repeat mode to \`${mode}\`.`);
                    return interaction.reply({embeds: [embed], ephemeral: true});
                    
                } catch (err) {
                    console.log(err);
        
                    embed.setColor('Red').setDescription('Something went wrong...');
        
                    return interaction.reply({embeds: [embed], ephemeral: true});
                }
            break;
        }
    }
}