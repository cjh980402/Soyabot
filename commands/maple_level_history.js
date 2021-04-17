const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}히스토리 (닉네임)`,
    command: ['히스토리', 'ㅎㅅㅌㄹ'],
    description: '- 캐릭터의 레벨업 히스토리를 출력합니다.',
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

        const data = mapleUserInfo.LevelHistory();
        if (!data) {
            return message.channel.send(`[${mapleUserInfo.Name}]\n레벨 히스토리를 가져오지 못했습니다.`);
        } else {
            const len = data[0].length;
            let rslt = `[${mapleUserInfo.Name}]`;
            for (let i = 1; i < len; i++) {
                rslt += `\nLv.${data[1][i]} 달성일: ${data[0][i]}`;
            }
            return message.channel.send(rslt);
        }
    }
};
