const mapleModule = require("../util/maple_parsing");

module.exports = {
    name: "히스토리",
    aliases: ["ㅎㅅㅌㄹ"],
    type: ["메이플"],
    description: "캐릭터의 레벨업 히스토리를 출력",
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

        const data = Maple.LevelHistory();
        const len = data[0].length;
        let rslt = `[${args[0]}]\n`;
        for (let i = 0; i < len; i++) {
            rslt += `Lv.${data[1][i]} 달성일 : ${data[0][i]}${(i == len - 1 ? '' : '\n')}`;
        }
        message.channel.send(rslt);
    }
};
