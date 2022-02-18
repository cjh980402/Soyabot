import { AudioPlayerStatus, createAudioPlayer, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice';
import { ErrorCodes } from 'youtube-dlsr';
import { MessageActionRow, MessageButton, MessageEmbed } from './discord.js-extend.js';
import { songDownload } from './song_util.js';
import { canModifyQueue } from './soyabot_util.js';
import { replyAdmin } from '../admin/bot_control.js';
import { DEFAULT_VOLUME } from '../soyabot_config.js';

export class QueueElement {
    textChannel;
    voiceChannel;
    subscription;
    songs;
    volume = DEFAULT_VOLUME;
    loop = false;
    playingMessage = null;

    constructor(textChannel, voiceChannel, connection, songs) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.subscription = connection.subscribe(
            createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Stop } // 연결된 음성 채널이 없으면 재생 종료하는 옵션 추가
            })
        );
        this.songs = songs;

        this.subscription.connection.removeAllListeners(VoiceConnectionStatus.Connecting);
        this.subscription.connection.removeAllListeners(VoiceConnectionStatus.Disconnected);
        this.subscription.connection.removeAllListeners('error');

        this.subscription.connection
            .once(VoiceConnectionStatus.Connecting, () => this.clearStop())
            .once(VoiceConnectionStatus.Disconnected, () => this.clearStop())
            .once('error', () => this.clearStop());

        this.subscription.player
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
                replyAdmin(`노래 재생 에러\n노래 주소: ${err.resource.metadata}\n에러 내용: ${err.stack ?? err._p}`);
            });
    }

    get playing() {
        return (
            this.subscription.player.state.status === AudioPlayerStatus.Buffering ||
            this.subscription.player.state.status === AudioPlayerStatus.Playing
        );
    }

    clearStop() {
        client.queues.delete(this.voiceChannel.guildId);
        this.songs = [];
        this.subscription.unsubscribe();
        this.subscription.player.stop(true);
        if (this.subscription.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            this.subscription.connection.destroy();
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
                    text: song.duration === 0 ? '⊚ 실시간 방송' : `전체 재생 시간: ${song.duration.toDurationString()}`
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
            this.subscription.player.play(await songDownload(song.url));
            // this.subscription.player.state.resource.volume.setVolume(this.volume / 100);
        } catch (err) {
            if (err.message === ErrorCodes.NO_SUITABLE_FORMAT) {
                this.sendMessage('재생할 수 없는 영상입니다.');
            } else {
                this.sendMessage('노래 시작을 실패했습니다.');
                replyAdmin(`노래 시작 에러\nsong 객체: ${song._p}\n에러 내용: ${err.stack ?? err._p}`);
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
        if (!db.get('SELECT * FROM pruningskip WHERE channelid = ?', [this.playingMessage?.guildId])) {
            try {
                await this.playingMessage?.delete();
            } catch {}
        }
        this.playingMessage = null;
    }
}

export async function musicButtonControl(interaction) {
    try {
        await interaction.deferUpdate(); // 버튼이 로딩 상태가 되었다가 원래대로 돌아옴

        const queue = client.queues.get(interaction.guildId);
        if (queue?.playingMessage?.id !== interaction.message.id || !queue.subscription.player.state.resource) {
            return;
        }

        if (!canModifyQueue(interaction.member)) {
            return queue.sendMessage(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        switch (interaction.customId) {
            case 'stop':
                queue.sendMessage(`${interaction.user} ⏹️ 노래를 정지했습니다.`);
                queue.clearStop();
                break;
            case 'play_pause':
                if (queue.playing) {
                    queue.subscription.player.pause();
                    queue.sendMessage(`${interaction.user} ⏸️ 노래를 일시정지 했습니다.`);
                } else {
                    queue.subscription.player.unpause();
                    queue.sendMessage(`${interaction.user} ▶️ 노래를 다시 틀었습니다.`);
                }
                break;
            case 'skip':
                queue.sendMessage(`${interaction.user} ⏭️ 노래를 건너뛰었습니다.`);
                queue.subscription.player.stop();
                break;
            case 'loop':
                queue.loop = !queue.loop;
                queue.sendMessage(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
                break;
            case 'mute':
                const muted = queue.voiceChannel.guild.me.voice.serverMute;
                await queue.voiceChannel.guild.me.voice.setMute(!muted);
                queue.sendMessage(
                    muted
                        ? `${interaction.user} 🔊 음소거를 해제했습니다.`
                        : `${interaction.user} 🔇 노래를 음소거 했습니다.`
                );
                break;
            case 'volume_down':
                queue.sendMessage('현재 메모리 이슈로 인해 볼륨 조절 기능은 사용할 수 없습니다.');
                /*queue.volume = Math.max(queue.volume - 10, 0);
                queue.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
                queue.sendMessage(`${interaction.user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);*/
                break;
            case 'volume_up':
                queue.sendMessage('현재 메모리 이슈로 인해 볼륨 조절 기능은 사용할 수 없습니다.');
                /*queue.volume = Math.min(queue.volume + 10, 100);
                queue.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
                queue.sendMessage(`${interaction.user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);*/
                break;
            case 'shuffle':
                queue.songs.shuffle(1); // 첫번째 노래를 제외하고 섞기
                queue.sendMessage(`${interaction.user} 🔀 대기열을 섞었습니다.`);
                break;
        }
    } catch {}
}

export function musicActiveControl(oldState, newState) {
    try {
        const oldVoice = oldState.channel;
        const newVoice = newState.channel;
        if (oldVoice?.id !== newVoice?.id) {
            console.log(!oldVoice ? 'User joined!' : !newVoice ? 'User left!' : 'User switched channels!');

            if (newVoice) {
                const newQueue = client.queues.get(newVoice.guild.id);
                if (
                    newQueue?.subscription.player.state.resource &&
                    !newQueue.playing &&
                    newVoice.id === newQueue.voiceChannel.id &&
                    newVoice.members.size === 2 &&
                    newVoice.members.has(client.user.id)
                ) {
                    newQueue.subscription.player.unpause();
                    newQueue.sendMessage('대기열을 다시 재생합니다.');
                }
            }

            if (oldVoice) {
                const oldQueue = client.queues.get(oldVoice.guild.id);
                if (
                    oldQueue?.subscription.player.state.resource &&
                    oldVoice.id === oldQueue.voiceChannel.id &&
                    oldVoice.members.size === 1 &&
                    oldVoice.members.has(client.user.id)
                ) {
                    // 봇만 음성 채널에 있는 경우
                    if (oldQueue.playing) {
                        oldQueue.subscription.player.pause();
                        oldQueue.sendMessage('모든 사용자가 음성채널을 떠나서 대기열을 일시정지합니다.');
                    }
                    setTimeout(() => {
                        const queue = client.queues.get(oldVoice.guild.id);
                        if (
                            queue?.subscription.player.state.resource &&
                            oldVoice.id === queue.voiceChannel.id &&
                            oldVoice.members.size === 1 &&
                            oldVoice.members.has(client.user.id)
                        ) {
                            // 5분이 지나도 봇만 음성 채널에 있는 경우
                            queue.sendMessage(`5분 동안 ${client.user.username}이 비활성화 되어 대기열을 끝냅니다.`);
                            queue.clearStop();
                        }
                    }, 300000);
                }
            }
        }
    } catch (err) {
        replyAdmin(`[oldState]\n${oldState._p}\n[newState]\n${newState._p}\n에러 내용: ${err.stack ?? err._p}`);
    }
}
