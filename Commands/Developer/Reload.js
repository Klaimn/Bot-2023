const { SlashCommandBuilder, EmbedBuilder, Client } = require('discord.js');
const {loadCommands, loadEvents} = require('../../Handlers/Handlers');
const Logs = require('../../Handlers/Utils/Logs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload your commands or your events')
    .addSubcommand(subcommand => 
        subcommand.setName('commands')
        .setDescription('Reload your commands.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('events')
        .setDescription('Reload your events.')
    )
    .addSubcommand(subcommand => 
        subcommand.setName('bot')
        .setDescription('Reload the bot.')
    ),

    folder: 'Developper',

    runSlash: async (interaction, client) => {
        const {user, options} = interaction;

        if (user.id !== '251902051326361600') return interaction.reply({
            embeds: [new EmbedBuilder().setColor('#2F3136').setDescription('This command is only for the bot developers!')], ephemeral: true
        });

        const sub = options.getSubcommand()
        const embed = new EmbedBuilder()
        .setTitle('Developer')
        .setColor('#2F3136')

        switch (sub) {
            case 'commands' : 
                loadCommands(client);
                interaction.reply({ embeds: [embed.setDescription('Commands reloaded!')], ephemeral: true});
                Logs.info(`${user.username} has reloaded the commands.`);
            break;
            case 'events' : 
                loadEvents(client);
                interaction.reply({ embeds: [embed.setDescription('Events reloaded!')], ephemeral: true});
                Logs.info(`${user.username} has reloaded the events.`);
            break;
            case 'bot':
                loadCommands(client);
                loadEvents(client);
                interaction.reply({ embeds: [embed.setDescription('Bot reloaded!')], ephemeral: true});
                Logs.info(`${user.username} has reloaded the bot.`);
            break;
        }
    }
}