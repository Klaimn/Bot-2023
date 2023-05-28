const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType} = require('discord.js');
const { Lockdown } = require('../../Handlers/Models/AllSchema')

const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Mod system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels)
    .addSubcommand(subcommand =>
        subcommand.setName('mute')
        .setDescription('Mute a member from the server.')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('Select the user you wish to mute')
            .setRequired(true)    
        )
        .addStringOption(option => 
            option.setName('time')
            .setDescription('How long should the mute last?')
            .setRequired(true)    
        )
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('What is the reason of the mute?')   
        )    
    )
    .addSubcommand(subcommand =>
        subcommand.setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('User to be kicked.')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('Reason for the kick.')
        )    
    )
    .addSubcommand(subcommand =>
        subcommand.setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('target')
            .setDescription('User to be banned.')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('Reason for the ban.')
        )    
    )
    .addSubcommand(subcommand => 
        subcommand.setName('clear')
        .setDescription('Clear a specific amount of messages from a target or channel.')
        .addIntegerOption(option => 
            option.setName('amount')
            .setDescription('Amount of messages to clear')
            .setRequired(true)
        )
        .addUserOption(option => 
            option.setName('target')
            .setDescription('Select a target to clear their messages.')
            .setRequired(false)    
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('unmute')
        .setDescription('Unmute a member from the server.')
        .addUserOption(option => 
            option.setName('target')
            .setDescription('Select the user you wish to unmute')
            .setRequired(true)    
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('unban')
        .setDescription('Unban a user from the server')
        .addUserOption(option =>
            option.setName('userid')
            .setDescription('Discord ID of the user you to unban.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('lock')
        .setDescription('Lock a channel for a specify time.')
        .addStringOption(option => 
            option.setName('time')
            .setDescription('Specify a time for the lockdown: (1m, 1h, 1d).')
            .setRequired(true)    
        )
        .addStringOption(option => 
            option.setName('reason')
            .setDescription('Specify the reason for the lockdown.')   
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('unlock')
        .setDescription('Unlock a channel.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('create-channel')
        .setDescription('Create a custom discord channel.')
        .addStringOption(option => 
            option.setName('channel-type')
            .setRequired(true)
            .setDescription('Set the type of the channel.')
            .addChoices(
                {name: 'Text channel', value: 'textchannel'},
                {name: 'Voice channel', value: 'voicechannel'},
            )
        )
        .addStringOption(option => 
            option.setName('channel-name')
            .setDescription('Set the name of the channel')
            .setRequired(true)
        )
        .addChannelOption(option => 
            option.setName('parent')
            .setDescription('Set the parent of the channel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addRoleOption(option =>
            option.setName('permission-role')
            .setDescription('Set the name of the channel.')
            .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('everyone')
            .setDescription('Tag @everyone.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('delete-channel')
        .setDescription('Delete a discord channel.')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('Select the channel to delete')
            .setRequired(true)
        )
    ),

    folder: 'Moderation',

    runSlash: async (interaction) => {
        const {channel, guild, options, guildId, user, member} = interaction;

        const sub = options.getSubcommand()
        
        const reason = options.getString('reason') || 'No reason provided';
        const embed = new EmbedBuilder()

        switch (sub) {
            case 'clear':
                const amount = options.getInteger('amount');
                const user4 = options.getUser('target');

                const messages = await channel.messages.fetch();

                const res = new EmbedBuilder()
                .setColor('#2f3136')

                if(user4) {
                    let i = 0;
                    const filtered = [];

                    (await messages).filter((msg) => {
                        if(msg.author.id === user4.id && amount > i) {
                            filtered.push(msg);
                            i++;
                        }
                    });

                    await channel.bulkDelete(amount).then(messages => {
                        res.setDescription(`Successfully deleted ${messages.size} messages from ${user4}.`).setColor("#2F3136");
                        interaction.reply({embeds: [res], ephemeral: true});
                    })
                } else {
                    await channel.bulkDelete(amount).then(messages => {
                        res.setDescription(`Successfully deleted ${messages.size} messages from the channel.`).setColor("#2F3136");
                        interaction.reply({embeds: [res], ephemeral: true});
                    });
                }
            break;
            case 'mute':
                const user1 = options.getUser('target');
                const member1 = guild.members.cache.get(user1.id);
                
                const time1 = options.getString('time');
                const convertedTime = ms(time1);

                const error1 = new EmbedBuilder()
                .setColor("#2F3136")
                .setDescription('Something went wrong. Please try again later.');

                const success1 = new EmbedBuilder()
                .setAuthor({ name: `${user1.tag}` + '・Mute', iconURL: user1.displayAvatarURL({ size: 256, dynamic: true })})
                .setFooter({ text: `Duration: ${time1} ・ Reason: ${reason}`})
                .setColor("#2F3136");

                if (member1.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({embeds: [error1], ephemeral: true});

                if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
                return interaction.reply({embeds: [error1], ephemeral: true});

                if (!convertedTime)
                return interaction.reply({embeds: [error1], ephemeral: true});

                try {
                    await member1.timeout(convertedTime, reason);

                    interaction.reply({embeds: [success1], ephemeral: true});
                } catch (err) {
                    console.log(err);
                }
            break;
            case 'kick':
                const user2 = options.getUser('target');
                const member2 = await interaction.guild.members.fetch(user2.id);

                const error2 = new EmbedBuilder()
                .setDescription(`You can't take action on ${user2.username} since they have a higher role.`).setColor("#2F3136")

                if (member2.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({embeds: [error2], ephemeral: true});

                await member2.kick(reason)

                const success2 = new EmbedBuilder()
                .setDescription(`Successfully kicked ${user2} with reason: ${reason}`).setColor("#2F3136");

                await interaction.reply({embeds: [success2], ephemeral: true});
            break;
            case 'ban':
                const user3 = options.getUser('target');
                const member3 = await interaction.guild.members.fetch(user3.id);

                const error3 = new EmbedBuilder()
                .setDescription(`You can't take action on ${user3.username} since they have a higher role.`)

                if (member3.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({embeds: [error3], ephemeral: true});

                await member3.kick(reason)

                const success3 = new EmbedBuilder()
                .setColor("#2F3136")
                .setDescription(`Successfully banned ${user3} with reason: ${reason}`)
                .setTimestamp();

                await interaction.reply({embeds: [success3], ephemeral: true});
            break;
            case 'unmute':
                const user5 = options.getUser('target');
                const member = guild.members.cache.get(user5.id);

                const error4 = new EmbedBuilder()
                .setColor("#2F3136")
                .setDescription('Something went wrong. Please try again later.');

                const success4 = new EmbedBuilder()
                .setColor("#2F3136")
                .setAuthor({ name: `${user5.tag}` + '・Unmute', iconURL: user.displayAvatarURL({ size: 256, dynamic: true })})
                .setTimestamp();

                if (member.roles.highest.position >= interaction.member.roles.highest.position)
                return interaction.reply({embeds: [error4], ephemeral: true});

                if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers))
                return interaction.reply({embeds: [error4], ephemeral: true});

                try {
                    await member.timeout(null);

                    interaction.reply({embeds: [success4], ephemeral: true});
                } catch (err) {
                    console.log(err);
                }
            break;
            case 'unban':
                const userId = options.getUser('userid');
        
                try {
                    await interaction.guild.members.unban(userId);

                    const success5 = new EmbedBuilder()
                    .setColor("#2F3136")
                    .setDescription(`Successfully unbanned id ${userId} from the server.`)
                    .setTimestamp();

                    await interaction.reply({embeds: [success5], ephemeral: true});
                } catch (err) {
                    console.log(err);

                    const error5 = new EmbedBuilder()
                    .setColor("#2F3136")
                    .setDescription(`Please provide a valide member's ID.`);

                    interaction.reply({embeds: [error5], ephemeral: true});
                }
            break;
            case 'lock':
                const time2 = options.getString('time') || 'No time specified / infinite.';

                if(!channel.permissionsFor(guild.id).has('SendMessages'))
                return interaction.reply({ embeds: [
                        embed.setColor('#2F3136').setDescription('This channel is already locked.')
                    ],
                    ephemeral: true
                });

                channel.permissionOverwrites.edit(guild.id, {
                    SendMessages: false,
                });

                interaction.reply({ embeds : [
                        embed.setColor('#2F3136').setDescription(`This channel is now locked for ${time2} with reason ${reason}.`)
                    ]
                });

                const Time = options.getString('time')
                if (Time) {
                    const ExpireDate = Date.now() + ms(Time);
                    Lockdown.create({
                        GuildID: guild.id,
                        ChannelID: channel.id,
                        Time: ExpireDate,
                    });

                    setTimeout(async () => {
                        channel.permissionOverwrites.edit(guild.id, {
                            SendMessages: null,
                        });

                        interaction.editReply({ embeds: [
                            embed.setColor('#2F3136').setDescription(`The lockdown with reason ${reason} and with length ${time2} has been cancelled.`)
                        ]
                    })
                    .catch(() => {});
                    
                    await Lockdown.deleteOne({ ChannelId: channel.id})
                    }, ms(Time));
                }
            break;
            case 'unlock':
                if(channel.permissionsFor(guild.id).has('SendMessages'))
                return interaction.reply({ embeds: [
                        embed.setColor('#2F3136').setDescription('This channel isn\'t locked.')
                    ],
                    ephemeral: true
                });

                channel.permissionOverwrites.edit(guild.id, {
                    SendMessages: null,
                });

                await Lockdown.deleteOne({ ChannelId: channel.id});

                interaction.reply({ embeds: [
                    embed.setColor('#2F3136').setDescription(`The lockdown has been cancelled.`)
                ]
            })
            break;
            case 'create-channel':
                const {ViewChannel, ReadMessageHistory, SendMessages, Connect, Speak} = PermissionFlagsBits;

                const channeltype = options.getString('channel-type');
                const channelname = options.getString('channel-name');
                const parent = options.getChannel('parent');
                const permissions = options.getRole('permission-role');
                const everyone = options.getRole('everyone');

                if(channeltype === 'textchannel') {
                    await guild.channels.create({
                        name: `${channelname}`,
                        type: ChannelType.GuildText,
                        parent: parent,
                        permissionOverwrites: [
                            {
                                id: permissions,
                                allow: [ViewChannel, SendMessages, ReadMessageHistory],
                            },
                            {
                                id: everyone,
                                deny: [ViewChannel, SendMessages, ReadMessageHistory],
                            }
                        ]
                    })
                };

                if(channeltype === 'voicechannel') {
                    await guild.channels.create({
                        name: `${channelname}`,
                        type: ChannelType.GuildVoice,
                        parent: parent,
                        permissionOverwrites: [
                            {
                                id: permissions,
                                allow: [ViewChannel, Connect, Speak],
                            },
                            {
                                id: everyone,
                                deny: [ViewChannel, Connect, Speak],
                            }
                        ]
                    })
                };

                await interaction.reply({ content: 'The channel was successfully created.', ephemeral: true });
            break;
            case 'delete-channel':
                const channels = options.getChannel('channel');

                channels.delete()

                await interaction.reply({ content: 'The channel was successfully deleted.', ephemeral: true });
            break;
        };
    },
};