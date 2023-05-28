const {PermissionFlagsBits, EmbedBuilder, IntegrationApplication} = require('discord.js');
const {Suggestions} = require('../../Handlers/Models/AllSchema');

module.exports = {
    name: 'interactionCreate',
    runEvent: async (interaction) => {
        const {member, guildId, customId, message} = interaction;

        if (!interaction.isButton()) return;

        if (customId == 'accept-s' || customId == 'decline-s') {
            if (!member.permissions.has(PermissionFlagsBits.Administrator))
            return interaction.reply({content: 'You do not have permissions for that.', ephemeral: true});

            Suggestions.findOne({GuildID: guildId, MessageID: message.id}, async (err, data) => {
                if (err) throw err;

                if (!data)
                return interaction.reply({content: 'No data was found', ephemeral: true});

                const embed = message.embeds[0];

                if(!embed)
                return interaction.reply({content: 'No embed was found', ephemeral: true});

                switch (customId) {
                    case 'accept-s':
                        const acceptedEmbed = EmbedBuilder.from(embed).setColor('Green')

                        message.edit({ embeds: [acceptedEmbed]});
                        interaction.reply({content: 'Suggestion successfully accepted', ephemeral: true});
                        break;
                    case 'decline-s':
                        const declinedEmbed = EmbedBuilder.from(embed).setColor('Red')
    
                        message.edit({ embeds: [declinedEmbed]});
                        interaction.reply({content: 'Suggestion successfully declined', ephemeral: true});
                        break;
                }
            });
        }
    }
}