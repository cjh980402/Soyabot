import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { sendPageMessage } from '../util/soyabot_util.js';

function getHaksikEmbed(date, haksik) {
    const embeds = [];
    for (let i = 0; i < date.length; i++) {
        const embed = new EmbedBuilder()
            .setTitle(`**${date[i]}**`)
            .setColor('#FF9999')
            .setDescription(
                haksik
                    .find('td.al')
                    .get(i + 1)
                    .children.map((v) => v.data ?? '\n')
                    .join('')
                    .trim() || '학식이 제공되지 않습니다.'
            )
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const type = '기타';
export const commandData = {
    name: '학식',
    description: '입력한 요일에 해당하는 학식을 보여줍니다. 요일을 생략 시에는 오늘 학식을 보여줍니다.',
    options: [
        {
            name: '요일',
            type: ApplicationCommandOptionType.String,
            description: '학식을 검색할 요일',
            choices: ['월', '화', '수', '목', '금'].map((v) => ({ name: v, value: v }))
        }
    ]
};
export async function commandExecute(interaction) {
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const day = interaction.options.getString('요일') ?? week[new Date().getDay()];

    if (day === '일' || day === '토') {
        return interaction.followUp('주말은 학식이 제공되지 않습니다.');
    }

    const { body } = await request('https://www.uos.ac.kr/food/placeList.do?identified=anonymous&', {
        headers: {
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
        }
    });
    const data = load(await body.text())('#week tr');
    if (data.length > 0) {
        // 하루 이상의 학식 데이터가 존재
        for (let i = 0; i < data.length; i++) {
            const nowData = data.eq(i);
            const date = nowData.find('th[scope="row"]').eq(0).text();
            if (date.includes(day)) {
                const embeds = getHaksikEmbed([`${date}의 점심`, `${date}의 저녁`], nowData);
                return sendPageMessage(interaction, embeds);
            }
        }
        await interaction.followUp(`${day}요일은 학식이 제공되지 않습니다.`);
    } else {
        await interaction.followUp('학식 정보를 조회할 수 없습니다.');
    }
}
