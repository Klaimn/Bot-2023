const {SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonStyle, ActionRowBuilder, ButtonBuilder, ChannelType, ActivityType} = require('discord.js');
const {Ticket} = require('../../Handlers/Models/AllSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Administrator system.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup(group => group
            .setName('update')
            .setDescription('Update the bots presences.')
            .addSubcommand(subcommand => subcommand
                .setName('activity')
                .setDescription('Update the bots activity')
                .addStringOption(option => option
                    .setName('type')
                    .setDescription('Pick an activity')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Playing', value: 'Playing'},
                        {name: 'Streaming', value: 'Streaming'},
                        {name: 'Listening', value: 'Listening'},
                        {name: 'Watching', value: 'Watching'},
                        {name: 'Competing', value: 'Competing'},
                    )
                )
                .addStringOption(option => option
                    .setName('activity')
                    .setDescription('Set your current activity.')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('status')
                .setDescription('Update the bots status')
                .addStringOption(option => option
                    .setName('type')
                    .setDescription('Pick an activity')
                    .setRequired(true)
                    .addChoices(
                        {name: 'Online', value: 'online'},
                        {name: 'Idle', value: 'idle'},
                        {name: 'Do not disturb', value: 'dnd'},
                        {name: 'Invisible', value: 'invisible'},
                    )
                )
            )
        )
        .addSubcommandGroup(group => group
            .setName('youtube')
            .setDescription('Manage and receive notifications from Youtube channels')
            .addSubcommand(subcommand => subcommand
                .setName('add')
                .setDescription('Add a channel to receive new Youtube video notifications.')
                .addStringOption(option => option
                    .setName('link')
                    .setDescription('The link of the channel you want to receive notifications from.')
                    .setRequired(true)
                )
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('The channel you wish to send the notifications to.')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('remove')
                .setDescription('Remove an registered channel from the notification list.')
                .addStringOption(option => option
                    .setName('link')
                    .setDescription('The link of the channel you want to stop receiving notifications from.')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('removeall')
                .setDescription('Remove all registered channel from the notification list.')    
            )
            .addSubcommand(subcommand => subcommand
                .setName('latestvideo')
                .setDescription('Get the latest video from a channel.')    
                .addStringOption(option => option
                    .setName('link')
                    .setDescription('The link of the latest video.')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('info')
                .setDescription('Get information about a channel.') 
                .addStringOption(option => option
                    .setName('link')
                    .setDescription('The link of the channel.')
                    .setRequired(true)
                )   
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('poll')
            .setDescription('Create a poll and send it to a certain channel.')
            .addChannelOption(option => 
                option.setName('channel')
                .setDescription('Where do you want to send the poll to ?')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
            .addStringOption(option => 
                option.setName('description')
                .setDescription('Describe the poll.')
                .setRequired(true)    
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('createverify')
            .setDescription('Set your verification channel')
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('Send verification embed in this channel')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('ticket')
            .setDescription("Ticket actions")
            .addStringOption(option => 
                option.setName('action')
                .setDescription('Add or remove members frome the ticket.')
                .setRequired(true)    
                .addChoices(
                     { name: 'Add', value: 'add'},
                     { name: 'Remove', value: 'remove'}
                )
            )
            .addUserOption(option =>
                option.setName('member')
                .setDescription('Select a member from the server to perform the action on.')
                .setRequired(true)
            )
        ),

        folder: 'Administration',
 
    runSlash: async (interaction, client) => {
        
        const {guildId, options, channel} = interaction;

        const group = options.getSubcommandGroup();
        const sub = options.getSubcommand();

        const type = options.getString('type');
        const activity = options.getString('activity');
        const action = options.getString('action');
        const member = options.getUser('member');
        const link = options.getString('link');

        const embed = new EmbedBuilder();

        switch (group) {
            case 'update': 
                try {
                switch (sub) {
                    case 'activity':
                        switch(type) {
                            case 'Playing':
                                client.user.setActivity(activity, { type: ActivityType.Playing });
                            break;
                            case 'Streaming':
                                client.user.setActivity(activity, { type: ActivityType.Streaming });
                            break;
                            case 'Listening':
                                client.user.setActivity(activity, { type: ActivityType.Listening });
                            break;
                            case 'Watching':
                                client.user.setActivity(activity, { type: ActivityType.Watching });
                            break;
                            case 'Competing':
                                client.user.setActivity(activity, { type: ActivityType.Competing });
                            break;
                            }
                        break;
                        case 'status':
                            client.user.setPresence({status: type});
                        break;
                    }
                } catch (err) {
                    console.log(err);
                }
            
                return interaction.reply({embeds: [embed.setDescription(`Succesfully updated your ${sub} to **${type}**.`).setColor('#2F3136')],ephemeral: true })
            break;
            case 'youtube':
                const youtube = options.getChannel('channel');
                try {
                    switch (sub) {
                        case 'add':
                            client.ytb.setChannel(link, youtube).then(data => {
                                interaction.reply({ embeds: [embed.setDescription(`Successfully added new channel ${data.YTchannel} to ${youtube}.`).setColor('#2F3136').setTimestamp()], ephemeral: true})
                            }).catch(err => {
                                console.log(err);
                                return interaction.reply({ embeds: [embed.setColor('#2F3136').setDescription('Something went wrong, please contact developers.')], ephemeral: true})
                            })
                        break;
                        case 'remove':
                            client.ytb.deleteChannel(guildId, link).then(data => {
                                interaction.reply({ embeds: [embed.setDescription(`Successfully removed channel ${link} to ${guildId}.`).setColor('#2F3136').setTimestamp()], ephemeral: true})
                            }).catch(err => {
                                console.log(err);
                                return interaction.reply({ embeds: [embed.setColor('#2F3136').setDescription('Something went wrong, please contact developers.')], ephemeral: true})
                            })
                        break;
                        case 'removeall':
                            client.ytb.deleteAllChannels(guildId).then(data => {
                                interaction.reply({ embeds: [embed.setDescription(`Successfully deleted all channels in ${guildId}.`).setColor('#2F3136').setTimestamp()], ephemeral: true})
                            }).catch(err => {
                                console.log(err);
                                return interaction.reply({ embeds: [embed.setColor('#2F3136').setDescription('Something went wrong, please contact developers.')], ephemeral: true})
                            })
                        break;
                        case 'latestvideo':
                            client.ytb.getLatestVideos(link).then(data => {
                                interaction.reply({ embeds: [embed.setTitle(`${data[0].title}.`).setURL(data[0].link)]})
                                return interaction.channel.send({ content: `${data[0].link}`, ephemeral: true });
                            }).catch(err => {
                                console.log(err);
                                return interaction.reply({ embeds: [embed.setColor('#2F3136').setDescription('Something went wrong, please contact developers.')], ephemeral: true})
                            })
                        break;
                        case 'info':
                            client.ytb.getChannelInfo(link).then(data => {
                                embed.setTitle(data.name)
                                .addFields(
                                    {name: 'URL', value: `${data.url}`, inline: true},
                                    {name: 'Subscribers', value: `${data.subscribers.split(" ")[0]}`, inline: true},
                                    {name: 'Description', value: `${data.description}`, inline: true},
                                )
                                //.setImage(data.banner[0].url)
                                .setTimestamp();
                                interaction.reply({ embeds: [embed]})
                            }).catch(err => {
                                console.log(err);
                                return interaction.reply({ embeds: [embed.setColor('#2F3136').setDescription('Something went wrong, please contact developers.')], ephemeral: true})
                            });
                        break;
                        
                    }
                } catch (err) {
                    console.log(err);
                    return interaction.reply({ embeds: [embed.setColor('#2F3136').setDescription('Something went wrong, please contact developers.')], ephemeral: true})
                }
            break;
        }

        switch (sub) {
            case 'poll':
                const description = options.getString('description');
                const pollChannel = options.getChannel('channel');
        
                const embed = new EmbedBuilder()
                .setDescription(description)
                .setColor("#2F3136");
        
                try {
                    const m = await pollChannel.send({embeds: [embed]});
                    await m.react('✅')
                    await m.react('❌')
                    await interaction.reply({content: 'Poll was succesfuly sent to the channel', ephemeral: true})
                } catch (err) {
                    console.log(err);
                }
            break;
            case 'createverify':
                const verifyChannel = options.getChannel('channel');
                const verifyEmbed = new EmbedBuilder()
                .setTitle("Verification")
                .setDescription('Click the button to verify your account and get access to the channels.')
                .setColor("#2F3136")
                let sendChannel = verifyChannel.send({
                    embeds: ([verifyEmbed]),
                    components: [
                        new ActionRowBuilder().setComponents(
                            new ButtonBuilder().setCustomId('verify').setLabel('Verify').setStyle(ButtonStyle.Success),
                        ),
                    ],
                });
                if (!sendChannel) {
                    return interaction.reply({content: 'There was an error! Try again later.', ephemeral: true});
                } else {
                    return interaction.reply({content: 'Verification channel was succesfully set!', ephemeral: true});
                };       
            break;
            case 'ticket':
                const ticket = new EmbedBuilder();
                switch (action) {
                    case 'add':
                        Ticket.findOne({ GuildID: guildId, ChannelID: channel.id}, async (err, data) => {
                            if (err) throw err;
                            if (!data) 
                            return interaction.reply({embeds: [ticket.setColor('Red').setDescription('Something went wrong. Try again later.')], ephemeral: true});
        
                            if (data.MembersID.includes(member.id))
                            return interaction.reply({embeds: [ticket.setColor('Red').setDescription('Something went wrong. Try again later.')], ephemeral: true});
        
                            data.MembersID.push(member.id);
        
                            channel.permissionOverwrites.edit(member.id, {
                                SendMessages: true,
                                ViewChannel: true,
                                ReadMessageHistory: true
                            });
        
                            interaction.reply({embeds: [ticket.setColor('Green').setDescription(`${member}  has been added to the ticket.`)]});
        
                            data.save();
                        });
                    break;
                    case 'remove':
                        Ticket.findOne({ GuildID: guildId, ChannelID: channel.id}, async (err, data) => {
                            if (err) throw err;
                            if (!data) 
                            return interaction.reply({embeds: [ticket.setColor('Red').setDescription('Something went wrong. Try again later.')], ephemeral: true});
        
                            if (!data.MembersID.includes(member.id))
                            return interaction.reply({embeds: [ticket.setColor('Red').setDescription('Something went wrong. Try again later.')], ephemeral: true});
        
                            data.MembersID.remove(member.id);
        
                            channel.permissionOverwrites.edit(member.id, {
                                SendMessages: false,
                                ViewChannel: false,
                                ReadMessageHistory: false
                            });
        
                            interaction.reply({embeds: [ticket.setColor('Green').setDescription(`${member} has been removed from the ticket.`)]});
        
                            data.save();
                        });
                    break;          
                }
            break;
        }

        
    }
}