const mapleModule = require("../util/maple_parsing");

module.exports = {
    name: "업적",
    aliases: ["ㅇㅈ"],
    type: ["메이플"],
    description: "캐릭터의 업적 등급, 점수, 랭킹을 출력",
    async execute(message, args) {
        if (!args[0])
            return message.channel.send(`**${message.client.prefix}${this.name} ${this.aliases ? `(${this.aliases})` : ""}**\n${this.description}`);
        const Maple = new mapleModule(args[0]);
        if ((await Maple.isExist()) == null || Maple.homeLevel() == null) {
            return message.channel.send(`[${args[0]}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await Maple.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await Maple.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }
        const rslt = Maple.Achieve();
        if (rslt == null)
            message.channel.send(`[${nickname}]\n기록이 없습니다.`);
        else
            message.channel.send(`[${nickname}]\n등급 : ${rslt[0]}\n업적점수 : ${rslt[1]}\n월드랭킹 : ${rslt[2]}\n전체랭킹 : ${rslt[3]}`);
    }
};
