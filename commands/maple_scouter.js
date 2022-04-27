import { Attachment, EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { MapleUser } from '../classes/MapleParser.js';
const scoreGrade = [
    [0, '메린이'],
    [300, '무자본 평균'],
    [350, '메른이'],
    [400, '메벤 평균'],
    [450, '경손실 따질 스펙'],
    [500, '메덕'],
    [550, '현생보다도 메이플'],
    [600, '메생살이'],
    [650, '초월자'],
    [Infinity, '']
];

function getScouterEmbed(mapleUserInfo, union) {
    const level = mapleUserInfo.Level();
    const job = mapleUserInfo.Job();

    let murungfl, time, min, sec;

    const murung = mapleUserInfo.Murung();
    if (!murung) {
        murungfl = 0;
        min = 0;
        sec = 0;
        time = 900;
    } else {
        murungfl = +/\d+/.exec(murung[1]);
        [min, sec] = murung[2].match(/\d+/g).map(Number);
        time = min * 60 + sec;
    }

    const score = Math.floor(
        level -
            (level >= 275 ? 50 : 100) +
            (murungfl + 1 - time / 900) * (murungfl >= 45 ? 4 : 3) +
            union / (union >= 8000 ? 32 : 40)
    );
    let grade;
    for (let i = 0; i < scoreGrade.length - 1; i++) {
        if (scoreGrade[i][0] <= score && score < scoreGrade[i + 1][0]) {
            grade = scoreGrade[i][1];
            break;
        }
    }

    return new EmbedBuilder()
        .setTitle(`**${mapleUserInfo.Name}님의 측정결과**`)
        .setColor('#FF9999')
        .setURL(mapleUserInfo.GGURL)
        .setImage('attachment://character.png')
        .addFields([
            { name: '**직업**', value: job, inline: true },
            { name: '**레벨**', value: String(level), inline: true },
            { name: '**유니온**', value: union.toLocaleString(), inline: true },
            { name: '**무릉 기록**', value: murung ? `${murungfl}층 (${min}분 ${sec}초)` : '-', inline: true },
            { name: '**측정 결과**', value: `${grade}! (${score}점)` }
        ]);
}

export const type = ['메이플'];
export const commandData = {
    name: '스카우터',
    description: '정해진 조건으로 해당 캐릭터의 점수를 평가합니다. 닉네임을 생략 시에는 기준 점수표를 보여줍니다.',
    options: [
        {
            name: '닉네임',
            type: ApplicationCommandOptionType.String,
            description: '점수를 평가할 캐릭터의 닉네임'
        }
    ]
};
export async function commandExecute(interaction) {
    const nickname = interaction.options.getString('닉네임');
    if (!nickname) {
        let rslt = '스카우터 기준 점수표';
        for (let i = 0; i < scoreGrade.length - 2; i++) {
            rslt += `\n${scoreGrade[i][0]} ~ ${scoreGrade[i + 1][0] - 1}점: ${scoreGrade[i][1]}`;
        }
        rslt += `\n${scoreGrade.at(-2)[0]}점 이상: ${scoreGrade.at(-2)[1]}

점수 공식
(레벨 - 100) + (무릉 층수 * 3) + (유니온 / 40)
※ 레벨 275 이상: (레벨 - 50)
※ 무릉 45층 이상: (무릉 층수 * 4)
※ 유니온 8000 이상: (유니온 / 32)`;
        return interaction.followUp(rslt);
    }

    const mapleUserInfo = new MapleUser(nickname);
    const union = (await mapleUserInfo.homeUnion())?.[0];
    if (!union) {
        return interaction.followUp(`[${mapleUserInfo.Name}]\n존재하지 않거나 월드 내 최고 레벨이 아닌 캐릭터입니다.`);
    }

    if (!(await mapleUserInfo.isLatest())) {
        await interaction.followUp('제한시간 내에 갱신 작업을 실패했습니다.');
    }

    const image = new Attachment(mapleUserInfo.userImg(), 'character.png');
    await interaction.followUp({ embeds: [getScouterEmbed(mapleUserInfo, union)], files: [image] });
}
