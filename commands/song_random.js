import { ChannelType } from 'discord.js';
import { sendAdmin } from '../admin/bot_message.js';
import { QueueElement } from '../classes/QueueElement.js';
import { getSongInfo, getYoutubeStatisticsCountLimit } from '../util/song_util.js';
import { joinVoice } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

export const type = '음악';
export const commandData = {
    name: 'random',
    description: '봇의 노래 통계 상위 50곡 내에서 랜덤으로 노래를 재생합니다.'
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const { channel } = interaction.member.voice;
    const guildQueue = interaction.client.queues.get(interaction.guildId);
    if (!channel) {
        return interaction.followUp('음성 채널에 먼저 참가해주세요!');
    }
    if (guildQueue && channel.id !== interaction.guild.members.me.voice.channelId) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    if (!channel.joinable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에 참가할 수 없습니다.');
    }
    if (channel.type === ChannelType.GuildVoice && !channel.speakable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
    }

    let song = null;
    try {
        const data = await getYoutubeStatisticsCountLimit(50);
        const videoID = data[Math.floor(Math.random() * data.length)].video_id;
        const url = `https://www.youtube.com/watch?v=${videoID}`;
        song = await getSongInfo(url, url);
        if (!song) {
            return interaction.followUp('검색 내용에 해당하는 영상을 찾지 못했습니다.');
        }
    } catch {
        return interaction.followUp('재생할 수 없는 영상입니다.');
    }

    if (guildQueue) {
        guildQueue.textChannel = interaction.channel;
        guildQueue.songs.push(song);
        return interaction.followUp(
            `✅ ${interaction.user}가\n**${song.title}** [${
                song.duration === 0 ? '⊚ LIVE' : Util.toDurationString(song.duration)
            }]\n을 대기열에 추가했습니다.`
        );
    }

    try {
        const newQueue = new QueueElement(interaction.channel, channel, await joinVoice(channel), [song]);
        interaction.client.queues.set(interaction.guildId, newQueue);
        newQueue.playSong();
        try {
            await interaction.deleteReply();
        } catch {}
    } catch (err) {
        interaction.client.queues.delete(interaction.guildId);
        sendAdmin(
            interaction.client.users,
            `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: ${interaction}\n에러 내용: ${err.stack}`
        );
        await interaction.followUp(`노래를 재생할 수 없습니다: ${err.message}`);
    }
}
