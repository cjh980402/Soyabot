import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice';
import { FormatError } from 'youtube-dlsr';
import { replyAdmin } from '../admin/bot_control.js';
import { songDownload } from '../util/song_util.js';
import { Util } from '../util/Util.js';
import { DEFAULT_VOLUME } from '../soyabot_config.js';

export class QueueElement {
    #subscription;
    textChannel;
    voiceChannel;
    songs;
    volume = DEFAULT_VOLUME;
    loop = false;
    playingMessage = null;
    leaveTimer = null;

    constructor(textChannel, voiceChannel, connection, songs) {
        this.#subscription = connection.subscribe(
            createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Stop } // 연결된 음성 채널이 없으면 재생 종료하는 옵션 추가
            })
        );
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.songs = songs;

        this.connection.once('error', () => this.clearStop());

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
                replyAdmin(
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
            this.player.state.status === AudioPlayerStatus.Buffering ||
            this.player.state.status === AudioPlayerStatus.Playing
        );
    }

    clearStop() {
        clearTimeout(this.leaveTimer);
        this.voiceChannel.client.queues.delete(this.voiceChannel.guildId);
        this.songs = [];
        this.#subscription.unsubscribe();
        this.player.stop(true);
        this.connection.removeAllListeners('error');
        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.connection.destroy();
        }
    }

    async playSong() {
        if (this.songs.length === 0) {
            this.clearStop();
            return this.sendMessage('🛑 음악 대기열이 끝났습니다.');
        }

        const song = this.songs[0];
        try {
            const embed = new MessageEmbed()
                .setTitle('**🎶 노래 재생 중 🎶**')
                .setColor('#FF9999')
                .setImage(song.thumbnail)
                .setDescription(`**${song.title}**\n${song.url}`)
                .setFooter({
                    text:
                        song.duration === 0
                            ? '⊚ 실시간 방송'
                            : `전체 재생 시간: ${Util.toDurationString(song.duration)}`
                });
            const row1 = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('play_pause').setEmoji('⏯️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('skip').setEmoji('⏭️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('loop').setEmoji('🔁').setStyle('SECONDARY')
            );
            const row2 = new MessageActionRow().addComponents(
                new MessageButton().setCustomId('mute').setEmoji('🔇').setStyle('SECONDARY'),
                new MessageButton().setCustomId('volume_down').setEmoji('🔉').setStyle('SECONDARY'),
                new MessageButton().setCustomId('volume_up').setEmoji('🔊').setStyle('SECONDARY'),
                new MessageButton().setCustomId('shuffle').setEmoji('🔀').setStyle('SECONDARY')
            );

            this.playingMessage = await this.sendMessage({ embeds: [embed], components: [row1, row2] });
            this.player.play(await songDownload(song.url));
            // this.player.state.resource.volume.setVolume(this.volume / 100);
        } catch (err) {
            if (err instanceof FormatError) {
                this.sendMessage('재생할 수 없는 영상입니다.');
            } else {
                this.sendMessage('노래 시작을 실패했습니다.');
                replyAdmin(
                    this.voiceChannel.client.users,
                    `노래 시작 에러\nsong 객체: ${JSON.stringify(song, null, 4)}\n에러 내용: ${err.stack}`
                );
            }
            await this.deleteMessage();
            this.songs.shift();
            return this.playSong();
        }
    }

    async sendMessage(content) {
        try {
            return await this.textChannel.send(content);
        } catch {
            try {
                const channels = this.textChannel.guild.channels.cache;
                if (!channels.has(this.textChannel.id)) {
                    this.textChannel = channels.find((v) => v.type === 'GUILD_TEXT') ?? this.textChannel;
                }
                return await this.textChannel.send(content);
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
                // 음악 메시지의 버튼 비활성화
                this.playingMessage?.components.forEach((row) => row.components.forEach((v) => v.setDisabled(true)));
                await this.playingMessage?.edit({
                    components: this.playingMessage.components
                });
            } else {
                await this.playingMessage?.delete();
            }
        } catch {}
        this.playingMessage = null;
    }
}
