const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require("discord.js");
const { Welcome, Logs, TicketSetup, ChannelSuggest } = require('../../Handlers/Models/AllSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
        subcommand.setName('welcome')
        .setDescription('Set up your welcome message for the discord bot.')
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('Channel for welcome messages.')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('welcome-message')
            .setDescription('Enter your welcome message.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => 
        subcommand.setName('logs')
        .setDescription('Set up your logging channel for the audit logs.')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('Channel for logging messages')
            .setRequired(false)
        )    
    )
    .addSubcommand(subcommand => 
        subcommand.setName('ticket')
        .setDescription('Set up your ticket message for the discord server.')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('Select the channel where the tickets should be created.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption(option => 
            option.setName('category')
            .setDescription('Select the category where the tickets should be created.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addChannelOption(option => 
            option.setName('transcripts')
            .setDescription('Select the transcripts where the tickets should be sent.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption(option => 
            option.setName('handlers')
            .setDescription('Select the ticket handlers role.')
            .setRequired(true)
        )
        .addRoleOption(option => 
            option.setName('everyone')
            .setDescription('Tag the everyone role.')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('description')
            .setDescription('Set the description for the ticket embed.')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('firstbutton')
            .setDescription('Format: (Name of button, Emoji).')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('secondbutton')
            .setDescription('Format: (Name of button, Emoji).')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('thirdbutton')
            .setDescription('Format: (Name of button, Emoji).')
            .setRequired(true)
        )   
    )
    .addSubcommand(subcommand => 
        subcommand.setName('suggestion')
        .setDescription('Set up your suggestion channel for the discord server.')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('Select the channel where the suggestions should be created.')
            .setRequired(true)
        )
    ),
    
    folder: 'Moderation',

    runSlash: async (interaction) => {
        const {channel, guildId, options, guild} = interaction;

        const sub = options.getSubcommand(['welcome', 'logs', 'ticket', 'suggestion']);
        const embed = new EmbedBuilder();

        switch (sub) {
            case 'welcome':
                const welcomeChannel = options.getChannel('channel');
                const welcomeMessage = options.getString('welcome-message');

                if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages)) {
                    interaction.reply({content: "I don't have permissions for this.", ephemeral:true});
                }

                Welcome.findOne({Guild: interaction.guild.id}, async (err, data) => {
                    if(!data) {
                        const newWelcome = await Welcome.create({
                            Guild: interaction.guild.id,
                            Channel: welcomeChannel.id,
                            Msg: welcomeMessage
                        });
                    }
                    interaction.reply({content: 'Successfully created a welcome message', ephemeral: true});
                })
            break;
            case 'logs':
                const logChannel = options.getChannel('channel') || channel;

                Logs.findOne({Guild: guildId}, async (err, data) => {
                    if (!data) {
                        await Logs.create({
                            Guild: guildId,
                            Channel: logChannel.id
                        });

                    embed.setDescription('Data was successfully sent to the database.')
                    .setColor("#2F3136")
                    } else if (data) {
                        Logs.findOneAndDelete({Guild: guildId});
                        await Logs.create({
                            Guild: guildId,
                            Channel: logChannel.id
                        });

                    embed.setDescription('Old data was successfully replaced with the new data.')
                    .setColor("#2F3136")
                    }

                    if (err) {
                    embed.setDescription('Something went wrong. Please contact the developpers.')
                    .setColor("#2F3136")
                    }

                    return interaction.reply({embeds: [embed], ephemeral: true});
                })
            break;
            case 'ticket':
                try {
                    const channel1 = options.getChannel('channel');
                    const category = options.getChannel('category');
                    const transcripts = options.getChannel('transcripts');
        
                    const handlers = options.getRole('handlers');
                    const everyone = options.getRole('everyone');
                    
                    const description = options.getString('description');
                    const firstbutton = options.getString('firstbutton').split(',');
                    const secondbutton = options.getString('secondbutton').split(',');
                    const thirdbutton = options.getString('thirdbutton').split(',');
                    
                    const emoji1 = firstbutton[1];
                    const emoji2 = secondbutton[1];
                    const emoji3 = thirdbutton[1];
        
                    await TicketSetup.findOneAndUpdate({GuildID: guild.id}, {
                        Channel: channel1.id,
                        Category: category.id,
                        Transcripts: transcripts.id,
                        Handlers: handlers.id,
                        Everyone: everyone.id,
                        Description: description,
                        Buttons: [firstbutton[0], secondbutton[0], thirdbutton[0]]
                    }, {new: true, upsert: true});
        
                    const buttons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId(firstbutton[0]).setLabel(firstbutton[0]).setStyle(ButtonStyle.Secondary).setEmoji(emoji1),
                        new ButtonBuilder().setCustomId(secondbutton[0]).setLabel(secondbutton[0]).setStyle(ButtonStyle.Danger).setEmoji(emoji2),
                        new ButtonBuilder().setCustomId(thirdbutton[0]).setLabel(thirdbutton[0]).setStyle(ButtonStyle.Primary).setEmoji(emoji3),
                    );
        
                    const embed = new EmbedBuilder()
                    .setColor("#2F3136")
                    .setDescription(description)
            
                    await guild.channels.cache.get(channel1.id).send({embeds: [embed], components: [buttons]});
            
                    interaction.reply({content: 'Ticket message was successfully sent.', ephemeral: true});
        
                } catch (err) {
                    console.log(err);
                    const errEmbed = new EmbedBuilder()
                    .setColor("#2F3136")
                    .setDescription('Something went wrong');
        
                    return interaction.reply({embeds: [errEmbed], ephemeral: true});
                }
            break;
            case 'suggestion':
                const channel = options.getChannel('channel'); 

                ChannelSuggest.findOne({GuildID: guild.id}, async (err, data) => {
                    if(!data) {
                        const newChannel = await ChannelSuggest.create({
                            GuildID: guild.id,
                            ChannelID: channel.id   
                        });
                    }
                    interaction.reply({content: 'Successfully saved a suggestion channel in the database.', ephemeral: true});
                })
            break;
        }
    }
}




