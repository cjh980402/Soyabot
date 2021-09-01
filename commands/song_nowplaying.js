import { splitBar } from 'string-progressbar';
import { MessageEmbed } from '../util/discord.js-extend.js';

export const usage = `${client.prefix}nowplaying`;
export const command = ['nowplaying', 'np'];
export const description = '- 지금 재생 중인 노래를 보여줍니다.';
export const type = ['음악'];
export async function messageExecute(message) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = client.queues.get(message.guildId);
    if (!queue?.subscription.player.state.resource) {
        return message.reply('재생 중인 노래가 없습니다.');
    }
    // song.duration: 일반적인 영상 = 노래 길이(초), 생방송 영상 = 0
    const song = queue.songs[0];
    const seek = (queue.subscription.player.state.playbackDuration ?? 0) / 1000; // 실제로 재생한 시간(초)

    const nowPlaying = new MessageEmbed()
        .setTitle('**현재 재생 중인 노래**')
        .setDescription(`${song.title}\n${song.url}`)
        .setColor('#FF9999')
        .setAuthor(client.user.username)
        .addField(
            '\u200b',
            `${new Date(seek * 1000).toISOString().substr(11, 8)} [${splitBar(song.duration || seek, seek, 20)[0]}] ${
                song.duration === 0 ? '◉ LIVE' : new Date(song.duration * 1000).toISOString().substr(11, 8)
            }`
        );

    if (song.duration > 0) {
        nowPlaying.setFooter(`남은 시간: ${new Date((song.duration - seek) * 1000).toISOString().substr(11, 8)}`);
    }

    return message.channel.send({ embeds: [nowPlaying] });
}
export const commandData = {
    name: 'nowplaying',
    description: '지금 재생 중인 노래를 보여줍니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const queue = client.queues.get(interaction.guildId);
    if (!queue?.subscription.player.state.resource) {
        return interaction.followUp('재생 중인 노래가 없습니다.');
    }
    // song.duration: 일반적인 영상 = 노래 길이(초), 생방송 영상 = 0
    const song = queue.songs[0];
    const seek = (queue.subscription.player.state.playbackDuration ?? 0) / 1000; // 실제로 재생한 시간(초)

    const nowPlaying = new MessageEmbed()
        .setTitle('**현재 재생 중인 노래**')
        .setDescription(`${song.title}\n${song.url}`)
        .setColor('#FF9999')
        .setAuthor(client.user.username)
        .addField(
            '\u200b',
            `${new Date(seek * 1000).toISOString().substr(11, 8)} [${splitBar(song.duration || seek, seek, 20)[0]}] ${
                song.duration === 0 ? '◉ LIVE' : new Date(song.duration * 1000).toISOString().substr(11, 8)
            }`
        );

    if (song.duration > 0) {
        nowPlaying.setFooter(`남은 시간: ${new Date((song.duration - seek) * 1000).toISOString().substr(11, 8)}`);
    }

    return interaction.followUp({ embeds: [nowPlaying] });
}
