const {SlashCommandBuilder, AttachmentBuilder, EmbedBuilder} = require('discord.js');

const Levels = require('discord-xp');
const canvacord = require('canvacord');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('l')
        .setDescription('Level system')
        .addSubcommand(subcommand => subcommand
            .setName('rank')
            .setDescription('Get info about someone\'s rank.')
            .addUserOption(option => option
                    .setName('user')
                    .setDescription('Select a user.')
                    .setRequired(false)
                )
        )
        .addSubcommand(subcommand => subcommand
            .setName('leaderboard')
            .setDescription('Get the leaderboard from the rank system.')
        ),

    folder: 'Levels',

    runSlash: async (interaction, client) => {
        const  {guildId, guild, options} = interaction;

        const sub = options.getSubcommand(['rank', 'leaderboard']);

        switch (sub) {
            case 'rank':
                const member = options.getUser("user") || interaction.user; 

                const user = await Levels.fetch(member.id, guildId);
                const neededXp = Levels.xpFor(parseInt(user.level) + 1);

                if (user.xp) {
                    const rank = new canvacord.Rank()
                        .setAvatar(member.displayAvatarURL({dynamic : true, format: "png"}) )
                        .setCurrentXP(user.xp)
                        .setRequiredXP(neededXp)
                        .setLevel(user.level)
                        .setRank(0, 0, false)
                        .setProgressBar('#FFD700', 'COLOR')
                        .setUsername(member.username)
                        .setDiscriminator(member.discriminator);
                
                rank.build().then(data => {
                    interaction.reply({files: [new AttachmentBuilder(data, "RankCard.png")]});
                });
                } else if (!user.xp) {
                    interaction.reply({content: 'Seems like this user has not earned any xp so far.', ephemeral: true });
                }
        
                
            break;
            case 'leaderboard':
                const rawLeaderboard = await Levels.fetchLeaderboard(guildId, 10);

                if(rawLeaderboard.length < 1) return interaction.reply('Nobody\'s in the leaderboard yet.');
        
                const embed = new EmbedBuilder();
                const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard, true);
        
                const lb = leaderboard.map(e => `**${e.position}.** ${e.username}#${e.discriminator}\n**Level:** ${e.level}\n**XP:** ${e.xp.toLocaleString()} `);
        
                embed.setTitle('Leaderboard').setDescription(lb.join('\n\n')).setColor("#2F3136").setTimestamp();
        
                return interaction.reply({embeds: [embed], ephemeral: true});
            break;
        };
    },
};