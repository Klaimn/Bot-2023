const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
const {ReactionsRoles, Roles} = require('../../Handlers/Models/AllSchema');
const {scheduleRoleRemoval, scheduleRoleAdd} = require('./Functions/scheduleRoles');

function formatTimestamp(date) {
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return `<t:${unixTimestamp}:R>`
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName('r')
    .setDescription('Role system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommandGroup(subcommandgroup => 
        subcommandgroup.setName('panel')
        .setDescription('Create a role panel.')
        .addSubcommand(subcommand => 
            subcommand.setName('add')
            .setDescription('Add custom reaction role.')
            .addRoleOption(option => 
                option.setName('role')
                .setDescription('Role to be assigned')
                .setRequired(true)    
            )
            .addStringOption(option =>
                option.setName('description')
                .setDescription('Description of the role.')
                .setRequired(false)
            )
            .addStringOption(option => 
                option.setName('emoji')
                .setDescription('Emoji of the role.')
                .setRequired(false)    
            )
        )
        .addSubcommand(subcommand => 
            subcommand.setName('remove')
            .setDescription('Removes custom reaction role.')
            .addRoleOption(option => 
                option.setName('role')
                .setDescription('Role to be removed')
                .setRequired(true)    
            )    
        )
        .addSubcommand(subcommand => 
            subcommand.setName('panel')
            .setDescription('Display reaction roles panel.')
        )
    )
    .addSubcommandGroup(subcommandgroup => 
        subcommandgroup.setName('roles')
        .setDescription('Add and Remove a role.')
        .addSubcommand(subcommand => 
            subcommand.setName('add')
            .setDescription('Add a role to a user.')
            .addUserOption(option => 
                option.setName('user')
                .setDescription('The user to add the role to.')
                .setRequired(true)    
            )
            .addRoleOption(option => 
                option.setName('role')
                .setDescription('Role to be assigned to the user')
                .setRequired(true)    
            )
        )
        .addSubcommand(subcommand => 
            subcommand.setName('remove')
            .setDescription('Removes a role from a user.')
            .addUserOption(option => 
                option.setName('user')
                .setDescription('The user to remove the role from.')
                .setRequired(true)    
            )
            .addRoleOption(option => 
                option.setName('role')
                .setDescription('Role to be remove from the user.')
                .setRequired(true)    
            )  
        )
        .addSubcommand(subcommand => 
            subcommand.setName('temp-add')
            .setDescription('Temporarily add a role to a user.')
            .addUserOption(option => 
                option.setName('user')
                .setDescription('The user to add the role to.')
                .setRequired(true)    
            )
            .addRoleOption(option => 
                option.setName('role')
                .setDescription('Role to be assigned to the user')
                .setRequired(true)    
            )
            .addIntegerOption(option => 
                option.setName('duration')
                .setDescription('The duration in minutes for the role to be added to the user.')
                .setRequired(true)    
            )
            .addBooleanOption(option => 
                option.setName('dm')
                .setDescription('Whether to Dm the user about the temporary role.')
                .setRequired(false)    
            )
        )
        .addSubcommand(subcommand => 
            subcommand.setName('temp-remove')
            .setDescription('Temporarily removes a role from a user.')
            .addUserOption(option => 
                option.setName('user')
                .setDescription('The user to remove the role from.')
                .setRequired(true)    
            )
            .addRoleOption(option => 
                option.setName('role')
                .setDescription('Role to be remove from the user.')
                .setRequired(true)    
            )
            .addIntegerOption(option => 
                option.setName('duration')
                .setDescription('The duration in minutes for the role to be removed from the user.')
                .setRequired(true)    
            ) 
        )
    ),

    folder: 'Moderation',

    runSlash: async (interaction) => {
        const {options, guildId, guild, channel, member} = interaction;

        const subgroup = options.getSubcommandGroup(['panel', 'roles'])
        const sub = options.getSubcommand(['add', 'remove', 'panel']);
        const sub2 = options.getSubcommand(['add', 'remove', 'temp-add', 'temp-remove']);

        const role = options.getRole('role');
        const user = options.getUser('user');
        const duration = options.getInteger('duration');
        const dm = options.getBoolean('dm') || false;

        const members = await interaction.guild.members.fetch(user.id);
        const embed = new EmbedBuilder()

        const expiresAt = new Date(Date.now() + duration * 60000);

        switch (subgroup) {
            case 'panel':
                switch (sub) {
                    case 'add': 
                        const description = options.getString('description');
                        const emoji = options.getString('emoji');
                
                        try  {
                
                            if (role.position >= member.roles.highest.position) 
                            return interaction.reply({content: 'I don\'t have permissions for that.', ephemeral: true});
                
                            const data = await ReactionsRoles.findOne({ GuildID: guildId});
                
                            const newRole = {
                                roleId: role.id,
                                roleDescription: description ||'No description.',
                                roleEmoji: emoji || '',
                            }
                
                            if (data) {
                                let roleData = data.roles.find((x) => x.roleId === role.id);
                
                                if (roleData) {
                                    roleData = newRoleData;
                                } else {
                                    data.roles = [...data.roles, newRole]
                                }
                
                                await data.save();
                            } else {
                                await ReactionsRoles.create({
                                    GuildID: guildId,
                                    roles: newRole
                                });
                            }
                
                            return interaction.reply({content: `Created new role **${role.name}**`, ephemeral: true});
                        } catch (err) {
                            console.log(err);
                        }
                    break;
                    case 'remove':
                        try  {
                            const data = await ReactionsRoles.findOne({ GuildID: guildId});
                
                            if (!data) 
                            return interaction.reply({content: 'This server does not have any data.', ephemeral: true});
                
                            const roles = data.roles;
                            const findRole = roles.find((r) => r.roleId === role.id);
                
                            if (!findRole) 
                            return interaction.reply({content: 'This role does not exist', ephemeral: true});
                
                            const filteredRoles = roles.filter((r) => r.roleId !== role.id);
                            data.roles = filteredRoles;
                
                            await data.save();
                
                            return interaction.reply({content: `Removed role **${role.name}**`, ephemeral: true});
                        } catch (err) {
                            console.log(err);
                        }
                    break;
                    case 'panel':
                        try {
                            const data = await ReactionsRoles.findOne({GuildID: guildId});
                
                            if (!data.roles.length > 0)
                            return interaction.reply({content: 'This server does not have any data.', ephemeral: true});
                
                            const panelEmbed = new EmbedBuilder()
                            .setColor("#2F3136")
                            .setDescription('Please select a role below.')
                
                            const options = data.roles.map(x => {
                                const role = guild.roles.cache.get(x.roleId);
                
                                return {
                                    label: role.name,
                                    value: role.id,
                                    description: x.roleDescription,
                                    emoji: x.roleEmoji || undefined
                                };
                            });
                
                            const menuComponents = [
                                new ActionRowBuilder().addComponents(
                                    new StringSelectMenuBuilder()
                                    .setCustomId('reaction-roles')
                                    .setMaxValues(options.length)
                                    .setOptions(options)
                                ),
                            ];
                
                            channel.send({ embeds: [panelEmbed], components: menuComponents});
                            return interaction.reply({content: 'Successfully sent your panel', ephemeral: true});
                        } catch (err) {
                            return console.log(err);
                        }
                    break;
                }
            break;
            case 'roles':
                switch (sub2) {
                    case 'add':
                        if (members.roles.cache.has(role.id)) {
                            embed.setColor('#2F3136')
                            .setDescription(`User ${user} already has the role \`${role.name}\`.`)
                            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                            .setFooter({text: `Requested by ${interaction.user.tag}`})
                            .setTimestamp()

                            await interaction.reply({embeds: [embed], ephemeral: true});
                            return;
                        }
                            try {
                                await interaction.guild.members.cache.get(user.id).roles.add(role)
                                embed.setColor(role.color)
                                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                                .setFooter({text: `Requested by ${interaction.user.tag}`})
                                .setDescription(`Successfully added the role \`${role.name}\` to user \`${user.tag}\`.`)
                                .setTimestamp()

                                await interaction.reply({embeds: [embed], ephemeral: true});
                            } catch (error) {
                                console.error(error)
                                embed.setColor('#ff0000')
                                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                                .setFooter({text: `Requested by ${interaction.user.tag}`})
                                .setDescription(`Failed to had the role \`${role.name}\` to user \`${user.tag}\`.`)
                                .setTimestamp()

                                await interaction.reply({embeds: [embed], ephemeral: true});
                            }
                    break;
                    case 'remove':
                        if (!members.roles.cache.has(role.id)) {
                            embed.setColor('#2F3136')
                            .setDescription(`User ${user} doesn't have the role \`${role.name}\`.`)
                            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                            .setFooter({text: `Requested by ${interaction.user.tag}`})
                            .setTimestamp()

                            await interaction.reply({embeds: [embed], ephemeral: true});
                            return;
                        }
                            try {
                                await interaction.guild.members.cache.get(user.id).roles.remove(role)
                                embed.setColor(role.color)
                                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                                .setFooter({text: `Requested by ${interaction.user.tag}`})
                                .setDescription(`Successfully removed the role \`${role.name}\` from user \`${user.tag}\`.`)
                                .setTimestamp()

                                await interaction.reply({embeds: [embed], ephemeral: true});
                            } catch (error) {
                                console.error(error)
                                embed.setColor('#ff0000')
                                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                                .setFooter({text: `Requested by ${interaction.user.tag}`})
                                .setDescription(`Failed to remove the role \`${role.name}\` to user \`${user.tag}\`.`)
                                .setTimestamp()

                                await interaction.reply({embeds: [embed], ephemeral: true});
                            }
                    break;
                    case 'temp-add':
                        try {
                            if (members.roles.cache.has(role.id)) {
                                embed.setColor('#2F3136')
                                .setDescription(`User ${user} already has the role \`${role.name}\`.`)
                                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                                .setFooter({text: `Requested by ${interaction.user.tag}`})
                                .setTimestamp()
    
                                await interaction.reply({embeds: [embed], ephemeral: true});
                                return;
                            }
    
                            await interaction.guild.members.cache.get(user.id).roles.add(role)
    
                            const tempRole = new Roles({
                                guildId: interaction.guild.id,
                                userId: user.id,
                                roleId: role.id,
                                expiresAt
                            });
    
                            await tempRole.save()
    
                            scheduleRoleRemoval(
                                interaction.client,
                                user.id,
                                role.id,
                                interaction.guild.id,
                                expiresAt
                            );
    
                            if (dm) {
                                const timestamp = formatTimestamp(expiresAt);
                                const message = `You have been give the temporary role \`${role.name}\` for ${duration} in the guild \`${interaction.guild.name}\`. It will expire in ${duration} minute(s).`
                                try {
                                    await user.send(message);
                                } catch (err) {
                                    console.error(`Failed to send Dm to user ${user.id} : ${error}`);
                                }
                            }
    
                            const timestamp = formatTimestamp(expiresAt);
                            
                            embed.setColor('#2F3136')
                            .setDescription(
                                `The role \`${
                                    role.name
                                }\` has been added to ${user.toString()} for ${duration} minute(s). It will expire ${timestamp}.` 
                            )
                            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                            .setFooter({text: `Requested by ${interaction.user.tag}`})
                            .setTimestamp()
    
                            await interaction.reply({embeds: [embed], ephemeral: true});
                        } catch (error) {
                            console.error(error)
                            await interaction.reply({ content: 'An error occured while executing the command.', ephemeral: true})
                        }
                    break;
                    case 'temp-remove':
                            if (!members.roles.cache.has(role.id)) {
                                embed.setColor('#2F3136')
                                .setDescription(`User ${user} doesn't the role \`${role.name}\`.`)
                                .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                                .setFooter({text: `Requested by ${interaction.user.tag}`})
                                .setTimestamp()
    
                                await interaction.reply({embeds: [embed], ephemeral: true});
                                return;
                            }
    
                            await interaction.guild.members.cache.get(user.id).roles.remove(role)
    
                            const tempRole = new Roles({
                                guildId: interaction.guild.id,
                                userId: user.id,
                                roleId: role.id,
                                expiresAt
                            });
    
                            await tempRole.save()
    
                            scheduleRoleAdd(
                                interaction.client,
                                user.id,
                                role.id,
                                interaction.guild.id,
                                expiresAt
                            );
    
                            const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000);
                            const timestamp = `<t:${expiresAtUnix}:R>`
                            
                            embed.setColor('#2F3136')
                            .setDescription(
                                `The role \`${
                                    role.name
                                }\` has been removed to ${user.toString()} for ${duration} minute(s). It will added back in ${timestamp}.` 
                            )
                            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                            .setFooter({text: `Requested by ${interaction.user.tag}`})
                            .setTimestamp()
    
                            await interaction.reply({embeds: [embed], ephemeral: true});
                    break;
                }
            break;
        }




        
    }
}