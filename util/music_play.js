const { createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { songDownload } = require('./song_util');
const { replyAdmin } = require('../admin/bot_control');
const { STAY_TIME, DEFAULT_VOLUME } = require('../soyabot_config.json');
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
                const channels = await this.textChannel.guild.channels.fetch(false);
                if (!channels.get(this.textChannel.id)) {
                    this.textChannel = channels.find((v) => v.type === 'text') ?? this.textChannel;
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
            if (!client.queues.get(guild.id) && queue.connection.state.status === 'ready') {
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
    } catch (e) {
        console.error(e);
        queue.songs.shift();
        queue.textSend(`오류 발생: ${e.message ?? e}`);
        return module.exports.play(queue);
    }

    queue.playingMessage = await queue.textSend(`🎶 노래 재생 시작: **${song.title}**\n${song.url}`);
    queue.audioPlayer.play(resource);
    queue.audioPlayer.state.resource.volume.setVolume(queue.volume / 100);
    queue.audioPlayer
        .on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle' && oldState.status !== 'idle') {
                // 재생 중인 노래가 끝난 경우
                queue.deleteMessage();
                queue.audioPlayer.removeAllListeners('stateChange');
                queue.audioPlayer.removeAllListeners('error');
                if (queue.loop) {
                    queue.songs.push(queue.songs.shift()); // 현재 노래를 대기열의 마지막에 다시 넣음 -> 루프 발생
                } else {
                    queue.songs.shift();
                }
                module.exports.play(queue); // 재귀적으로 다음 곡 재생
            }
        })
        .on('error', async (e) => {
            queue.deleteMessage();
            queue.audioPlayer.removeAllListeners('stateChange');
            queue.audioPlayer.removeAllListeners('error');
            queue.textSend('재생할 수 없는 동영상입니다.');
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
