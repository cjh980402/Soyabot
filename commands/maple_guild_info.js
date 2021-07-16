const { MapleGuild } = require('../util/maple_parsing');
const serverEngName = {
    스카니아: 'scania',
    베라: 'bera',
    루나: 'luna',
    제니스: 'zenith',
    크로아: 'croa',
    유니온: 'union',
    엘리시움: 'elysium',
    이노시스: 'enosis',
    레드: 'red',
    오로라: 'aurora',
    아케인: 'arcane',
    노바: 'nova',
    리부트: 'reboot',
    리부트2: 'reboot2'
};

module.exports = {
    usage: `${client.prefix}길드 (서버 이름) (길드 이름)`,
    command: ['길드', 'ㄱㄷ'],
    description: '- 입력한 내용에 해당하는 길드의 길드원 정보(직위, 직업, 레벨, 유니온, 무릉)를 보여줍니다.',
    type: ['메이플'],
    async execute(message, args) {
        if (args.length !== 2 || !serverEngName[args[0]]) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const mapleGuildInfo = new MapleGuild(serverEngName[args[0]], args[1]);
        const isLatest = await mapleGuildInfo.isLatest();
        if (mapleGuildInfo.MemberCount === 0) {
            return message.channel.send('존재하지 않는 길드입니다.');
        }

        message.channel.send('정보 가져오는 중...');
        const rslt = `${args[0]} ${args[1]} 길드 (${mapleGuildInfo.MemberCount}명)\n길드원 목록 갱신 ${isLatest ? '성공' : '실패'}\n\n${(await mapleGuildInfo.memberDataList()).join('\n\n')}`;

        return message.channel.sendSplitCode(rslt, { split: { char: '\n' } });
    }
};
