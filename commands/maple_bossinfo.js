const { bossData } = require("../util/soyabot_const.json");
const { MessageEmbed } = require("../util/discord.js-extend");

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
            .setTitle(`**${bossName}(${bossGrade})의 보상 / 정보**`)
            .setColor("#FF9899")
            .setDescription(`**보상**\n${bossData[bossName][bossGrade][0].join("\n\n")}\n\n**정보**\n${bossData[bossName][bossGrade][1].join("\n\n")}`);

        return message.channel.send(bossEmbed);
    }
};