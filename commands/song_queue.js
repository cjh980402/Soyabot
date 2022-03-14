import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';

function getQueueEmbed(songs, thumbnail, name) {
    const embeds = [];
    for (let i = 0; i < songs.length; i += 8) {
        const info = songs
            .slice(i, i + 8)
            .map((track, j) => `${i + j + 1}. [${track.title}](${track.url})`)
            .join('\n\n');
        const embed = new MessageEmbed()
            .setTitle(`**${name} 음악 대기열**`)
            .setThumbnail(thumbnail)
            .setColor('#FF9999')
            .setDescription(`**현재 재생 중인 노래 - [${songs[0].title}](${songs[0].url})**\n\n${info}`)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const usage = `${PREFIX}queue`;
export const command = ['queue', 'q'];
export const description = '- 대기열과 지금 재생 중인 노래 출력합니다.';
export const type = ['음악'];
export async function messageExecute(message) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = message.client.queues.get(message.guildId);
    if (!queue?.player.state.resource) {
        return message.reply('재생 중인 노래가 없습니다.');
    }

    const embeds = getQueueEmbed(queue.songs, message.guild.iconURL(), message.client.user.username);
    if (embeds.length > 1) {
        let currentPage = 0;
        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
            new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
            new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
        );
        const queueEmbed = await message.channel.send({
            content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
            embeds: [embeds[currentPage]],
            components: [row]
        });

        const filter = (itr) => message.author.id === itr.user.id;
        const collector = queueEmbed.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async (itr) => {
            try {
                switch (itr.customId) {
                    case 'next':
                        currentPage = (currentPage + 1) % embeds.length;
                        await queueEmbed.edit({
                            content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                            embeds: [embeds[currentPage]]
                        });
                        break;
                    case 'prev':
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                        await queueEmbed.edit({
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
export const commandData = {
    name: 'queue',
    description: '대기열과 지금 재생 중인 노래 출력합니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = interaction.client.queues.get(interaction.guildId);
    if (!queue?.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }

    const embeds = getQueueEmbed(queue.songs, interaction.guild.iconURL(), interaction.client.user.username);
    if (embeds.length > 1) {
        let currentPage = 0;
        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
            new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
            new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
        );
        const queueEmbed = await interaction.editReply({
            content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
            embeds: [embeds[currentPage]],
            components: [row]
        });

        const filter = (itr) => interaction.user.id === itr.user.id;
        const collector = queueEmbed.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async (itr) => {
            try {
                switch (itr.customId) {
                    case 'next':
                        currentPage = (currentPage + 1) % embeds.length;
                        await queueEmbed.edit({
                            content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                            embeds: [embeds[currentPage]]
                        });
                        break;
                    case 'prev':
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                        await queueEmbed.edit({
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
