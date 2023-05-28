const Levels = require("discord-xp");

module.exports = {
  name: 'messageCreate',
  
  runEvent: async (message) => {
    if (message.author.bot) return; if (!message.guild) return;

    if (message.content.length < 3) return;
    
    const randomxp = Math.floor(Math.random() * 49) + 1;
    const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomxp);
    
    if (hasLeveledUp) {
      const user = await Levels.fetch(message.author.id, message.guildId);
      message.channel.send(`Congratulations ${message.member}, you have **level up** to \`${user.level}\``);
      
      if (user.level == 15 ) {
        const role = message.guild.roles.cache.get("955065574201905183");
       
        if (message.member.roles.cache.has(role.id)) return;
        else await message.member.roles.add(role.id)
        .then(message.channel.send({content: `You're now level ${user.level}, so we've gift you this role: ${role.name}`, ephemeral: true }))
      };

      if (user.level == 30 ) {
       const role = message.guild.roles.cache.get("955065765827063848");

        if (message.member.roles.cache.has(role.id)) return;
        else await message.member.roles.add(role.id)
        .then(message.channel.send({content: `You're now level ${user.level}, so we've gift you this role: ${role.name}`, ephemeral: true }))
      };

      if (user.level == 50 ) {
       const role = message.guild.roles.cache.get("955065925156081674");

        if (message.member.roles.cache.has(role.id)) return;
        else await message.member.roles.add(role.id)
        .then(message.channel.send({content: `You're now level ${user.level}, so we've gift you this role: ${role.name}`, ephemeral: true }))
      };
    };

  },
};