const {ChannelType, ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits} = require('discord.js');

const {Ticket} = require('../../Handlers/Models/AllSchema');
const {TicketSetup} = require('../../Handlers/Models/AllSchema');

module.exports = {
    name: 'interactionCreate',

    runEvent: async (interaction) => {
        const {guild, member, customId, channel} = interaction;
        const { ViewChannel, SendMessages, ManageChannels, ReadMessageHistory} = PermissionFlagsBits;
        const ticketId = Math.floor(Math.random() * 9000) + 10000;

        if(!interaction.isButton()) return;
        const data = await TicketSetup.findOne({GuildID: guild.id});

        if (!data)
        return;
        
        if (!data.Buttons.includes(customId))
        return;

        if(!guild.members.me.permissions.has(ManageChannels))
        interaction.reply({content: "I don't have permissions for this.", ephemeral: true});

        try {
            await guild.channels.create({
                name: `${member.user.username}-ticket${ticketId}`,
                type: ChannelType.GuildText,
                parent: data.Category,
                permissionOverwrites: [
                    {
                        id: data.Everyone,
                        deny: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                    {
                        id: member.id,
                        allow: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                ],
            }).then(async (channel) => {
                const newTicketSchema = await Ticket.create({
                    GuildID: guild.id,
                    MembersID: member.id,
                    TicketID: ticketId,
                    ChannelID: channel.id,
                    Closed: false,
                    Locked: false,
                    Type: customId,
                    Claimed: false,
                });

                const embed = new EmbedBuilder()
                .setAuthor({ name: `${guild.name} - Ticket: ${customId}`, iconURL: interaction.user.displayAvatarURL({dynamic: true}) })
                .setDescription('Our support team will contact you shortly. Please describe your issue.')
                .setFooter({text: `${ticketId}`})
                .setColor("#2F3136")
                .setTimestamp();

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(ButtonStyle.Primary).setEmoji('🚧'),
                    new ButtonBuilder().setCustomId('lock').setLabel('Lock').setStyle(ButtonStyle.Secondary).setEmoji('🔐'),
                    new ButtonBuilder().setCustomId('unlock').setLabel('Unlock').setStyle(ButtonStyle.Success).setEmoji('🔓'),
                    new ButtonBuilder().setCustomId('claim').setLabel('Claim').setStyle(ButtonStyle.Secondary).setEmoji('🛄'),
                );
                
                channel.send({embeds: [embed], components: [buttons]});

                interaction.reply({content: 'Successfully created a ticket', ephemeral: true});
            });
        } catch (err) {
            return console.log(err);
        }
    },
};