const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const { replyAdmin } = require('../admin/bot_control');
const { STAY_TIME, DEFAULT_VOLUME } = require('../soyabot_config.json');
const { canModifyQueue } = require('./soyabot_util');

module.exports.QueueElement = class {
    textChannel;
    voiceChannel;
    songs;
    connection = null;
    loop = false;
    volume = DEFAULT_VOLUME;
    playing = true;

    constructor(textChannel, voiceChannel, songs) {
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;
        this.songs = songs;
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

module.exports.play = async function (queue, guild) {
    const song = queue.songs[0];

    if (!song) {
        client.queues.delete(guild.id);
        setTimeout(() => {
            // 종료 후 새로운 음악 기능이 수행 중이면 나가지 않음
            const newQueue = client.queues.get(guild.id);
            if (!newQueue && guild.me.voice.channel) {
                guild.me.voice.channel.leave(); // 봇이 참가한 음성 채널을 떠남
                queue.textSend(`${STAY_TIME}초가 지나서 음성 채널을 떠납니다.`);
            }
        }, STAY_TIME * 1000);
        return queue.textSend('❌ 음악 대기열이 끝났습니다.');
    }

    let stream = null,
        streamType = null;
    try {
        if (song.url.includes('youtube.com')) {
            streamType = 'unknown';
            stream = ytdl(song.url, { filter: 'audio', quality: 'highestaudio' });
        } else if (song.url.includes('soundcloud.com')) {
            try {
                streamType = 'ogg/opus';
                stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS);
            } catch {
                streamType = 'unknown';
                stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3);
            }
        }
    } catch (e) {
        console.error(e);
        queue.songs.shift();
        queue.textSend(`오류 발생: ${e.message ?? e}`);
        return module.exports.play(queue, guild);
    }

    if (queue.connection.listenerCount('disconnect') === 1) {
        // 1개는 디스코드 내부에서 등록을 하기 때문에 개수를 확인
        queue.connection.once('disconnect', () => client.queues.delete(guild.id)); // 연결 끊기면 자동으로 큐를 삭제하는 리스너 등록
    }

    let collector = null;
    queue.connection
        .play(stream, { type: streamType, volume: queue.volume / 100 })
        .once('finish', async () => {
            while (!collector) {
                await sleep(500);
            }
            collector.stop();
            if (queue.loop) {
                queue.songs.push(queue.songs.shift()); // 현재 노래를 대기열의 마지막에 다시 넣음 -> 루프 발생
            } else {
                queue.songs.shift();
            }
            module.exports.play(queue, guild); // 재귀적으로 다음 곡 재생
        })
        .once('error', async (e) => {
            while (!collector) {
                await sleep(500);
            }
            collector.stop();
            queue.textSend('재생할 수 없는 동영상입니다.');
            replyAdmin(`노래 재생 에러\nsong 객체: ${song._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            queue.songs.shift();
            module.exports.play(queue, guild);
        });

    const playingMessage = await queue.textSend(`🎶 노래 재생 시작: **${song.title}**\n${song.url}`);
    try {
        await playingMessage.react('⏯');
        await playingMessage.react('⏭');
        await playingMessage.react('🔇');
        await playingMessage.react('🔉');
        await playingMessage.react('🔊');
        await playingMessage.react('🔁');
        await playingMessage.react('⏹');
    } catch {
        queue.textSend('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
    }

    const filter = (_, user) => user.id !== client.user.id;
    collector = playingMessage.createReactionCollector(filter, {
        time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on('collect', async (reaction, user) => {
        try {
            await reaction.users.remove(user);
            if (!queue?.connection.dispatcher) {
                return collector.stop();
            }
            if (!canModifyQueue(await guild.members.fetch(user.id, false))) {
                return queue.textSend(`${client.user}과 같은 음성 채널에 참가해주세요!`);
            }

            switch (reaction.emoji.name) {
                case '⏯':
                    queue.playing = !queue.playing;
                    if (queue.playing) {
                        queue.connection.dispatcher.resume();
                        queue.textSend(`${user} ▶️ 노래를 다시 틀었습니다.`);
                    } else {
                        queue.connection.dispatcher.pause(true);
                        queue.textSend(`${user} ⏸ 노래를 일시정지했습니다.`);
                    }
                    break;
                case '⏭':
                    queue.playing = true;
                    queue.connection.dispatcher.end();
                    queue.textSend(`${user} ⏭ 노래를 건너뛰었습니다.`);
                    collector.stop();
                    break;
                case '🔇':
                    queue.volume = queue.volume <= 0 ? DEFAULT_VOLUME : 0;
                    queue.connection.dispatcher.setVolume(queue.volume / 100);
                    queue.textSend(queue.volume ? `${user} 🔊 음소거를 해제했습니다.` : `${user} 🔇 노래를 음소거 했습니다.`);
                    break;
                case '🔉':
                    queue.volume = Math.max(queue.volume - 10, 0);
                    queue.connection.dispatcher.setVolume(queue.volume / 100);
                    queue.textSend(`${user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);
                    break;
                case '🔊':
                    queue.volume = Math.min(queue.volume + 10, 100);
                    queue.connection.dispatcher.setVolume(queue.volume / 100);
                    queue.textSend(`${user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);
                    break;
                case '🔁':
                    queue.loop = !queue.loop;
                    queue.textSend(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
                    break;
                case '⏹':
                    queue.songs = [];
                    queue.textSend(`${user} ⏹ 노래를 정지했습니다.`);
                    try {
                        queue.connection.dispatcher.end();
                    } catch {
                        queue.connection.disconnect();
                    }
                    collector.stop();
                    break;
            }
        } catch {
            return queue.textSend('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
        }
    });

    collector.once('end', async () => {
        const find = await db.get('SELECT * FROM pruningskip WHERE channelid = ?', [guild.id]);
        if (!find) {
            try {
                await playingMessage.delete();
            } catch {}
        }
    });
};
