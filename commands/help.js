const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "help",
    aliases: ["h", "도움말", "명령어"],
    description: "모든 명령어와 설명 보기 (음악,메이플)",
    type: ["음악", "메이플"],
    execute(message, args) {
        if(args[0] && !this.type.includes(args[0]))
            return message.channel.send("지원하지 않는 도움말입니다.").catch(console.error);

        let commands = message.client.commands.array();

        let helpEmbed = new MessageEmbed()
            .setTitle("소야봇 도움말")
            .setDescription("모든 명령어 목록")
            .setColor("#F8AA2A");

        commands.forEach((cmd) => {
            if (cmd.type.includes(args[0]) || !args[0]) {
                helpEmbed.addField(
                    `**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
                    `${cmd.description}`,
                    true
                );
            }
        });

        helpEmbed.setTimestamp();

        return message.channel.send(helpEmbed).catch(console.error);
    }
};
