import { ActionRowBuilder, SelectMenuBuilder, ApplicationCommandOptionType } from 'discord.js';
import { sendAdmin } from '../admin/bot_message.js';
import { QueueElement } from '../classes/QueueElement.js';
import { youtubeSearch } from '../util/song_util.js';
import { joinVoice } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

export const type = ['음악'];
export const commandData = {
    name: 'search',
    description: '재생할 노래를 검색하고 선택합니다.',
    options: [
        {
            name: '영상_제목',
            type: ApplicationCommandOptionType.String,
            description: '검색할 노래의 영상 제목',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const { channel } = interaction.member.voice;
    const serverQueue = interaction.client.queues.get(interaction.guildId);
    if (!channel) {
        return interaction.followUp('음성 채널에 먼저 참가해주세요!');
    }
    if (serverQueue && channel.id !== interaction.guild.me.voice.channelId) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    if (!channel.joinable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
    }
    if (channel.isVoice() && !channel.speakable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
    }

    const search = interaction.options.getString('영상_제목');
    const results = await youtubeSearch(search);
    if (!results) {
        return interaction.followUp('검색 내용에 해당하는 영상을 찾지 못했습니다.');
    }

    const row = new ActionRowBuilder().addComponents([
        new SelectMenuBuilder()
            .setCustomId('select_menu')
            .setPlaceholder(`총 ${results.length}곡이 검색되었습니다.`)
            .setMinValues(1)
            .setMaxValues(results.length)
            .addOptions(
                results.map((v, i) => ({
                    label: v.title,
                    description: `[${results[i].duration === 0 ? '⊚ LIVE' : results[i].durationText}]`,
                    value: String(i)
                }))
            )
    ]);

    const list = await interaction.followUp({ content: '재생할 노래를 선택해주세요.', components: [row] });
    try {
        const choiceMenu = await list.awaitMessageComponent({
            filter: (itr) => itr.user.id === interaction.user.id,
            time: 15000
        });
        await choiceMenu.deferUpdate();

        const songs = choiceMenu.values.map((v) => ({
            title: results[v].title,
            url: results[v].url,
            duration: Math.ceil(results[v].duration / 1000),
            thumbnail: results[v].thumbnails.at(-1).url
        }));

        if (serverQueue) {
            serverQueue.textChannel = interaction.channel;
            serverQueue.songs.push(...songs);
            return interaction.followUp(
                `✅ ${interaction.user}가\n${songs
                    .map(
                        (song) =>
                            `**${song.title}** [${
                                song.duration === 0 ? '⊚ LIVE' : Util.toDurationString(song.duration)
                            }]`
                    )
                    .join('\n')}\n를 대기열에 추가했습니다.`
            );
        }

        try {
            const newQueue = new QueueElement(interaction.channel, channel, await joinVoice(channel), songs);
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
    } catch {
    } finally {
        try {
            row.components[0].setDisabled(true);
            await list.edit({ components: [row] });
        } catch {}
    }
}
