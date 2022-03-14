import { request } from 'undici';
import { load } from 'cheerio';
import { PREFIX } from '../soyabot_config.js';

export const usage = `${PREFIX}미세먼지`;
export const command = ['미세먼지', 'ㅁㅅㅁㅈ', '초미세먼지', 'ㅊㅁㅅㅁㅈ'];
export const description = '- 현재 한국의 미세먼지(초미세먼지) 현황을 보여줍니다.';
export const type = ['기타'];
export async function messageExecute(message) {
    const dustType = /초미세먼지|ㅊㅁㅅㅁㅈ/.test(message.content) ? '초미세먼지' : '미세먼지';
    const { body } = await request(
        `https://m.search.daum.net/search?w=tot&nil_mtopsearch=btn&DA=YZR&q=${encodeURIComponent(
            dustType
        )}%EC%98%81%EC%83%81`
    );
    const $ = load(await body.text());

    return message.channel.send({
        content: `현재 ${dustType} 지도`,
        files: [$('div.play_video > img').attr('data-original-src')]
    });
}
export const commandData = {
    name: '미세먼지',
    description: '현재 한국의 미세먼지 현황을 보여줍니다.'
};
export async function commandExecute(interaction) {
    const { body } = await request(
        `https://m.search.daum.net/search?w=tot&nil_mtopsearch=btn&DA=YZR&q=${encodeURIComponent(
            '미세먼지'
        )}%EC%98%81%EC%83%81`
    );
    const $ = load(await body.text());

    return interaction.followUp({
        content: '현재 미세먼지 지도',
        files: [$('div.play_video > img').attr('data-original-src')]
    });
}
