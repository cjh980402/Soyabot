import { EmbedBuilder } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { sendPageMessage } from '../util/soyabot_util.js';

function getEventEmbed(links, names, dates) {
    const embeds = [];
    for (let i = 0; i < links.length; i += 5) {
        const curLinks = links.slice(i, i + 5);
        const curNames = names.slice(i, i + 5);
        const curDates = dates.slice(i, i + 5);
        const info = curLinks
            .map(
                (j, link) => `${i + j + 1}. [${curNames[j]}](https://maplestory.nexon.com${link})\n기간: ${curDates[j]}`
            )
            .get()
            .join('\n\n');
        const embed = new EmbedBuilder()
            .setTitle('**진행중인 이벤트**')
            .setColor('#FF9999')
            .setDescription(info)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const type = '메이플';
export const commandData = {
    name: '이벤트',
    description: '현재 진행 중인 이벤트를 알려줍니다.'
};
export async function commandExecute(interaction) {
    const { body } = await request('https://maplestory.nexon.com/News/Event');
    const $ = load(await body.text());
    const eventData = $('.event_all_banner li dl');
    const links = eventData.find('dt a').map((_, v) => $(v).attr('href'));
    const names = eventData.find('dt a').map((_, v) => $(v).text());
    const dates = eventData.find('dd a').map((_, v) => $(v).text());

    if (links.length === 0) {
        await interaction.followUp('현재 진행중인 이벤트가 없습니다.');
    } else {
        const embeds = getEventEmbed(links, names, dates);
        await sendPageMessage(interaction, embeds);
    }
}
