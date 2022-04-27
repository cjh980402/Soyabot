import { EmbedBuilder } from 'discord.js';
import { sendPageMessage } from '../util/soyabot_util.js';

function getQueueEmbed(songs, thumbnail, name) {
    const embeds = [];
    for (let i = 0; i < songs.length; i += 8) {
        const info = songs
            .slice(i, i + 8)
            .map((track, j) => `${i + j + 1}. [${track.title}](${track.url})`)
            .join('\n\n');
        const embed = new EmbedBuilder()
            .setTitle(`**${name} 음악 대기열**`)
            .setThumbnail(thumbnail)
            .setColor('#FF9999')
            .setDescription(`**현재 재생 중인 노래 - [${songs[0].title}](${songs[0].url})**\n\n${info}`)
            .setTimestamp();
        embeds.push(embed);
    }
    return embeds;
}

export const type = ['음악'];
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
    await sendPageMessage(interaction, embeds);
}
