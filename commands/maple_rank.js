const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}랭킹 (닉네임)`,
    command: ["랭킹", "ㄹㅋ"],
    description: "- 캐릭터의 랭킹을 출력",
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command.join(', ')}\n${this.description}`);
        }
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

        const rslt = Maple.Rank();
        if (rslt == null) {
            return message.channel.send(`[${args[0]}]\n기록이 없습니다.`);
        }
        else {
            return message.channel.send(`[${args[0]}]\n종합 랭킹(전체) : ${rslt[0]}\n종합 랭킹(월드) : ${rslt[1]}\n직업 랭킹(전체) : ${rslt[3]}\n직업 랭킹(월드) : ${rslt[2]}`);
        }
    }
};
