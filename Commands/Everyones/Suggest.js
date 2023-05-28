const {EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const {Suggestions, ChannelSuggest} = require('../../Handlers/Models/AllSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggest your idea.')
    .addStringOption(option => 
        option.setName('description')
        .setDescription('Describe your suggestion.')
        .setRequired(true)
    ),

    folder: 'Everyone',

    runSlash: async (interaction) => {
        const {guild, options, member, guildId, user} = interaction;

        const description = options.getString('description');

        const embed = new EmbedBuilder()
        .setAuthor({ name: `${member.user.username}'s Suggestion`, iconURL: member.displayAvatarURL({dynamic: true})})
        .setFooter({ text: description })
        .setColor("#2F3136");

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('accept-s').setLabel('Accept').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('decline-s').setLabel('Decline').setStyle(ButtonStyle.Danger)
        );

        ChannelSuggest.findOne({Guild: guild.id}, async (err, data) => {
            if (!data) return;
            if (data) {
                const channel = guild.channels.cache.get(data.ChannelID);

                try {
                    const m = await channel.send({embeds: [embed], components: [buttons]});
                    await channel.send({content: 'Use `/suggest` in the bot-commands channel to submit your suggestion.'});
                    await interaction.reply({content: 'Suggestion was succesfully sent to the channel', ephemeral: true});
                    
                    await Suggestions.create({
                        GuildID: guildId, MessageID: m.id, Details: [
                            {
                                MemberID: member.id,
                                Suggestion: description
                            }
                        ]
                    });
                } catch(err) {
                    console.log(err)
                }
            }
        })          
    }
}