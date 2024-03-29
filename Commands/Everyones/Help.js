const {ComponentType, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get a list of all commands from a category.')
    .setDMPermission(false),

    folder: 'Everyone',

    runSlash: async (interaction) => {

        const {client, channel} = interaction;

        const emojis = {
            administration: '🌍',
            moderations: '🔩',
            developer: '🔍',
            levels: '🔋',
            everyones: '📚'
        };

        function getCommand(name) {
            const getCommandID = client.application.commands.cache
            .filter((cmd) => cmd.name === name)
            .map((cmd) => cmd.id);

            return getCommandID;
        }
        
        const directories = [
            ...new Set(client.commands.map((cmd) => cmd.folder)),
        ];

        const formatString = (str) =>
            `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
        
        const categories = directories.map((dir) => {
            const getCommands = client.commands
            .filter((cmd) => cmd.folder === dir)
            .map((cmd) => {
                return {
                    name: cmd.data.name,
                    description: cmd.data.description || 'There is no description for this command.',
                };
            });

            return {
                directory: formatString(dir),
                commands: getCommands,
            };
        });

        const embed = new EmbedBuilder()
        .setColor("#2F3136")
        .setDescription('See lists of commands by selecting a category.')
        .setAuthor({name: `${client.user.username}'s Commands`, iconURL: client.user.displayAvatarURL()});

        const components = (state) => [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('help-menu')
                .setPlaceholder('Find a category')
                .setDisabled(state)
                .addOptions(
                    categories.map((cmd) => {
                        return {
                            label: cmd.directory,
                            value: cmd.directory.toLowerCase(),
                            description: `Commands from ${cmd.directory} category.`,
                            emoji: emojis[cmd.directory.toLowerCase() || null],
                        };
                    })
                )
            ),
        ];

        const initialMessage = await interaction.reply({
            embeds: [embed],
            components: components(false),
        });

        const filter = (interaction) => 
        interaction.user.id === interaction.member.id;

        const collector = channel.createMessageComponentCollector({
            filter,
            componentType: ComponentType.StringSelect,
        });

        collector.on('collect', (interaction) => {
            const [directory] = interaction.values;
            const category = categories.find(
                (x) => x.directory.toLowerCase() === directory
            );

            const categoryEmbed = new EmbedBuilder()
            .setColor("#2F3136")
            .setTitle(`${emojis[directory.toLowerCase()] || null}   ${formatString(directory)} commands`)
            .setDescription(`A list of all commands categorized under ${directory}`)
            .addFields(
                category.commands.map((cmd) => {
                    return {
                        name: `</${cmd.name}:${getCommand(cmd.name)}>`,
                        value: `\`${cmd.description}\``,
                        inline: true,
                    };
                })
            );

            interaction.update({embeds: [categoryEmbed]});
        });

        collector.on('end', () => {
            initialMessage.edit({components: components(true)});
        });
    },
};