const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}랭킹 (닉네임)`,
    command: ['랭킹', 'ㄹㅋ'],
    description: '- 캐릭터의 랭킹을 출력합니다.',
    type: ['메이플'],
    async execute(message, args) {
        if (args.length != 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const mapleUserInfo = new MapleUser(args[0]);
        if (!(await mapleUserInfo.homeLevel())) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
        }
        if (!(await mapleUserInfo.isLatest())) {
            message.channel.send('최신 정보가 아니어서 갱신 작업을 먼저 수행하는 중입니다.');
            if (!(await mapleUserInfo.updateGG())) {
                message.channel.send('제한시간 내에 갱신 작업을 실패하였습니다.');
            }
        }

        const rank = mapleUserInfo.Rank();
        if (!rank) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n랭킹 정보를 가져오지 못했습니다.`);
        } else {
            return message.channel.send(`[${mapleUserInfo.Name}]\n종합 랭킹(전체): ${rank[0]}\n종합 랭킹(월드): ${rank[1]}\n직업 랭킹(전체): ${rank[3]}\n직업 랭킹(월드): ${rank[2]}`);
        }
    }
};
