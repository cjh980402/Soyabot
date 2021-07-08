const { createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const { songDownload } = require('./song_util');
const { replyAdmin } = require('../admin/bot_control');
const { STAY_TIME, DEFAULT_VOLUME } = require('../soyabot_config.json');
const { canModifyQueue } = require('./soyabot_util');

module.exports.QueueElement = class {
    textChannel;
    voiceChannel;
    connection;
    songs;
    audioPlayer = createAudioPlayer();
    loop = false;
    volume = DEFAULT_VOLUME;
    playing = true;

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
};

module.exports.play = async function (queue) {
    const song = queue.songs[0];
    const { guild } = queue.voiceChannel;

    if (!song) {
        client.queues.delete(guild.id);
        setTimeout(() => {
            // 종료 후 새로운 음악 기능이 수행 중이지 않으면 나감
            if (!client.queues.get(guild.id) && queue.connection.state.status === 'ready') {
                queue.connection.destroy();
                queue.textSend(`${STAY_TIME}초가 지나서 음성 채널을 떠납니다.`);
            }
        }, STAY_TIME * 1000);
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

    const playingMessage = await queue.textSend(`🎶 노래 재생 시작: **${song.title}**\n${song.url}`);
    const filter = (_, user) => user.id !== client.user.id;
    const collector = playingMessage?.createReactionCollector({ filter, time: song.duration > 0 ? song.duration * 1000 : 600000 }).once('end', async () => {
        const find = await db.get('SELECT * FROM pruningskip WHERE channelid = ?', [guild.id]);
        if (!find) {
            try {
                await playingMessage.delete();
            } catch {}
        }
    });

    queue.audioPlayer.play(resource);
    queue.audioPlayer.state.resource.volume.setVolume(queue.volume / 100);
    queue.audioPlayer
        .on('stateChange', (oldState, newState) => {
            if (newState.status === 'idle' && oldState.status !== 'idle') {
                // 재생 중인 노래가 끝난 경우
                collector?.stop();
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
            collector?.stop();
            queue.audioPlayer.removeAllListeners('stateChange');
            queue.audioPlayer.removeAllListeners('error');
            queue.textSend('재생할 수 없는 동영상입니다.');
            replyAdmin(`노래 재생 에러\nsong 객체: ${song._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            queue.songs.shift();
            module.exports.play(queue);
        });

    try {
        await playingMessage.react('⏯');
        await playingMessage.react('⏭');
        await playingMessage.react('🔇');
        await playingMessage.react('🔉');
        await playingMessage.react('🔊');
        await playingMessage.react('🔁');
        await playingMessage.react('⏹');
    } catch {
        return; // 에러 발생 시 종료
    }

    collector.on('collect', async (reaction, user) => {
        try {
            await reaction.users.remove(user);
            if (queue.audioPlayer.state.status === 'idle' || queue.connection.state.status !== 'ready') {
                return collector.stop();
            }
            if (!canModifyQueue(await guild.members.fetch(user.id, false))) {
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
    });
};
