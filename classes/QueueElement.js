import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice';
import { sendAdmin } from '../admin/bot_message.js';
import { songDownload, addYoutubeStatistics } from '../util/song_util.js';
import { Util } from '../util/Util.js';

export class QueueElement {
    #subscription;
    #leaveTimer = null;
    textChannel;
    voiceChannel;
    songs;
    loop = false;
    playingMessage = null;

    constructor(textChannel, voiceChannel, connection, songs) {
        this.#subscription = connection.subscribe(
            createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Stop } // 연결된 음성 채널이 없으면 재생 종료하는 옵션 추가
            })
        );
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.songs = songs;

        this.connection.removeAllListeners('error');
        this.connection.on('error', () => this.clearStop());

        this.player
            .on(AudioPlayerStatus.Idle, async () => {
                await this.deleteMessage();
                if (this.songs.length > 0) {
                    if (this.loop) {
                        this.songs.push(this.songs.shift()); // 현재 노래를 대기열의 마지막에 다시 넣어서 루프 구현
                    } else {
                        this.songs.shift();
                    }
                }
                this.playSong();
            })
            .on('error', (err) => {
                this.sendMessage('노래 재생을 실패했습니다.');
                sendAdmin(
                    this.voiceChannel.client.users,
                    `노래 재생 에러\n노래 주소: ${err.resource.metadata}\n에러 내용: ${err.stack}`
                );
            });
    }

    get connection() {
        return this.#subscription.connection;
    }

    get player() {
        return this.#subscription.player;
    }

    get playing() {
        return (
            this.player.state.status === AudioPlayerStatus.Playing ||
            this.player.state.status === AudioPlayerStatus.Buffering
        );
    }

    clearStop() {
        this.deleteLeave();
        this.voiceChannel.client.queues.delete(this.voiceChannel.guildId);
        this.songs = [];
        this.#subscription.unsubscribe();
        this.player.stop(true);
        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.connection.destroy();
        }
    }

    setLeave(timeout = 300000) {
        this.#leaveTimer ??= setTimeout(() => {
            try {
                if (this.player.state.resource && this.voiceChannel.members.filter((v) => !v.user.bot).size === 0) {
                    // timeout만큼 시간이 지나도 봇만 음성 채널에 있는 경우
                    this.sendMessage(
                        `${timeout / 60000}분 동안 ${
                            this.voiceChannel.client.user.username
                        }이 비활성화 되어 대기열을 끝냅니다.`
                    );
                    this.clearStop();
                } else {
                    this.#leaveTimer = null;
                }
            } catch {}
        }, timeout);
    }

    deleteLeave() {
        if (this.#leaveTimer) {
            clearTimeout(this.#leaveTimer);
            this.#leaveTimer = null;
        }
    }

    async playSong() {
        if (this.songs.length === 0 || !this.textChannel.guild.members.me.voice.channelId) {
            // 음성 채널에서 나가져도 songs 객체의 원소가 남아있는 경우가 존재하므로 음성 채널도 확인
            this.clearStop();
            return this.sendMessage('🛑 음악 대기열이 끝났습니다.');
        }

        const song = this.songs[0];
        try {
            const embed = new EmbedBuilder()
                .setTitle('**🎶 노래 재생 중 🎶**')
                .setColor('#FF9999')
                .setImage(song.thumbnail)
                .setDescription(`**${song.title}**\n${song.url}`)
                .setFooter({
                    text: song.duration === 0 ? '⊚ LIVE' : `전체 재생 시간: ${Util.toDurationString(song.duration)}`
                });
            const row1 = new ActionRowBuilder().addComponents([
                new ButtonBuilder().setCustomId('stop').setEmoji('⏹️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('play_pause').setEmoji('⏯️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary)
            ]);
            const row2 = new ActionRowBuilder().addComponents([
                new ButtonBuilder().setCustomId('mute').setEmoji('🔇').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('loop').setEmoji('🔁').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary)
            ]);

            this.playingMessage = await this.sendMessage({ embeds: [embed], components: [row1, row2] });
            this.player.play(await songDownload(song.url));
            addYoutubeStatistics(song.url);
        } catch (err) {
            this.sendMessage('노래 시작을 실패했습니다.');
            sendAdmin(
                this.voiceChannel.client.users,
                `노래 시작 에러\nsong 객체: ${JSON.stringify(song, null, 4)}\n에러 내용: ${err.stack}`
            );
            await this.deleteMessage();
            this.songs.shift();
            this.playSong();
        }
    }

    async sendMessage(data) {
        try {
            return await this.textChannel.send(data);
        } catch {
            try {
                const channels = this.textChannel.guild.channels.cache;
                if (!channels.has(this.textChannel.id)) {
                    this.textChannel = channels.find((v) => v.type === ChannelType.GuildText) ?? this.textChannel;
                }
                return await this.textChannel.send(data);
            } catch {}
        }
    }

    async deleteMessage() {
        try {
            if (
                this.voiceChannel.client.db.get(
                    'SELECT * FROM pruning_skip WHERE guild_id = ?',
                    this.playingMessage?.guildId
                )
            ) {
                this.playingMessage?.components.forEach((row) => row.components.forEach((v) => v.setDisabled(true)));
                await this.playingMessage?.edit({ components: this.playingMessage.components });
            } else {
                await this.playingMessage?.delete();
            }
        } catch {}
        this.playingMessage = null;
    }
}
