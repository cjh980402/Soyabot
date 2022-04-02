import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { PREFIX } from '../soyabot_config.js';
import { makePageCollector } from '../util/soyabot_util.js';

function getHaksikEmbed(date, haksik) {
    const embeds = [];
    for (let i = 0; i < date.length; i++) {
        const embed = new MessageEmbed()
            .setTitle(`**${date[i]}**`)
            .setColor('#FF9999')
            .setDescription(
                haksik
                    .find('td.al')
                    .get(i + 1)
                    .children.map((v) => v.data ?? '\n')
                    .join('')
                    .trim()
            )
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const usage = `${PREFIX}학식 (요일)`;
export const command = ['학식', 'ㅎㅅ'];
export const type = ['기타'];
export async function messageExecute(message, args) {
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const day = args[0]?.[0] ?? week[new Date().getDay()];

    if (day === '일' || day === '토') {
        return message.channel.send('주말은 학식이 제공되지 않습니다.');
    } else if (!week.includes(day)) {
        return message.channel.send('지원하지 않는 요일입니다.');
    }

    const { body } = await request('https://www.uos.ac.kr/food/placeList.do?epTicket=LOG', {
        headers: {
            'user-agent': 'undici'
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

                const row = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
                    new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
                );
                const haksikEmbed = await message.channel.send({
                    content: `**현재 페이지 - 1/${embeds.length}**`,
                    embeds: [embeds[0]],
                    components: [row]
                });

                const filter = (itr) => message.author.id === itr.user.id;
                return makePageCollector(haksikEmbed, embeds, { filter, time: 120000 });
            }
        }
        return message.channel.send(`${day}요일은 학식이 제공되지 않습니다.`);
    } else {
        return message.channel.send('학식 정보를 조회할 수 없습니다.');
    }
}
