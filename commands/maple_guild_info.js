import { fetch } from 'undici';
import { BOT_SERVER_DOMAIN } from '../soyabot_config.js';
// import { MapleGuild } from '../util/maple_parsing.js';
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

export const usage = `${client.prefix}길드 (서버 이름) (길드 이름)`;
export const command = ['길드', 'ㄱㄷ'];
export const description = '- 입력한 내용에 해당하는 길드의 길드원 정보(직위, 직업, 레벨, 유니온, 무릉)를 보여줍니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 2 || !serverEngName[args[0]]) {
        return message.channel.send(
            `**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`
        );
    }

    /*const mapleGuildInfo = new MapleGuild(serverEngName[args[0]], args[1]);
    const isLatest = await mapleGuildInfo.isLatest();
    if (mapleGuildInfo.MemberCount === 0) {
        return message.channel.send('존재하지 않는 길드입니다.');
    }

    message.channel.send('정보 가져오는 중...');
    const rslt = `${args[0]} ${args[1]} 길드 (${mapleGuildInfo.MemberCount}명)\n길드원 목록 갱신 ${isLatest ? '성공' : '실패'}\n\n${(await mapleGuildInfo.memberDataList()).join('\n\n')}`;

    return message.channel.sendSplitCode(rslt, { split: { char: '\n' } });*/
    const response = await fetch(
        `http://${BOT_SERVER_DOMAIN}/guild/${encodeURIComponent(args[0])}/${encodeURIComponent(args[1])}`
    );
    if (response.status === 200) {
        return message.channel.sendSplitCode(await response.text(), { split: { char: '\n' } });
    } else {
        return message.channel.send('길드 정보 작업을 실패하였습니다.');
    }
}
export const commandData = {
    name: '길드',
    description: '입력한 내용에 해당하는 길드의 길드원 정보(직위, 직업, 레벨, 유니온, 무릉)를 보여줍니다.',
    options: [
        {
            name: '서버_이름',
            type: 'STRING',
            description: '검색할 길드의 서버',
            required: true,
            choices: Object.keys(serverEngName).map((v) => ({ name: v, value: v }))
        },
        {
            name: '길드_이름',
            type: 'STRING',
            description: '검색할 길드의 이름',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const serverName = interaction.options.getString('서버_이름');
    const guildName = interaction.options.getString('길드_이름');

    /*const mapleGuildInfo = new MapleGuild(serverEngName[serverName], guildName);
    const isLatest = await mapleGuildInfo.isLatest();
    if (mapleGuildInfo.MemberCount === 0) {
        return interaction.followUp('존재하지 않는 길드입니다.');
    }

    await interaction.editReply('정보 가져오는 중...');
    const rslt = `${serverName} ${guildName} 길드 (${mapleGuildInfo.MemberCount}명)\n길드원 목록 갱신 ${isLatest ? '성공' : '실패'}\n\n${(await mapleGuildInfo.memberDataList()).join('\n\n')}`;

    return interaction.sendSplitCode(rslt, { split: { char: '\n' } });*/
    const response = await fetch(
        `http://${BOT_SERVER_DOMAIN}/guild/${encodeURIComponent(serverName)}/${encodeURIComponent(guildName)}`
    );
    if (response.status === 200) {
        return interaction.sendSplitCode(await response.text(), { split: { char: '\n' } });
    } else {
        return interaction.followUp('길드 정보 작업을 실패하였습니다.');
    }
}
