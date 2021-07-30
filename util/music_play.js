const { AudioPlayerStatus, createAudioPlayer, createAudioResource, StreamType, VoiceConnectionStatus } = require('@discordjs/voice');
const { songDownload } = require('./song_util');
const { replyAdmin } = require('../admin/bot_control');
const { STAY_TIME, DEFAULT_VOLUME } = require('../soyabot_config.json');
const { canModifyQueue } = require('./soyabot_util');
const disconnectTimeout = {};

module.exports.QueueElement = class {
    textChannel;
    voiceChannel;
    connection;
    songs;
    volume = DEFAULT_VOLUME;
    loop = false;
    playing = true;
    audioPlayer = createAudioPlayer();
    playingMessage = null;

    constructor(textChannel, voiceChannel, connection, songs) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.connection = connection;
        this.songs = songs;

        const connectionFinish = () => {
            client.queues.delete(this.voiceChannel.guild.id);
            this.songs = [];
            this.audioPlayer.stop(true);
        };

        this.connection.removeAllListeners('error');
        this.connection.removeAllListeners('destroyed');
        this.connection.removeAllListeners('disconnected');

        this.connection.once('error', () => this.connection.destroy());
        this.connection.once('destroyed', connectionFinish);
        this.connection.once('disconnected', () => {
            connectionFinish();
            this.connection.destroy();
        });
        this.connection.subscribe(this.audioPlayer);
    }

    async textSend(text) {
        try {
            return await this.textChannel.send(text);
        } catch {
            try {
                const channels = this.textChannel.guild.channels.cache;
                if (!channels.get(this.textChannel.id)) {
                    this.textChannel = channels.find((v) => v.type === 'GUILD_TEXT') ?? this.textChannel;
                }
                return await this.textChannel.send(text);
            } catch {}
        }
    }

    async deleteMessage() {
        const find = await db.get('SELECT * FROM pruningskip WHERE channelid = ?', [this.voiceChannel.guild.id]);
        if (!find) {
            try {
                await this.playingMessage?.delete();
            } catch {}
        }
        this.playingMessage = null;
    }
};

module.exports.play = async function (queue) {
    const song = queue.songs[0];
    const { guild } = queue.voiceChannel;

    if (!song) {
        client.queues.delete(guild.id);
        clearTimeout(disconnectTimeout[guild.id]); // 기존 퇴장예약 취소
        disconnectTimeout[guild.id] = setTimeout(() => {
            // 종료 후 새로운 음악 기능이 수행 중이지 않으면 나감
            delete disconnectTimeout[guild.id]; // 완료된 퇴장예약 제거
            if (!client.queues.get(guild.id) && queue.connection.state.status === VoiceConnectionStatus.Ready) {
                queue.connection.destroy();
                queue.textSend(`${STAY_TIME}초가 지나서 음성 채널을 떠납니다.`);
            }
        }, STAY_TIME * 1000); // 새 퇴장예약 추가
        return queue.textSend('❌ 음악 대기열이 끝났습니다.');
    }

    let resource = null;
    try {
        resource = createAudioResource(await songDownload(song.url), {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });
        queue.audioPlayer.play(resource);
        queue.audioPlayer.state.resource.volume.setVolume(queue.volume / 100);
    } catch (e) {
        queue.textSend('노래 재생에 실패했습니다.');
        replyAdmin(`노래 재생 에러\nsong 객체: ${song._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
        queue.songs.shift();
        return module.exports.play(queue);
    }

    queue.playingMessage = await queue.textSend(`🎶 노래 재생 시작: **${song.title}**\n${song.url}`);
    queue.audioPlayer
        .on('stateChange', async (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
                // 재생 중인 노래가 끝난 경우
                queue.audioPlayer.removeAllListeners('stateChange');
                queue.audioPlayer.removeAllListeners('error');
                await queue.deleteMessage();
                if (queue.loop) {
                    queue.songs.push(queue.songs.shift()); // 현재 노래를 대기열의 마지막에 다시 넣어서 루프 구현
                } else {
                    queue.songs.shift();
                }
                module.exports.play(queue); // 재귀적으로 다음 곡 재생
            }
        })
        .on('error', async (e) => {
            queue.audioPlayer.removeAllListeners('stateChange');
            queue.audioPlayer.removeAllListeners('error');
            await queue.deleteMessage();
            queue.textSend('노래 재생에 실패했습니다.');
            replyAdmin(`노래 재생 에러\nsong 객체: ${song._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            queue.songs.shift();
            module.exports.play(queue);
        });

    try {
        await queue.playingMessage.react('⏯');
        await queue.playingMessage.react('⏭');
        await queue.playingMessage.react('🔇');
        await queue.playingMessage.react('🔉');
        await queue.playingMessage.react('🔊');
        await queue.playingMessage.react('🔁');
        await queue.playingMessage.react('⏹');
    } catch {}
};

module.exports.musicReactionControl = async function (reaction, user) {
    const { guild } = reaction.message.channel;
    const queue = client.queues.get(guild?.id);
    try {
        if (user.bot || queue?.playingMessage?.id !== reaction.message.id || !queue.audioPlayer.state.resource) {
            return;
        }

        await reaction.users.remove(user);
        if (!canModifyQueue(await guild.members.fetch({ user: user.id, cache: false }))) {
            return queue.textSend(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        switch (reaction.emoji.name) {
            case '⏯':
                queue.playing = !queue.playing;
                if (queue.playing) {
                    queue.audioPlayer.unpause();
                    queue.textSend(`${user} ▶️ 노래를 다시 틀었습니다.`);
                } else {
                    queue.audioPlayer.pause();
                    queue.textSend(`${user} ⏸ 노래를 일시정지 했습니다.`);
                }
                break;
            case '⏭':
                queue.textSend(`${user} ⏭ 노래를 건너뛰었습니다.`);
                queue.playing = true;
                queue.audioPlayer.stop(true);
                break;
            case '🔇':
                queue.volume = queue.volume <= 0 ? DEFAULT_VOLUME : 0;
                queue.audioPlayer.state.resource.volume.setVolume(queue.volume / 100);
                queue.textSend(queue.volume ? `${user} 🔊 음소거를 해제했습니다.` : `${user} 🔇 노래를 음소거 했습니다.`);
                break;
            case '🔉':
                queue.volume = Math.max(queue.volume - 10, 0);
                queue.audioPlayer.state.resource.volume.setVolume(queue.volume / 100);
                queue.textSend(`${user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);
                break;
            case '🔊':
                queue.volume = Math.min(queue.volume + 10, 100);
                queue.audioPlayer.state.resource.volume.setVolume(queue.volume / 100);
                queue.textSend(`${user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);
                break;
            case '🔁':
                queue.loop = !queue.loop;
                queue.textSend(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
                break;
            case '⏹':
                queue.textSend(`${user} ⏹ 노래를 정지했습니다.`);
                queue.songs = [];
                try {
                    queue.audioPlayer.stop(true);
                } catch {
                    queue.connection.destroy();
                }
                break;
        }
    } catch {
        return queue.textSend('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
    }
};

module.exports.musicActiveControl = function (oldState, newState) {
    try {
        const oldVoice = oldState?.channel;
        const newVoice = newState?.channel;
        if (oldVoice?.id !== newVoice?.id) {
            console.log(!oldVoice ? 'User joined!' : !newVoice ? 'User left!' : 'User switched channels!');

            if (newVoice) {
                const newQueue = client.queues.get(newVoice.guild.id);
                if (newQueue?.audioPlayer.state.resource && !newQueue.playing && newVoice.id === newQueue.voiceChannel.id && newVoice.members.size === 2 && newVoice.members.has(client.user.id)) {
                    newQueue.playing = true;
                    newQueue.audioPlayer.unpause();
                    newQueue.textSend('대기열을 다시 재생합니다.');
                }
            }

            if (oldVoice) {
                const oldQueue = client.queues.get(oldVoice.guild.id);
                if (oldQueue?.audioPlayer.state.resource && oldVoice.id === oldQueue.voiceChannel.id && oldVoice.members.size === 1 && oldVoice.members.has(client.user.id)) {
                    // 봇만 음성 채널에 있는 경우
                    if (oldQueue.playing) {
                        oldQueue.playing = false;
                        oldQueue.audioPlayer.pause();
                        oldQueue.textSend('모든 사용자가 음성채널을 떠나서 대기열을 일시정지합니다.');
                    }
                    setTimeout(() => {
                        const queue = client.queues.get(oldVoice.guild.id);
                        if (queue?.audioPlayer.state.resource && oldVoice.id === queue.voiceChannel.id && oldVoice.members.size === 1 && oldVoice.members.has(client.user.id)) {
                            // 5분이 지나도 봇만 음성 채널에 있는 경우
                            queue.textSend(`5분 동안 ${client.user.username}이 비활성화 되어 대기열을 끝냅니다.`);
                            queue.songs = [];
                            try {
                                queue.audioPlayer.stop(true);
                            } catch {
                                queue.connection.destroy();
                            }
                        }
                    }, 300000);
                }
            }
        }
    } catch (e) {
        replyAdmin(`[oldState]\n${oldState?._p}\n[newState]\n${newState?._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
    }
};
