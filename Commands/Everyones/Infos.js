const {SlashCommandBuilder, EmbedBuilder, ChannelType, GuildVerificationLevel, GuildExplicitContentFilter, GuildNSFWLevel, GuildForum, PermissionsBitField} = require('discord.js');
const cpuStat = require('cpu-stat');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Informations system')
    .setDMPermission(false)
    .addSubcommand(subcommand => 
        subcommand.setName('bot')
        .setDescription('Get information about the bot.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('server')
        .setDescription('Get information about the server.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('uptime')
        .setDescription('Shows you the uptime of the bot.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('member')
        .setDescription('Get information about a member.')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('Select a member.')
        )
    ),

    folder: 'Everyone',

    runSlash: async (interaction, client) => {

        const {guild, options} = interaction;
        const sub = options.getSubcommand(['user', 'server', 'bot', 'uptime']);
        const embed = new EmbedBuilder()

        const days = Math.floor(client.uptime / 86400000)
        const hours = Math.floor(client.uptime / 3600000) % 24
        const minutes = Math.floor(client.uptime / 60000) % 60
        const seconds = Math.floor(client.uptime / 1000)  % 60
        

        switch (sub) {
            case 'member':
                const member = options.getMember('target') || interaction.member;

                const icon = member.displayAvatarURL();
                const tag = member.user.tag;

                const isModerator = member.permissions.has(PermissionsBitField.Flags.ModerateMembers);
                const isBot = member.user.bot;

                const createdAt = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;
                const joinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;

                const Listroles = member.roles.cache
                    .filter(role => role.name !== '@everyone')
                    .map(role => role)
                    .join(', ');

                    embed.setAuthor({ name: tag, iconURL: icon})
                    .setColor('#2F3136')
                    .addFields(
                    { name: 'Name', value: member.toString(), inline: true },
                    { name: 'Moderator', value: isModerator ? '🟢' : '🔴', inline: true },
                    { name: 'Bot', value: isBot ? '🟢' : '🔴', inline: true },
                    { name: 'Account created', value: createdAt, inline: true },
                    { name: 'Joined the server', value: joinedAt, inline: true },
                    { name: 'Roles', value: Listroles || 'No roles', inline: false }
                    )
                    .setFooter({ text: `User ID: ${member.id}`})
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            break;
            case 'server':
                const {members, channels, emojis, roles, stickers} = guild;

                const sortedRoles = roles.cache.map(role => role).slice(1, roles.cache.size).sort((a, b) => b.position - a.position);
                const userRoles = sortedRoles.filter(role => !role.managed);
                const managedRoles = sortedRoles.filter(role => role.managed);
                const botCount = members.cache.filter(members => members.user.bot).size;

                const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
                    let totalLength = 0;
                    const result = [];

                    for (const role of roles) {
                        const roleString = `<@&${role.id}>`;

                        if(roleString.length + totalLength > maxFieldLength)
                        break;

                        totalLength += roleString.length + 1
                        result.push(roleString);
                    }   

                    return result.length;
                }

                const splitPascal = (string, separator) => string.split(/(?=[A-U])/).join(separator);
                const toPascalCase = (string, separator = false) => {
                    const pascal = string.charAt(0).toUpperCase() + string.slice(1).toLowerCase().replace(/[a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
                    return separator ? splitPascal(pascal, separator) : pascal;
                };

                const getChannelTypeSize = type => channels.cache.filter(channel => type.includes(channel.type)).size;

                const totalChannels = getChannelTypeSize([ ChannelType.GuildText, ChannelType.GuildNews, ChannelType.GuildVoice, ChannelType.GuildStageVoice, ChannelType.GuildForum, ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNewsThread, ChannelType.GuildCategory]);

                
                embed.setColor('#2F3136')
                .setTitle(`${guild.name}'s informations`)
                .setThumbnail(guild.iconURL({ size: 1024}))
                .setImage(guild.bannerURL({ size: 1024}))
                .addFields(
                    {name: 'Description', value: `${guild.description || 'None'}`},
                    {
                        name: 'General',
                        value: [
                            `**Created At** <t:${parseInt(guild.createdTimestamp / 1000)}:R>`,
                            `**ID** ${guild.id}`,
                            `**Owner** <@${guild.ownerId}>`,
                            `**Language** ${new Intl.DisplayNames(['en'], {type: 'language'}).of(guild.preferredLocale)}`,
                            `**Vanity URL** ${guild.vanityURLCode || 'None'}`,
                        ].join('\n')
                    },
                    { name: 'Features', value: guild.GuildFeature?.map(feature => `- ${toPascalCase(feature, " ")}`)?.join('\n') || 'None', inline: true},
                    {
                        name: 'Security',
                        value: [
                            `**Explicit Filter** ${splitPascal(GuildExplicitContentFilter[guild.explicitContentFilter], ' ')}`,
                            `**NSFW Level** ${splitPascal(GuildNSFWLevel[guild.nsfwLevel], ' ')}`,
                            `**Verification Level** <@${splitPascal(GuildVerificationLevel[guild.verificationLevel], ' ')}>`,
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: `Member (${guild.memberCount})`,
                        value: [
                            `**User** ${guild.memberCount - botCount}`,
                            `**Bots** ${botCount}`,
                        ].join('\n'),
                        inline: true
                    },
                    {name: `User roles (${maxDisplayRoles(userRoles)} of ${userRoles.length})`, value: `${userRoles.slice(0, maxDisplayRoles(userRoles)).join('') || 'None'}`},
                    {name: `Bot roles (${maxDisplayRoles(managedRoles)} of ${managedRoles.length})`, value: `${managedRoles.slice(0, maxDisplayRoles(managedRoles)).join('') || 'None'}`},
                    {
                        name: `Channels, Threads and Categories... (${totalChannels})`,
                        value: [
                            `**Text Channel** ${getChannelTypeSize([ChannelType.GuildText, ChannelType.GuildForum, ChannelType.GuildNews])}`,
                            `**Voice Channel** ${getChannelTypeSize([ChannelType.GuildVoice, ChannelType.GuildStageVoice])}`,
                            `**Thread Channel** ${getChannelTypeSize([ChannelType.GuildPublicThread, ChannelType.GuildPrivateThread, ChannelType.GuildNewsThread])}`,
                            `**Forum Channel** ${getChannelTypeSize([ChannelType.GuildForum])}`,
                            `**Categories** ${getChannelTypeSize([ChannelType.GuildCategory])}`,
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: `Emojis & Stickers (${emojis.cache.size + stickers.cache.size})`,
                        value: [
                            `**Animated** ${emojis.cache.filter(emoji => emoji.animated).size}`,
                            `**Static** ${emojis.cache.filter(emoji => !emoji.animated).size}`,
                            `**Stickers** ${stickers.cache.size}`,
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: `Nitro`,
                        value: [
                            `**Level** ${guild.premiumTier || 'None'}`,
                            `**Boosts** ${guild.premiumSubscriptionCount}`,
                            `**Boosters** ${guild.members.cache.filter(member => member.roles.premiumSubscriptionRole).size}`,
                            `**Total Boosters** ${guild.members.cache.filter(member => member.roles.premiumSubscriptionRole).size}`,
                        ].join('\n'),
                        inline: true
                    },
                    { name: 'Banner', value: guild.bannerURL() ? '** **' : 'None'},
                    
                )
                interaction.reply({embeds: [embed], ephemeral: true});
            break;
            case 'bot':
                cpuStat.usagePercent(function (error, percent) {
                    if(error) return interaction.reply({ content: `${error}`})
        
                    const memoryUsage = formatBytes(process.memoryUsage().heapUsed)
                    const node = process.version
                    const cpu = percent.toFixed(2)
        
                    embed.setTitle('Bot information')
                    .setColor('#2F3136')
                    .setTimestamp()
                    .addFields(
                        { name: 'Developer', value: 'Klaimn', inline: true },
                        { name: 'Username', value: `${client.user.username}`, inline: true},
                        { name: 'ID', value: `${client.user.id}`, inline: true},
                        { name: 'Creation date', value: `<t:${parseInt(client.user.createdAt / 1000)}:R>`},
                        { name: 'Help Command', value: `help`},
                        { name: 'Uptime', value: `\`${days}\` days, \`${hours}\` hours, \`${minutes}\` minutes and \`${seconds}\` seconds.`},
                        { name: 'Bot-Ping', value: `${client.ws.ping}ms`},
                        { name: 'Node version', value: `${node}`},
                        { name: 'CPU usage', value: `${cpu}%`},
                        { name: 'Memory usage', value: `${memoryUsage}%`},
                    )
        
                    interaction.reply({ embeds: [embed], ephemeral: true })
                })
        
                function formatBytes(a, b) {
                    let c = 1024
                    d = b || 2
                    e = ['B', 'KB', 'MB', 'GB', 'TB']
                    f = Math.floor(Math.log(a) / Math.log(c))
        
                    return parseFloat((a / Math.pow(c, f)).toFixed(d)) + ``+ e[f]
                }
            break;
            case 'uptime':
                embed.setTitle(`__${client.user.username}'s Uptime__`)
                .setColor('#2F3136')
                .setTimestamp()
                .addFields(
                    { name: 'Uptime', value: `\`${days}\` days, \`${hours}\` hours, \`${minutes}\` minutes and \`${seconds}\` seconds.`, inline: true},
                )

                interaction.reply({ embeds: [embed], ephemeral: true })
            break;
        }
    }
}