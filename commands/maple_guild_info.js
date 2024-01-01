import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { MapleAPI } from '../classes/MapleParser.js';
import { sendPageMessage } from '../util/soyabot_util.js';
const serverNames = [
    '스카니아',
    '베라',
    '루나',
    '제니스',
    '크로아',
    '유니온',
    '엘리시움',
    '이노시스',
    '레드',
    '오로라',
    '아케인',
    '노바',
    '리부트',
    '리부트2'
];

async function getGuildEmbed(basicInfo) {
    const embeds = [];

    const mainEmbed = new EmbedBuilder()
        .setTitle(`**${basicInfo.world_name} ${basicInfo.guild_name} 길드**`)
        .setColor('#FF9999')
        .setDescription(
            `길드 레벨: ${basicInfo.guild_level}
길드 마스터: ${basicInfo.guild_master_name}
길드 인원수: ${basicInfo.guild_member_count}

노블레스 스킬
${basicInfo.guild_noblesse_skill.map((v) => `${v.skill_name}: ${v.skill_level}레벨`).join('\n')}`
        )
        .setTimestamp();
    embeds.push(mainEmbed);

    for (let i = 0; i < basicInfo.guild_member.length; i += 10) {
        const curMembers = basicInfo.guild_member.slice(i, i + 10);
        const info = (
            await Promise.all(
                curMembers.map(async (v) => {
                    try {
                        const mapleApiInfo = new MapleAPI(v);
                        const statInfo = await mapleApiInfo.ApiRequest('character/stat');
                        const value = statInfo.final_stat.find((v) => v.stat_name === '전투력')?.stat_value;
                        return `${v}: 전투력 ${value ? (+value).toLocaleString() : '-'}`;
                    } catch {
                        return null;
                    }
                })
            )
        )
            .filter((v) => v)
            .join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`**${basicInfo.world_name} ${basicInfo.guild_name} 길드원 정보**`)
            .setColor('#FF9999')
            .setDescription(info)
            .setTimestamp();
        embeds.push(embed);
    }

    return embeds;
}

export const type = '메이플';
export const commandData = {
    name: '길드',
    description: '입력한 내용에 해당하는 길드의 정보(길드 레벨, 길드 마스터, 노블레스 스킬, 길드원)를 보여줍니다.',
    options: [
        {
            name: '서버_이름',
            type: ApplicationCommandOptionType.String,
            description: '검색할 길드의 서버',
            choices: serverNames.map((v) => ({ name: v, value: v })),
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

    const mapleApiInfo = new MapleAPI(guildName, serverName);
    const basicInfo = await mapleApiInfo.ApiRequest('guild/basic');

    const embeds = await getGuildEmbed(basicInfo);
    await sendPageMessage(interaction, embeds);
}
