const { bossData } = require("../util/soyabot_const.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    usage: `${client.prefix}보스 (보스 이름) (보스 난이도)`,
    command: ["보스", "ㅂㅅ", "ㅄ"],
    description: "- 이름과 난이도를 입력하면 보스의 보상과 체력, 방어율을 알려줍니다.\n난이도가 1개만 존재하는 보스는 난이도를 생략해도 됩니다.",
    type: ["메이플"],
    async execute(message, args) {
        if (!args[0]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }
        let [bossName, bossGrade] = args;
        if (!bossData[bossName]) {
            return message.channel.send('데이터가 없는 보스입니다.');
        }
        if (Object.keys(bossData[bossName]).length > 1 && (!bossData[bossName][bossGrade] || !bossGrade)) {
            return message.channel.send('해당 난이도가 존재하지 않습니다.');
        }
        if (!bossData[bossName][bossGrade] || !bossGrade) {
            bossGrade = Object.keys(bossData[bossName])[0];
        }

        let bossEmbed = new MessageEmbed()
            .setTitle(`${bossName}(${bossGrade})의 보상`)
            .setColor("#F8AA2A");
        for (let reward of bossData[bossName][bossGrade][0]) {
            bossEmbed.addField(reward, '\u200b');
        }
        message.channel.send(bossEmbed);

        bossEmbed = new MessageEmbed()
            .setTitle(`${bossName}(${bossGrade})의 정보`)
            .setColor("#F8AA2A");
        for (let bossHP of bossData[bossName][bossGrade][1]) {
            bossEmbed.addField(bossHP, '\u200b');
        }
        return message.channel.send(bossEmbed);
    }
};
