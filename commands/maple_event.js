import fetch from 'node-fetch';
import { load } from 'cheerio';
import { MessageActionRow, MessageButton, MessageEmbed } from '../util/discord.js-extend.js';

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
        const embed = new MessageEmbed()
            .setTitle('**진행중인 이벤트**')
            .setColor('#FF9999')
            .setDescription(info)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const usage = `${client.prefix}이벤트`;
export const command = ['이벤트', 'ㅇㅂㅌ'];
export const description = '- 현재 진행 중인 이벤트를 알려줍니다.';
export const type = ['메이플'];
export async function messageExecute(message) {
    const $ = load(await (await fetch('https://maplestory.nexon.com/News/Event')).text());
    const eventdata = $('.event_all_banner li dl');
    const links = eventdata.find('dt a').map((_, v) => $(v).attr('href'));
    const names = eventdata.find('dt a').map((_, v) => $(v).text());
    const dates = eventdata.find('dd a').map((_, v) => $(v).text());

    if (links.length === 0) {
        return message.channel.send('현재 진행중인 이벤트가 없습니다.');
    } else {
        const embeds = getEventEmbed(links, names, dates);
        if (embeds.length > 1) {
            let currentPage = 0;
            const row = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
            );
            const eventEmbed = await message.channel.send({
                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds: [embeds[currentPage]],
                components: [row]
            });

            const filter = (itr) => message.author.id === itr.user.id;
            const collector = eventEmbed.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (itr) => {
                try {
                    switch (itr.customId) {
                        case 'next':
                            currentPage = (currentPage + 1) % embeds.length;
                            await eventEmbed.edit({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'prev':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            await eventEmbed.edit({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'stop':
                            collector.stop();
                            break;
                    }
                } catch {}
            });
        } else {
            await message.channel.send({ embeds: [embeds[0]] });
        }
    }
}
export const commandData = {
    name: '이벤트',
    description: '현재 진행 중인 이벤트를 알려줍니다.'
};
export async function commandExecute(interaction) {
    const $ = load(await (await fetch('https://maplestory.nexon.com/News/Event')).text());
    const eventdata = $('.event_all_banner li dl');
    const links = eventdata.find('dt a').map((_, v) => $(v).attr('href'));
    const names = eventdata.find('dt a').map((_, v) => $(v).text());
    const dates = eventdata.find('dd a').map((_, v) => $(v).text());

    if (links.length === 0) {
        return interaction.followUp('현재 진행중인 이벤트가 없습니다.');
    } else {
        const embeds = getEventEmbed(links, names, dates);
        if (embeds.length > 1) {
            let currentPage = 0;
            const row = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
            );
            const eventEmbed = await interaction.editReply({
                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                embeds: [embeds[currentPage]],
                components: [row]
            });

            const filter = (itr) => interaction.user.id === itr.user.id;
            const collector = eventEmbed.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async (itr) => {
                try {
                    switch (itr.customId) {
                        case 'next':
                            currentPage = (currentPage + 1) % embeds.length;
                            await eventEmbed.edit({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'prev':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            await eventEmbed.edit({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'stop':
                            collector.stop();
                            break;
                    }
                } catch {}
            });
        } else {
            await interaction.editReply({ embeds: [embeds[0]] });
        }
    }
}
