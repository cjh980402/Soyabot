const ytdl = require('ytdl-core');
const scdl = require('soundcloud-downloader').default;
const { replyAdmin } = require('../admin/bot_control');
const { STAY_TIME, DEFAULT_VOLUME } = require('../soyabot_config.json');
const { canModifyQueue } = require('./SoyabotUtil');

module.exports.QueueElement = class {
    #textChannel;
    channel;
    songs;
    connection = null;
    loop = false;
    volume = DEFAULT_VOLUME ?? 100;
    playing = true;

    constructor(textChannel, voiceChannel, songs) {
        this.#textChannel = textChannel;
        this.channel = voiceChannel;
        this.songs = songs;
    }

    get textChannel() {
        if (!client.channels.cache.get(this.#textChannel.id)) {
            // 해당하는 채널이 삭제된 경우
            this.#textChannel = this.#textChannel.guild.channels.cache.find((v) => v.type == 'text');
        }
        return this.#textChannel;
    }

    set textChannel(value) {
        if (client.channels.cache.get(value.id)) {
            // 해당하는 채널이 존재하는 경우
            this.#textChannel = value;
        }
    }
};

module.exports.play = async function (song, guild) {
    const queue = client.queue.get(guild.id);

    if (!song) {
        client.queue.delete(guild.id);
        setTimeout(() => {
            // 종료 후 새로운 음악 기능이 수행 중이면 나가지 않음
            const newQueue = client.queue.get(guild.id);
            if (!newQueue && guild.me.voice.channel) {
                guild.me.voice.channel.leave(); // 봇이 참가한 음성 채널을 떠남
                queue.textChannel.send(`${STAY_TIME}초가 지나서 음성 채널을 떠납니다.`);
            }
        }, STAY_TIME * 1000);
        return queue.textChannel.send('❌ 음악 대기열이 끝났습니다.');
    }

    let stream = null,
        streamType = null;
    try {
        if (song.url.includes('youtube.com')) {
            streamType = 'unknown';
            stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
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
        if (queue) {
            queue.songs.shift();
            module.exports.play(queue.songs[0], guild);
        }
        console.error(e);
        return queue.textChannel.send(`오류 발생: ${e.message ?? e}`);
    }

    if (queue.connection.listenerCount('disconnect') == 1) {
        // 1개는 기본적으로 디스코드 내부에서 등록이 되어있기 때문
        queue.connection.once('disconnect', () => client.queue.delete(guild.id)); // 연결 끊기면 자동으로 큐를 삭제하는 리스너 등록
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
            module.exports.play(queue.songs[0], guild); // 재귀적으로 다음 곡 재생
        })
        .once('error', async (e) => {
            while (!collector) {
                await sleep(500);
            }
            collector.stop();
            queue.textChannel.send(e.message.startsWith('input stream') ? '재생할 수 없는 동영상입니다.' : '에러로그가 전송되었습니다.');
            replyAdmin(`노래 재생 에러\nsong 객체: ${song._p}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            queue.songs.shift();
            module.exports.play(queue.songs[0], guild);
        });

    const playingMessage = await queue.textChannel.send(`🎶 노래 재생 시작: **${song.title}**\n${song.url}`);
    try {
        await playingMessage.react('⏯');
        await playingMessage.react('⏭');
        await playingMessage.react('🔇');
        await playingMessage.react('🔉');
        await playingMessage.react('🔊');
        await playingMessage.react('🔁');
        await playingMessage.react('⏹');
    } catch {
        queue.textChannel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
    }

    const filter = (reaction, user) => user.id != client.user.id;
    collector = playingMessage.createReactionCollector(filter, {
        time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on('collect', async (reaction, user) => {
        try {
            await reaction.users.remove(user);
            if (!queue?.connection.dispatcher) {
                return collector.stop();
            }
            if (!canModifyQueue(guild.member(user))) {
                return queue.textChannel.send(`같은 음성 채널에 참가해주세요! (${client.user})`);
            }

            switch (reaction.emoji.name) {
                case '⏯':
                    queue.playing = !queue.playing;
                    if (queue.playing) {
                        queue.connection.dispatcher.resume();
                        queue.textChannel.send(`${user} ▶️ 노래를 다시 틀었습니다.`);
                    } else {
                        queue.connection.dispatcher.pause(true);
                        queue.textChannel.send(`${user} ⏸ 노래를 일시정지했습니다.`);
                    }
                    break;
                case '⏭':
                    queue.playing = true;
                    queue.connection.dispatcher.end();
                    queue.textChannel.send(`${user} ⏭ 노래를 건너뛰었습니다.`);
                    collector.stop();
                    break;
                case '🔇':
                    queue.volume = queue.volume <= 0 ? DEFAULT_VOLUME ?? 100 : 0;
                    queue.connection.dispatcher.setVolume(queue.volume / 100);
                    queue.textChannel.send(queue.volume ? `${user} 🔊 음소거를 해제했습니다.` : `${user} 🔇 노래를 음소거 했습니다.`);
                    break;
                case '🔉':
                    queue.volume = Math.max(queue.volume - 10, 0);
                    queue.connection.dispatcher.setVolume(queue.volume / 100);
                    queue.textChannel.send(`${user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);
                    break;
                case '🔊':
                    queue.volume = Math.min(queue.volume + 10, 100);
                    queue.connection.dispatcher.setVolume(queue.volume / 100);
                    queue.textChannel.send(`${user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);
                    break;
                case '🔁':
                    queue.loop = !queue.loop;
                    queue.textChannel.send(`현재 반복 재생 상태: ${queue.loop ? '**ON**' : '**OFF**'}`);
                    break;
                case '⏹':
                    queue.songs = [];
                    queue.textChannel.send(`${user} ⏹ 노래를 정지했습니다.`);
                    try {
                        queue.connection.dispatcher.end();
                    } catch (e) {
                        console.error(e);
                        queue.connection.disconnect();
                    }
                    collector.stop();
                    break;
            }
        } catch {
            return queue.textChannel.send('**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**');
        }
    });

    collector.once('end', async () => {
        collector.removeAllListeners('collect');
        const find = await db.get('SELECT * FROM pruningskip WHERE channelid = ?', [guild.id]);
        if (!find && playingMessage && !playingMessage.deleted) {
            playingMessage.delete({ timeout: 1000 });
        }
    });
};
