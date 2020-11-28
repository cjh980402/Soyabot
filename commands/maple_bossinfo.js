const { bossData } = require("../util/soyabot_const.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    usage: `${client.prefix}보스 (보스 이름) (보스 난이도)`,
    command: ["보스", "ㅂㅅ", "ㅄ"],
    description: "- 해당하는 보스의 보상과 체력, 방어율을 알려줍니다.\n- 난이도를 생략하면 상위 등급의 정보를 보여줍니다.",
    type: ["메이플"],
    async execute(message, args) {
        if (!args[0]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        const bossName = args[0];
        if (!bossData[bossName]) {
            return message.channel.send('데이터가 없는 보스입니다.');
        }
        const bossGrade = !bossData[bossName][args[1]] ? Object.keys(bossData[bossName])[0] : args[1];

        const bossEmbed = new MessageEmbed()
            .setTitle(`${bossName}(${bossGrade})의 보상`)
            .setColor("#F8AA2A")
            .setDescription(bossData[bossName][bossGrade][0].map(v => `**${v}**`).join("\n\n"));
        message.channel.send(bossEmbed);

        bossEmbed.setTitle(`${bossName}(${bossGrade})의 정보`)
            .setDescription(bossData[bossName][bossGrade][1].map(v => `**${v}**`).join("\n\n"));

        return message.channel.send(bossEmbed);
    }
};
