Levels = require("discord-xp");
const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Adjust a user's level.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("level")
        .setDescription("Level system.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add level to a user")
            .addUserOption((option) =>
              option
                .setName("target")
                .setDescription("Select a user.")
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("amount")
                .setDescription("Amount of levels.")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove level to a user.")
            .addUserOption((option) =>
              option
                .setName("target")
                .setDescription("Select a user.")
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("amount")
                .setDescription("Amount of levels.")
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((subcommandgroup) =>
      subcommandgroup
        .setName("xp")
        .setDescription("Xp system.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("add")
            .setDescription("Add xp to a user")
            .addUserOption((option) =>
              option
                .setName("target")
                .setDescription("Select a user.")
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("amount")
                .setDescription("Amount of xp.")
                .setRequired(true)
            )
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("remove")
            .setDescription("Remove xp to a user.")
            .addUserOption((option) =>
              option
                .setName("target")
                .setDescription("Select a user.")
                .setRequired(true)
            )
            .addIntegerOption((option) =>
              option
                .setName("amount")
                .setDescription("Amount of xp.")
                .setRequired(true)
            )
        )
    ),

  folder: "Administration",

  runSlash: async (interaction) => {
    const {options} = interaction;

    const subgroup = options.getSubcommandGroup(['level', 'xp']);
    const sub = options.getSubcommand(['add', 'remove'])
    const target = options.getUser('target');
    const amount = options.getInteger('amount');

    const user = target.id;
     
    switch (subgroup) {
      case 'level':
        switch (sub) {
          case 'add':
            Levels.appendLevel(user, interaction.guildId, amount);
            interaction.reply({
              content: `${amount} levels has been add to ${target}`,
              ephemeral: true,
            });
          break;
          case 'remove':
            Levels.subtractLevel(user, interaction.guildId, amount);
            interaction.reply({
              content: `${amount} levels has been remove to ${target}`,
              ephemeral: true,
            });
          break;
        }
      break;
      case 'xp':
        switch (sub) {
          case 'add':
            Levels.appendXp(user, interaction.guildId, amount);
            interaction.reply({
              content: `${amount} xp has been add to ${target}`,
              ephemeral: true,
            });
          break;
          case 'remove':
            Levels.subtractXp(user, interaction.guildId, amount);
            interaction.reply({
              content: `${amount} xp has been remove to ${target}`,
              ephemeral: true,
            });
          break;
        }
      break;
    };
  },
};
