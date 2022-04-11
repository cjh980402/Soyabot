import { MessageAttachment, MessageEmbed } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
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

    return new MessageEmbed()
        .setTitle(`**${mapleUserInfo.Name}님의 정보**`)
        .setColor('#FF9999')
        .setURL(mapleUserInfo.GGURL)
        .setImage('attachment://character.png')
        .addFields(
            { name: '**레벨**', value: char_lv < 300 ? `${char_lv} (${char_percent}%)` : char_lv, inline: true },
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
            { name: '**무릉 기록**', value: char_murung ? `${char_murung[1]} (${char_murung[2]})` : '-', inline: true },
            { name: '**시드 기록**', value: char_seed ? `${char_seed[1]} (${char_seed[2]})` : '-', inline: true },
            {
                name: '**종합 랭킹**',
                value: char_rank ? `전체: ${char_rank[0]}\n월드: ${char_rank[1]}` : '-',
                inline: true
            },
            {
                name: '**직업 랭킹**',
                value: char_rank ? `전체: ${char_rank[3]}\n월드: ${char_rank[2]}` : '-',
                inline: true
            }
        );
}

export const usage = `${PREFIX}정보 (닉네임)`;
export const command = ['정보', 'ㅈㅂ'];
export const description = '- 해당 캐릭터의 전체적인 정보를 출력합니다.';
export const type = ['메이플'];
export async function messageExecute(message, args) {
    if (args.length !== 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    const mapleUserInfo = new MapleUser(args[0]);
    const level = await mapleUserInfo.homeLevel();
    if (!level) {
        return message.channel.send(`[${mapleUserInfo.Name}]\n존재하지 않는 캐릭터입니다.`);
    }
    if (!(await mapleUserInfo.isLatest())) {
        message.channel.send('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const image = new MessageAttachment(mapleUserInfo.userImg(), 'character.png');
    return message.channel.send({ embeds: [await getInfoEmbed(mapleUserInfo, level)], files: [image] });
}
export const commandData = {
    name: '정보',
    description: '해당 캐릭터의 전체적인 정보를 출력합니다.',
    options: [
        {
            name: '닉네임',
            type: 'STRING',
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
        await interaction.editReply('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const image = new MessageAttachment(mapleUserInfo.userImg(), 'character.png');
    return interaction.followUp({ embeds: [await getInfoEmbed(mapleUserInfo, level)], files: [image] });
}
