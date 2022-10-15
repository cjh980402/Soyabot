import { request } from 'undici';
import { load } from 'cheerio';

export const type = '기타';
export const commandData = {
    name: '미세먼지',
    description: '현재 한국의 미세먼지 현황을 보여줍니다.'
};
export async function commandExecute(interaction) {
    const { body } = await request('https://www.airkorea.or.kr/web/dustForecast?pMENU_NO=113');
    const $ = load(await body.text());

    await interaction.followUp({
        content: '대기질 농도 전망',
        files: [`https://www.airkorea.or.kr${$('.model.MgT20 > .st_2 .popup-layer').attr('href')}`]
    });
}
