import { fetch } from 'undici';
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
        .filter((_, v) => /^썬데이\s*메이플$/.test($(v).text()))
        .attr('href');
    if (!sunday) {
        return message.channel.send('썬데이 메이플 공지가 아직 없습니다.');
    }

    const sundayTitle = `${eventdata
        .find('dd a')
        .filter((_, v) => $(v).attr('href') === sunday)
        .text()
        .substr(0, 14)}의 썬데이 메이플`;
    const imgLink = load(await (await fetch(`https://maplestory.nexon.com${sunday}`)).text())(
        'img[alt="썬데이 메이플!"]'
    ).attr('src');

    return message.channel.send({ content: sundayTitle, files: [imgLink] });
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
        .filter((_, v) => /^썬데이\s*메이플$/.test($(v).text()))
        .attr('href');
    if (!sunday) {
        return interaction.followUp('썬데이 메이플 공지가 아직 없습니다.');
    }

    const sundayTitle = `${eventdata
        .find('dd a')
        .filter((_, v) => $(v).attr('href') === sunday)
        .text()
        .substr(0, 14)}의 썬데이 메이플`;
    const imgLink = load(await (await fetch(`https://maplestory.nexon.com${sunday}`)).text())(
        'img[alt="썬데이 메이플!"]'
    ).attr('src');

    return interaction.followUp({ content: sundayTitle, files: [imgLink] });
}
