import { fetch } from 'undici';
import { load } from 'cheerio';
import { MessageAttachment, MessageEmbed } from '../util/discord.js-extend.js';
import { OPEN_API_KEY } from '../soyabot_config.js';

function calcIncrease($, selector) {
    const today = +$(selector).eq(0).text();
    const dateList = $('stateDt');
    const yesterday = +$(selector)
        .filter((i) => dateList.eq(i).text() !== dateList.eq(0).text())
        .eq(0)
        .text();
    return `${today.toLocaleString()} (${
        today >= yesterday ? `⬆️ ${(today - yesterday).toLocaleString()}` : `⬇️ ${(yesterday - today).toLocaleString()}`
    })`;
}

async function getCoronaEmbed() {
    const today = new Date();
    const startday = new Date(Date.now() - 604800000); // 일주일 전을 시작일로 설정
    const params = new URLSearchParams();
    params.set('serviceKey', OPEN_API_KEY);
    params.set('pageNo', '1');
    params.set('numOfRows', '10');
    params.set(
        'startCreateDt',
        `${startday.getFullYear()}${String(startday.getMonth() + 1).padStart(2, '0')}${String(
            startday.getDate()
        ).padStart(2, '0')}`
    );
    params.set(
        'endCreateDt',
        `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(
            2,
            '0'
        )}`
    );
    const $ = load(
        await (
            await fetch(`http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson?${params}`)
        ).text(),
        { xmlMode: true }
    );

    if ($('resultCode').text() === '00') {
        const thumbnail = new MessageAttachment('./pictures/mohw.png');
        const coronaEmbed = new MessageEmbed()
            .setTitle(`**${new Date($('createDt').eq(0).text()).toLocaleDateString()} 00시 기준**`)
            .setThumbnail('attachment://mohw.png')
            .setColor('#FF9999')
            .setURL('http://ncov.mohw.go.kr')
            .addField('**확진 환자**', calcIncrease($, 'decideCnt'))
            .addField('**격리 해제**', calcIncrease($, 'clearCnt'))
            .addField('**격리 중**', calcIncrease($, 'careCnt'))
            .addField('**사망자**', calcIncrease($, 'deathCnt'))
            .addField('**검사 중**', calcIncrease($, 'examCnt'));

        return { embeds: [coronaEmbed], files: [thumbnail] };
    } else {
        return '코로나 현황을 조회할 수 없습니다.';
    }
}

export const usage = `${client.prefix}코로나2`;
export const command = ['코로나2', 'ㅋㄹㄴ2'];
export const description = '- 최신 기준 코로나 국내 현황을 알려줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    return message.channel.send(await getCoronaEmbed());
}
export const commandData = {
    name: '코로나2',
    description: '최신 기준 코로나 국내 현황을 알려줍니다.'
};
export async function commandExecute(interaction) {
    return interaction.followUp(await getCoronaEmbed());
}
