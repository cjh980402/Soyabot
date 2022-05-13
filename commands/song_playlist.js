import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { sendAdmin } from '../admin/bot_message.js';
import { QueueElement } from '../classes/QueueElement.js';
import { isValidPlaylist, isValidVideo, getPlaylistInfo } from '../util/song_util.js';
import { joinVoice } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

export const type = '음악';
export const commandData = {
    name: 'playlist',
    description: 'YouTube나 Soundcloud의 재생목록을 재생합니다.',
    options: [
        {
            name: '재생목록_주소_제목',
            type: ApplicationCommandOptionType.String,
            description: '재생할 재생목록의 주소 또는 제목',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.inGuild()) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const { channel } = interaction.member.voice;
    const serverQueue = interaction.client.queues.get(interaction.guildId);
    if (!channel) {
        return interaction.followUp('음성 채널에 먼저 참가해주세요!');
    }
    if (serverQueue && channel.id !== interaction.guild.members.me.voice.channelId) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    if (!channel.joinable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
    }
    if (channel.isVoice() && !channel.speakable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
    }

    const urlOrSearch = interaction.options.getString('재생목록_주소_제목');
    // 영상 주소가 주어진 경우는 play 기능을 실행
    if (isValidVideo(urlOrSearch) && !isValidPlaylist(urlOrSearch)) {
        interaction.options._hoistedOptions[0].name = '영상_주소_제목';
        return interaction.client.commands.get('play').commandExecute(interaction);
    }

    let playlist = null;
    try {
        playlist = await getPlaylistInfo(urlOrSearch, urlOrSearch);
        if (!playlist) {
            return interaction.followUp('검색 내용에 해당하는 재생목록을 찾지 못했습니다.');
        }
    } catch {
        return interaction.followUp('재생할 수 없는 재생목록입니다.');
    }

    const playlistEmbed = new EmbedBuilder()
        .setTitle(`**${playlist.title}**`)
        .setColor('#FF9999')
        .setURL(playlist.url)
        .setDescription(
            playlist.songs
                .map(
                    (song, index) =>
                        `${index + 1}. ${song.title} \`[${
                            song.duration === 0 ? '⊚ LIVE' : Util.toDurationString(song.duration)
                        }]\``
                )
                .join('\n')
        );

    if (serverQueue) {
        serverQueue.textChannel = interaction.channel;
        serverQueue.songs.push(...playlist.songs);
        return interaction.followUp({
            content: `✅ ${interaction.user}가 재생목록을 추가했습니다.`,
            embeds: [playlistEmbed]
        });
    }

    await interaction.followUp({
        content: `✅ ${interaction.user}가 재생목록을 시작했습니다.`,
        embeds: [playlistEmbed]
    });

    try {
        const newQueue = new QueueElement(interaction.channel, channel, await joinVoice(channel), playlist.songs);
        interaction.client.queues.set(interaction.guildId, newQueue);
        newQueue.playSong();
    } catch (err) {
        interaction.client.queues.delete(interaction.guildId);
        sendAdmin(
            interaction.client.users,
            `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: ${interaction}\n에러 내용: ${err.stack}`
        );
        await interaction.followUp(`채널에 참가할 수 없습니다: ${err.message}`);
    }
}
