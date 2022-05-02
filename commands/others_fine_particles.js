import { EmbedBuilder } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';
import { sendPageMessage } from '../util/soyabot_util.js';

async function getFineParticlesEmbed() {
    const dustTypes = ['미세먼지', '초미세먼지'];
    const embeds = [];
    for (const dustType of dustTypes) {
        const { body } = await request(
            `https://m.search.daum.net/search?w=tot&nil_mtopsearch=btn&DA=YZR&q=${encodeURIComponent(
                dustType
            )}%EC%98%81%EC%83%81`
        );
        const $ = load(await body.text());

        const embed = new EmbedBuilder()
            .setTitle(`**현재 ${dustType} 지도**`)
            .setColor('#FF9999')
            .setImage($('div.play_video > img').attr('data-original-src'))
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const type = '기타';
export const commandData = {
    name: '미세먼지',
    description: '현재 한국의 미세먼지 현황을 보여줍니다.'
};
export async function commandExecute(interaction) {
    const embeds = await getFineParticlesEmbed();
    await sendPageMessage(interaction, embeds);
}
