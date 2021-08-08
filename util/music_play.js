const { AudioPlayerStatus, createAudioPlayer } = require('@discordjs/voice');
const { songDownload } = require('./song_util');
const { replyAdmin } = require('../admin/bot_control');
const { DEFAULT_VOLUME } = require('../soyabot_config.json');
const { canModifyQueue } = require('./soyabot_util');

module.exports.QueueElement = class {
    textChannel;
    voiceChannel;
    subscription;
    songs;
    volume = DEFAULT_VOLUME;
    loop = false;
    playing = true;
    playingMessage = null;

    constructor(textChannel, voiceChannel, connection, songs) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.subscription = connection.subscribe(createAudioPlayer());
        this.songs = songs;

        connection.removeAllListeners('error');
        connection.removeAllListeners('destroyed');
        connection.removeAllListeners('disconnected');

        connection
            .once('error', () => connection.destroy())
            .once('destroyed', () => this.clearStop())
            .once('disconnected', () => this.clearStop());

        this.subscription.player
            .on(AudioPlayerStatus.Idle, async () => {
                await this.deleteMessage();
                if (this.loop) {
                    this.songs.push(this.songs.shift()); // 현재 노래를 대기열의 마지막에 다시 넣어서 루프 구현
                } else {
                    this.songs.shift();
                }
                this.playSong();
            })
            .on('error', (e) => {
                this.textSend('노래 재생에 실패했습니다.');
                replyAdmin(`노래 재생 에러\nsong 객체: ${this.songs[0]._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            });
    }

    clearStop() {
        client.queues.delete(this.voiceChannel.guild.id);
        this.subscription.unsubscribe();
        this.songs = [];
        this.subscription.player.stop(true);
    }

    async playSong() {
        if (!this.songs[0]) {
            this.clearStop();
            this.subscription.connection.destroy();
            return this.textSend('❌ 음악 대기열이 끝났습니다.');
        }

        try {
            this.playingMessage = await this.textSend(`🎶 노래 재생 시작: **${this.songs[0].title}**\n${this.songs[0].url}`);
            this.subscription.player.play(await songDownload(this.songs[0].url));
            this.subscription.player.state.resource.volume.setVolume(this.volume / 100);
        } catch (e) {
            this.textSend('노래 재생에 실패했습니다.');
            replyAdmin(`노래 재생 에러\nsong 객체: ${this.songs[0]._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            this.songs.shift();
            return this.playSong();
        }

        try {
            await this.playingMessage?.react('⏯');
            await this.playingMessage?.react('⏭');
            await this.playingMessage?.react('🔇');
            await this.playingMessage?.react('🔉');
            await this.playingMessage?.react('🔊');
            await this.playingMessage?.react('🔁');
            await this.playingMessage?.react('⏹');
        } catch {}
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
        const find = await db.get('SELECT * FROM pruningskip WHERE channelid = ?', [this.playingMessage?.guildId]);
        if (!find) {
            try {
                await this.playingMessage?.delete();
            } catch {}
        }
        this.playingMessage = null;
    }
};

module.exports.musicReactionControl = async function (reaction, user) {
    const { guild } = reaction.message.channel;
    const queue = client.queues.get(guild?.id);
    try {
        if (user.bot || queue?.playingMessage?.id !== reaction.message.id || !queue.subscription.player.state.resource) {
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
                    queue.subscription.player.unpause();
                    queue.textSend(`${user} ▶️ 노래를 다시 틀었습니다.`);
                } else {
                    queue.subscription.player.pause();
                    queue.textSend(`${user} ⏸ 노래를 일시정지 했습니다.`);
                }
                break;
            case '⏭':
                queue.textSend(`${user} ⏭ 노래를 건너뛰었습니다.`);
                queue.playing = true;
                queue.subscription.player.stop();
                break;
            case '🔇':
                queue.volume = queue.volume <= 0 ? DEFAULT_VOLUME : 0;
                queue.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
                queue.textSend(queue.volume ? `${user} 🔊 음소거를 해제했습니다.` : `${user} 🔇 노래를 음소거 했습니다.`);
                break;
            case '🔉':
                queue.volume = Math.max(queue.volume - 10, 0);
                queue.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
                queue.textSend(`${user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);
                break;
            case '🔊':
                queue.volume = Math.min(queue.volume + 10, 100);
                queue.subscription.player.state.resource.volume.setVolume(queue.volume / 100);
                queue.textSend(`${user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);
                break;
            case '🔁':
                queue.loop = !queue.loop;
                queue.textSend(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
                break;
            case '⏹':
                queue.textSend(`${user} ⏹ 노래를 정지했습니다.`);
                queue.clearStop();
                break;
        }
    } catch {
        return queue.textSend('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
    }
};

module.exports.musicActiveControl = function (oldState, newState) {
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
                    newQueue.playing = true;
                    newQueue.subscription.player.unpause();
                    newQueue.textSend('대기열을 다시 재생합니다.');
                }
            }

            if (oldVoice) {
                const oldQueue = client.queues.get(oldVoice.guild.id);
                if (oldQueue?.subscription.player.state.resource && oldVoice.id === oldQueue.voiceChannel.id && oldVoice.members.size === 1 && oldVoice.members.has(client.user.id)) {
                    // 봇만 음성 채널에 있는 경우
                    if (oldQueue.playing) {
                        oldQueue.playing = false;
                        oldQueue.subscription.player.pause();
                        oldQueue.textSend('모든 사용자가 음성채널을 떠나서 대기열을 일시정지합니다.');
                    }
                    setTimeout(() => {
                        const queue = client.queues.get(oldVoice.guild.id);
                        if (queue?.subscription.player.state.resource && oldVoice.id === queue.voiceChannel.id && oldVoice.members.size === 1 && oldVoice.members.has(client.user.id)) {
                            // 5분이 지나도 봇만 음성 채널에 있는 경우
                            queue.textSend(`5분 동안 ${client.user.username}이 비활성화 되어 대기열을 끝냅니다.`);
                            queue.clearStop();
                        }
                    }, 300000);
                }
            }
        }
    } catch (e) {
        replyAdmin(`[oldState]\n${oldState._p}\n[newState]\n${newState._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
    }
};
