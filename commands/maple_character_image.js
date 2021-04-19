const { MapleUser } = require('../util/maple_parsing');

module.exports = {
    usage: `${client.prefix}이미지 (닉네임)`,
    command: ['이미지', 'ㅇㅁㅈ'],
    description: '- 해당 캐릭터의 배경 없는 이미지를 출력합니다.',
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

        return message.channel.send(`${mapleUserInfo.Name}님의 캐릭터 이미지`, { files: [mapleUserInfo.userImg()] });
    }
};
