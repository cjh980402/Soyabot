const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}유니온 (닉네임)`,
    command: ["유니온", "ㅇㄴㅇ"],
    description: "- 캐릭터의 유니온 정보와 일일 코인 수급량을 출력",
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command.join(', ')}\n${this.description}`);
        }
        const Maple = new mapleModule(args[0]);

        const union = (await Maple.isMain()) ? Maple.homeUnion() : null;
        if (union == null) {
            return message.channel.send(`[${args[0]}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
        }
        else {
            return message.channel.send(`[${args[0]}]\n직업 : ${union[3]}\n유니온 레벨 : ${union[0]}\n전투력 : ${union[1]}\n일일 코인 수급량 : ${union[2]}`);
        }
    }
};
