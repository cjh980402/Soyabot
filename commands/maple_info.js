import { AttachmentBuilder, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';
import { levelTable } from '../util/Constant.js';

async function getInfoEmbed(mapleUserInfo, level) {
    const char_union = await mapleUserInfo.homeUnion(); // 유니온 레벨, 전투력, 수급량
    const char_lv = level[0]; // 레벨
    const char_ex = level[1];
    const char_percent = ((char_ex / (levelTable[char_lv] - levelTable[char_lv - 1])) * 100).toFixed(3); // 경험치 퍼센트
    const char_job = level[4]; // 직업
    const char_guild = level[3]; // 길드
    const char_popul = level[2]; // 인기도
    const char_murung = mapleUserInfo.Murung(); // 1: 층수, 2: 클리어 시간
    const char_seed = mapleUserInfo.Seed(); // 1: 층수, 2: 클리어 시간
    const char_rank = mapleUserInfo.Rank(); // 종합, 월드, 직업(월드), 직업(전체)

    return new EmbedBuilder()
        .setTitle(`**${mapleUserInfo.Name}님의 정보**`)
        .setColor('#FF9999')
        .setURL(mapleUserInfo.GGURL)
        .setImage('attachment://character.png')
        .addFields([
            {
                name: '**레벨**',
                value: char_lv < 300 ? `${char_lv} (${char_percent}%)` : String(char_lv),
                inline: true
            },
            { name: '**직업**', value: char_job, inline: true },
            { name: '**길드**', value: char_guild || '-', inline: true },
            { name: '**인기도**', value: char_popul.toLocaleString(), inline: true },
            {
                name: '**유니온 정보**',
                value: char_union
                    ? `레벨: ${char_union[0].toLocaleString()} (코인 1일 ${
                          char_union[2]
                      }개)\n전투력: ${char_union[1].toLocaleString()}`
                    : '-',
                inline: true
            },
            {
                name: '**무릉 기록**',
                value: char_murung
                    ? `${char_murung[2]}층 (${Math.floor(char_murung[3] / 60)}분 ${char_murung[3] % 60}초)`
                    : '-',
                inline: true
            },
            {
                name: '**시드 기록**',
                value: char_seed
                    ? `${char_seed[2]}층 (${Math.floor(char_seed[3] / 60)}분 ${char_seed[3] % 60}초)`
                    : '-',
                inline: true
            },
            {
                name: '**종합 랭킹**',
                value: char_rank
                    ? `전체: ${char_rank[0].toLocaleString()}위\n월드: ${char_rank[1].toLocaleString()}위`
                    : '-',
                inline: true
            },
            {
                name: '**직업 랭킹**',
                value: char_rank
                    ? `전체: ${char_rank[2].toLocaleString()}위\n월드: ${char_rank[3].toLocaleString()}위`
                    : '-',
                inline: true
            }
        ]);
}

export const type = '메이플';
export const commandData = {
    name: '정보',
    description: '해당 캐릭터의 전체적인 정보를 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '전체적인 정보를 검색할 캐릭터의 닉네임',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    const mapleUserInfo = new MapleUser(interaction.options.getString('닉네임'));

    const level = await mapleUserInfo.homeLevel();
    if (!level) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        await interaction.followUp('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const image = new AttachmentBuilder(mapleUserInfo.userImg(), { name: 'character.png' });
    await interaction.followUp({ embeds: [await getInfoEmbed(mapleUserInfo, level)], files: [image] });
}
