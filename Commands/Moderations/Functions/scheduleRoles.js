const {Roles} = require('../../../Handlers/Models/AllSchema');

async function scheduleRoleAdd(client, userId, roleId, guildId, expiresAt) {
    const timeRemaining = expiresAt.getTime() - Date.now();

    setTimeout(async () => {
        const guild = await client.guilds.cache.get(guildId);
        const member = await guild.members.fetch(userId);

        if (member) {
            await member.roles.add(roleId, 'Temporary role removal duration expired.')
        }

        await Roles.findOneAndDelete({
            guildId: guildId,
            userId: userId,
            roleId: roleId
        });
    }, timeRemaining)
}

async function scheduleRoleRemoval(client, userId, roleId, guildId, expiresAt) {
    const timeLeft = expiresAt.getTime() - Date.now();

    setTimeout(async () => {
        const guild = await client.guilds.cache.get(guildId);
        const member = await guild.members.fetch(userId);

        if (member.roles.cache.has(roleId)) {
            try {
                await member.roles.remove(roleId)
                console.log(`Remove expired role ${roleId} from user ${userId}.`)
            } catch (error) {
                console.error(`Failed to remove expired role: ${error}.`)
            }
            
        }

        await Roles.deleteOne({ guildId: guildId, userId: userId, roleId: roleId });
    }, timeLeft)
}

module.exports = {scheduleRoleRemoval, scheduleRoleAdd};