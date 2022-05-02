import { request } from 'undici';
import { load } from 'cheerio';

export const type = '메이플';
export const commandData = {
    name: '썬데이',
    description: '현재 진행 (예정) 중인 썬데이 메이플을 공지합니다.'
};
export async function commandExecute(interaction) {
    const { body } = await request('https://maplestory.nexon.com/News/Event');
    const $ = load(await body.text());
    const eventData = $('.event_all_banner li dl');
    const sunday = eventData
        .find('dt a')
        .filter((_, v) => /썬데이\s*메이플$/.test($(v).text()))
        .attr('href');
    if (!sunday) {
        return interaction.followUp('썬데이 메이플 공지가 아직 없습니다.');
    }

    const { body: sundayBody } = await request(`https://maplestory.nexon.com${sunday}`);
    const sundayData = load(await sundayBody.text())('.contents_wrap');
    const sundayDate = sundayData.find('.event_date').text();
    const sundayImg = sundayData.find('img[alt="썬데이 메이플!"]').attr('src');

    await interaction.followUp({ content: sundayDate, files: [sundayImg] });
}
