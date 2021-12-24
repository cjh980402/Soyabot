import fetch from 'node-fetch';
import { load } from 'cheerio';

export const usage = `${client.prefix}썬데이`;
export const command = ['썬데이', 'ㅆㄷㅇ'];
export const description = '- 현재 진행 (예정) 중인 썬데이 메이플을 공지합니다.';
export const type = ['메이플'];
export async function messageExecute(message) {
    const $ = load(await (await fetch('https://maplestory.nexon.com/News/Event')).text());
    const eventdata = $('.event_all_banner li dl');
    const sunday = eventdata
        .find('dt a')
        .filter((_, v) => /썬데이\s*메이플$/.test($(v).text()))
        .attr('href');
    if (!sunday) {
        return message.channel.send('썬데이 메이플 공지가 아직 없습니다.');
    }

    const sundayData = load(await (await fetch(`https://maplestory.nexon.com${sunday}`)).text())('.contents_wrap');
    const sundayDate = sundayData.find('.event_date').text();
    const sundayImg = sundayData.find('img[alt="썬데이 메이플!"]').attr('src');

    return message.channel.send({ content: sundayDate, files: [sundayImg] });
}
export const commandData = {
    name: '썬데이',
    description: '현재 진행 (예정) 중인 썬데이 메이플을 공지합니다.'
};
export async function commandExecute(interaction) {
    const $ = load(await (await fetch('https://maplestory.nexon.com/News/Event')).text());
    const eventdata = $('.event_all_banner li dl');
    const sunday = eventdata
        .find('dt a')
        .filter((_, v) => /썬데이\s*메이플$/.test($(v).text()))
        .attr('href');
    if (!sunday) {
        return interaction.followUp('썬데이 메이플 공지가 아직 없습니다.');
    }

    const sundayData = load(await (await fetch(`https://maplestory.nexon.com${sunday}`)).text())('.contents_wrap');
    const sundayDate = sundayData.find('.event_date').text();
    const sundayImg = sundayData.find('img[alt="썬데이 메이플!"]').attr('src');

    return interaction.followUp({ content: sundayDate, files: [sundayImg] });
}
