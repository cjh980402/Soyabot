import iconv from 'iconv-lite';
import fetch from 'node-fetch';
import { load } from 'cheerio';

export const usage = `${client.prefix}한강`;
export const command = ['한강', 'ㅎㄱ'];
export const description = '- 현재 한강의 수온을 알려줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const $ = load(iconv.decode(await (await fetch('http://www.koreawqi.go.kr/wQSCHomeLayout_D.wq?action_type=T#')).buffer(), 'euc-kr'));
    // 수질 정보 사이트 인코딩: euc-kr
    if ($('tr.site_S01004 > td').length !== 8) {
        return message.channel.send('측정소 운전이 정지됐습니다.');
    }

    const temper = $('tr.site_S01004 > td').eq(0).text().trim();
    if (isNaN(temper)) {
        return message.channel.send(`측정소가 '${temper}' 상태입니다.`);
    } else {
        const search_time = $('span.data > script').html().trim().split('\n')[0].replace(/\D+/g, '');
        return message.channel.send(
            `지금 한강온도: ${temper}°C\n업데이트 시간: ${search_time.substr(0, 4)}년 ${+search_time.substr(4, 2)}월 ${+search_time.substr(6, 2)}일 ${+search_time.substr(8, 2)}시`
        );
    }
}
export const commandData = {
    name: '한강',
    description: '현재 한강의 수온을 알려줍니다.'
};
export async function commandExecute(interaction) {
    const $ = load(iconv.decode(await (await fetch('http://www.koreawqi.go.kr/wQSCHomeLayout_D.wq?action_type=T#')).buffer(), 'euc-kr'));
    // 수질 정보 사이트 인코딩: euc-kr
    if ($('tr.site_S01004 > td').length !== 8) {
        return interaction.followUp('측정소 운전이 정지됐습니다.');
    }

    const temper = $('tr.site_S01004 > td').eq(0).text().trim();
    if (isNaN(temper)) {
        return interaction.followUp(`측정소가 '${temper}' 상태입니다.`);
    } else {
        const search_time = $('span.data > script').html().trim().split('\n')[0].replace(/\D+/g, '');
        return interaction.followUp(
            `지금 한강온도: ${temper}°C\n업데이트 시간: ${search_time.substr(0, 4)}년 ${+search_time.substr(4, 2)}월 ${+search_time.substr(6, 2)}일 ${+search_time.substr(8, 2)}시`
        );
    }
}
