import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { request } from 'undici';
import { load } from 'cheerio';

export const type = '기타';
export const commandData = {
    name: '코로나',
    description: '최신 기준 코로나 국내 현황 통계를 알려줍니다.'
};
export async function commandExecute(interaction) {
    const { body: countBody } = await request('https://ncov.kdca.go.kr');
    const countData = load(await countBody.text());
    const today = countData('.occurrenceStatus .occur_graph tbody span');
    const accumulated = countData('.occurrenceStatus .occur_num .box');

    const updateDate = /\((.+ 기준).+\)/.exec(countData('.occurrenceStatus .livedate').text())[1];
    const coronaEmbed = new EmbedBuilder()
        .setTitle(`**${updateDate}**`)
        .setThumbnail('attachment://mohw.png')
        .setColor('#FF9999')
        .setURL('https://ncov.kdca.go.kr')
        .addFields([
            { name: '**확진 환자**', value: `${accumulated.eq(1).contents().eq(1).text()} (⬆️ ${today.eq(4).text()})` },
            { name: '**사망자**', value: `${accumulated.eq(0).contents().eq(1).text()} (⬆️ ${today.eq(1).text()})` },
            { name: '**신규 입원**', value: `${today.eq(3).text()}` },
            { name: '**재원 위중증**', value: `${today.eq(2).text()}` }
        ])
        .setTimestamp();

    const thumbnail = new AttachmentBuilder('./pictures/mohw.png');
    await interaction.followUp({ embeds: [coronaEmbed], files: [thumbnail] });
}
