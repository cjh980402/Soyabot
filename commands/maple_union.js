const mapleModule = require("../util/maple_parsing");

module.exports = {
    name: "유니온",
    aliases: ["ㅇㄴㅇ"],
    type: ["메이플"],
    description: "캐릭터의 유니온 정보와 일일 코인 수급량을 출력",
    async execute(message, args) {
        if (!args[0])
            return;
        const Maple = new mapleModule(args[0]);

        const union = (await Maple.isMain()) ? Maple.homeUnion() : null;
        if (union == null) {
            message.channel.send(`[${args[0]}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
        }
        else {
            message.channel.send(`[${args[0]}]\n직업 : ${union[3]}\n유니온 레벨 : ${union[0]}\n전투력 : ${union[1]}\n일일 코인 수급량 : ${union[2]}`);
        }
    }
};
