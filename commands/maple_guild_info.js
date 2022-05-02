import { ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { BOT_SERVER_DOMAIN } from '../soyabot_config.js';
// import { MapleGuild } from '../classes/MapleParser.js'
import { sendSplitCode } from '../util/soyabot_util.js';
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

export const type = '메이플';
export const commandData = {
    name: '길드',
    description: '입력한 내용에 해당하는 길드의 길드원 정보(직위, 직업, 레벨, 유니온, 무릉)를 보여줍니다.',
    options: [
        {
            name: '서버_이름',
            type: ApplicationCommandOptionType.String,
            description: '검색할 길드의 서버',
            choices: Object.keys(serverEngName).map((v) => ({ name: v, value: v })),
            required: true
        },
        {
            name: '길드_이름',
            type: ApplicationCommandOptionType.String,
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

    await interaction.followUp('정보 가져오는 중...');
    const rslt = `${serverName} ${guildName} 길드 (${mapleGuildInfo.MemberCount}명)\n길드원 목록 갱신 ${isLatest ? '성공' : '실패'}\n\n${(await mapleGuildInfo.memberDataList()).join('\n\n')}`;

    await sendSplitCode(interaction, rslt, { split: true });*/
    const { statusCode, body } = await request(
        `http://${BOT_SERVER_DOMAIN}/guild/${encodeURIComponent(serverName)}/${encodeURIComponent(guildName)}`,
        {
            headersTimeout: 240000
        }
    ); // 길드 작업은 오래걸리므로 시간 제한을 4분으로 변경
    if (200 <= statusCode && statusCode <= 299) {
        await sendSplitCode(interaction, await body.text(), { split: true });
    } else {
        await interaction.followUp('길드 정보를 가져올 수 없습니다.');
        for await (const _ of body); // 메모리 누수 방지를 위한 force consumption of body
    }
}
