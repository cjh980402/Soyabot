import { EmbedBuilder } from 'discord.js';
import { splitBar } from 'string-progressbar';
import { Util } from '../util/Util.js';

export const type = '음악';
export const commandData = {
    name: 'nowplaying',
    description: '지금 재생 중인 노래를 보여줍니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = interaction.client.queues.get(interaction.guildId);
    if (!queue?.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }
    // song.duration: 일반적인 영상 = 노래 길이(초), 생방송 영상 = 0
    const song = queue.songs[0];
    const seek = (queue.player.state.playbackDuration ?? 0) / 1000; // 실제로 재생한 시간(초)

    const nowPlaying = new EmbedBuilder()
        .setTitle('**현재 재생 중인 노래**')
        .setColor('#FF9999')
        .setDescription(`${song.title}\n${song.url}`)
        .setAuthor({ name: interaction.client.user.username })
        .addFields([
            {
                name: '\u200b',
                value: `${Util.toDurationString(seek)} [${splitBar(song.duration || seek, seek, 20)[0]}] ${
                    song.duration === 0 ? '⊚ LIVE' : Util.toDurationString(song.duration)
                }`
            }
        ]);

    if (song.duration > 0) {
        nowPlaying.setFooter({ text: `남은 재생 시간: ${Util.toDurationString(song.duration - seek)}` });
    }

    await interaction.followUp({ embeds: [nowPlaying] });
}
