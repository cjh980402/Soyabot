const mapleModule = require("../util/maple_parsing");

module.exports = {
    usage: `${client.prefix}헤비 (닉네임)`,
    command: ["헤비", "ㅎㅂ", "라이트", "ㄹㅇㅌ"],
    description: `- 헤비...`,
    type: ["메이플"],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const Maple = new mapleModule(args[0]);
        const rslt = (await Maple.isExist()) ? Maple.homeLevel() : null;
        if (rslt == null) {
            return message.channel.send(`[${Maple.Name}]\n존재하지 않는 캐릭터입니다.`);
        }

        const whitelist = ['현지', '김헤하', '김헤비', '김데렐라', '김현지', '소현'];
        if (rslt[4] == '제로' || whitelist.includes(Maple.Name) || (Maple.Name.substr(0, 2) == '매일' && Maple.Name.substr(4, 2) == '승리')) {
            return message.channel.send(`"${Maple.Name}"님은 뉴비 유저입니다. ${rslt[4]}조아.`);
        }
        else {
            return message.channel.send(`${rslt[4]}조아.\n그렇지만 "${Maple.Name}"님은 너무 무겁습니다!`);
        }
    }
};