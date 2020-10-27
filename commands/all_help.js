const { MessageEmbed, splitMessage } = require("discord.js");

module.exports = {
    usage: `${client.prefix}help (카테고리)`,
    command: ["help", "h", "도움말", "명령어", "ㄷㅇㅁ", "ㅁㄹㅇ"],
    description: "- 카테고리는 메이플, 음악, 기타가 있으며 생략시 모든 명령어의 도움말을 출력합니다.",
    type: ["음악", "메이플", "기타"],
    async execute(message, args) {
        if (args[0] && !this.type.includes(args[0])) {
            return message.channel.send("지원하지 않는 도움말입니다.");
        }

        const helpEmbed = new MessageEmbed()
            .setTitle("소야봇 도움말")
            .setDescription("모든 명령어 목록")
            .setColor("#F8AA2A");

        const description = message.client.commands.filter((cmd) => (cmd.description && (cmd.type.includes(args[0]) || !args[0])))
            .map((cmd) => `**${cmd.usage}**\n- 대체 명령어 : ${cmd.command.join(', ')}\n${cmd.description}`);
        // description이 없는 명령어는 히든 명령어

        const splitDescription = splitMessage(description, {
            maxLength: 2048,
            char: "\n",
            prepend: "",
            append: ""
        });

        splitDescription.forEach(async (m) => {
            helpEmbed.setDescription(m);
            message.channel.send(helpEmbed);
        });
    }
};