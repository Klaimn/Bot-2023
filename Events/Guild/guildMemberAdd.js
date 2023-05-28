const {GuildMember, EmbedBuilder, InteractionCollector, Embed} = require('discord.js');
const {Welcome} = require('../../Handlers/Models/AllSchema');

module.exports = {
    name: 'guildMemberAdd',
    runEvent: async (member) => {
        Welcome.findOne({Guild: member.guild.id}, async (err, data) => {
            if (!data) return;
            let channel = data.Channel;
            let msg = data.Msg || ' ';

            const {user, guild} = member;
            const welcomeChannel = member.guild.channels.cache.get(channel);

            const welcomeEmbed = new EmbedBuilder()
            .setAuthor({name: `Welcome ${member.displayName} to ${member.guild.name}!`, iconURL: member.user.displayAvatarURL({dynamics: true})})
            .setDescription(msg)
            .setColor("#2F3136")

            welcomeChannel.send({embeds: [welcomeEmbed]});
        })   
    }
}
