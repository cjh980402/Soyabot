const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}헤비 (닉네임)`,
    command: ['헤비', 'ㅎㅂ', '라이트', 'ㄹㅇㅌ'],
    description: `- 헤비...`,
    type: ['메이플'],
    async execute(message, args) {
        if (args.length !== 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const mapleUserInfo = new MapleUser(args[0]);
        const rslt = await mapleUserInfo.homeLevel();
        if (!rslt) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
        }

        if (rslt[4] === '제로' || /^매일.*승리$|현지|소현|김(헤(하|비)|데렐라|소헌지)/.test(mapleUserInfo.Name)) {
            return message.channel.send(`"${mapleUserInfo.Name}"님은 뉴비 유저입니다. ${rslt[4]}조아.`);
        } else {
            return message.channel.send(`${rslt[4]}조아.\n그렇지만 "${mapleUserInfo.Name}"님은 너무 무겁습니다!`);
        }
    }
};
