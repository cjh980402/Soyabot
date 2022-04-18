import { MessageAttachment, MessageEmbed } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { PREFIX } from '../soyabot_config.js';
import { sendPageMessage } from '../util/soyabot_util.js';

async function getCoronaEmbed() {
    const { body: countBody } = await request('http://ncov.mohw.go.kr');
    const countData = load(await countBody.text());
    const today = countData('.occurrenceStatus .occur_graph tbody span');
    const accumulated = countData('.occurrenceStatus .occur_num .box');
    const updateDate = /\((.+ 기준).+\)/.exec(countData('.occurrenceStatus .livedate').text())[1];
    const corona1 = new MessageEmbed()
        .setTitle(`**${updateDate}**`)
        .setThumbnail('attachment://mohw.png')
        .setColor('#FF9999')
        .setURL('http://ncov.mohw.go.kr')
        .addFields(
            { name: '**확진 환자**', value: `${accumulated.eq(1).contents().eq(1).text()} (⬆️ ${today.eq(4).text()})` },
            { name: '**사망자**', value: `${accumulated.eq(0).contents().eq(1).text()} (⬆️ ${today.eq(1).text()})` },
            { name: '**신규 입원**', value: `${today.eq(3).text()}` },
            { name: '**재원 위중증**', value: `${today.eq(2).text()}` }
        )
        .setTimestamp();

    const { body: countryBody } = await request('http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=13');
    const countryData = load(await countryBody.text());
    const rslt = countryData('.data_table.midd.mgt24 tbody tr')
        .map((_, v) => ({
            name: countryData(v).find('th').text(),
            todayCountry: countryData(v).find('td[headers="status_level l_type2"]').text(),
            todayAbroad: countryData(v).find('td[headers="status_level l_type3"]').text(),
            accumulatedCase: countryData(v).find('td[headers="status_con s_type1"]').text()
        }))
        .get()
        .sort((a, b) => +b.todayCountry.replace(/,/g, '') - +a.todayCountry.replace(/,/g, ''))
        .map((v) => `${v.name}: ${v.accumulatedCase} (국내: ⬆️ ${v.todayCountry}, 해외: ⬆️ ${v.todayAbroad})`);
    const corona2 = new MessageEmbed()
        .setTitle('**지역별 확진 환자 현황**')
        .setThumbnail('attachment://mohw.png')
        .setColor('#FF9999')
        .setURL('http://ncov.mohw.go.kr')
        .setDescription(`${rslt.shift()}\n\n${rslt.join('\n')}`)
        .setTimestamp();

    return [corona1, corona2];
}

export const usage = `${PREFIX}코로나`;
export const command = ['코로나', 'ㅋㄹㄴ'];
export const description = '- 최신 기준 코로나 국내 현황 통계를 알려줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const thumbnail = new MessageAttachment('./pictures/mohw.png');
    const embeds = await getCoronaEmbed();
    await sendPageMessage(message, embeds, { files: [thumbnail] });
}
export const commandData = {
    name: '코로나',
    description: '최신 기준 코로나 국내 현황 통계를 알려줍니다.'
};
export async function commandExecute(interaction) {
    const thumbnail = new MessageAttachment('./pictures/mohw.png');
    const embeds = await getCoronaEmbed();
    await sendPageMessage(interaction, embeds, { files: [thumbnail] });
}
