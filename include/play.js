const ytdlDiscord = require("discord-ytdl-core");
const scdl = require("soundcloud-downloader").default;
const { sleep } = require('../admin/bot_control');
const { STAY_TIME, DEFAULT_VOLUME, SOUNDCLOUD_CLIENT_ID } = require("../soyabot_config.json");
const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    async play(song, guild) {
        const queue = client.queue.get(guild.me.voice.channel?.guild.id);

        if (!song) {
            client.queue.delete(guild.id);
            setTimeout(() => { // 종료 후 새로운 음악 기능이 수행 중이면 나가지 않음
                const newQueue = client.queue.get(guild.me.voice.channel?.guild.id);
                if (!newQueue && guild.voice.channel) {
                    guild.voice.channel.leave(); // 봇이 참가한 음성 채널을 떠남
                    queue.TextChannel.send(`${STAY_TIME}초가 지나서 음성 채널을 떠납니다.`);
                }
            }, STAY_TIME * 1000);
            return queue.TextChannel.send("❌ 음악 대기열이 끝났습니다.");
        }

        let stream = null, streamType = null;
        try {
            if (song.url.includes("youtube.com")) {
                streamType = "opus";
                stream = ytdlDiscord(song.url, {
                    filter: "audioonly",
                    quality: "highestaudio",
                    highWaterMark: 1 << 20, // 1MB, 기본값은 512KB
                    opusEncoded: true,
                    encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200']
                });
            }
            else if (song.url.includes("soundcloud.com")) {
                try {
                    streamType = "ogg/opus";
                    stream = await scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID);
                }
                catch (e) {
                    streamType = "unknown";
                    stream = await scdl.downloadFormat(song.url, scdl.FORMATS.MP3, SOUNDCLOUD_CLIENT_ID);
                }
            }
        }
        catch (e) {
            if (queue) {
                queue.songs.shift();
                module.exports.play(queue.songs[0], guild);
            }
            console.error(e);
            return queue.TextChannel.send(`오류 발생: ${e.message ?? e}`);
        }

        if (queue.connection.listenerCount("disconnect") == 0) { // 등록이 안 된 경우만 등록
            queue.connection.on("disconnect", () => client.queue.delete(guild.id));
        }

        let collector = null;
        queue.connection.play(stream, { type: streamType, volume: queue.volume / 100 })
            .on("finish", async () => {
                while (!collector) {
                    await sleep(500);
                }
                stream.destroy();
                collector.stop();
                if (queue.loop) {
                    // 루프가 켜져있다면 현재 노래를 대기열의 마지막에 다시 넣기때문에 대기열이 끝나지 않고 계속 재생됨
                    queue.songs.push(queue.songs.shift());
                }
                else {
                    queue.songs.shift();
                }
                module.exports.play(queue.songs[0], guild); // 재귀적으로 다음 곡 재생
            })
            .on("error", async (e) => {
                while (!collector) {
                    await sleep(500);
                }
                stream.destroy();
                collector.stop();
                if (e.message == "input stream: Video unavailable") {
                    queue.TextChannel.send("해당 국가에서 차단됐거나 비공개된 동영상입니다.");
                }
                else {
                    console.error(e);
                }
                queue.songs.shift();
                module.exports.play(queue.songs[0], guild);
            });

        const playingMessage = await queue.TextChannel.send(`🎶 노래 재생 시작: **${song.title}**\n${song.url}`);
        try {
            await playingMessage.react("⏯");
            await playingMessage.react("⏭");
            await playingMessage.react("🔇");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("🔁");
            await playingMessage.react("⏹");
        }
        catch (e) {
            queue.TextChannel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
        }

        const filter = (reaction, user) => user.id != client.user.id;
        collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });

        collector.on("collect", async (reaction, user) => {
            try {
                await reaction.users.remove(user);
                if (!queue?.connection.dispatcher) {
                    return collector.stop();
                }
                if (!canModifyQueue(guild.member(user))) {
                    return queue.TextChannel.send(`같은 음성 채널에 참가해주세요! (${client.user})`);
                }

                if (reaction.emoji.name == "⏯") {
                    if (queue.playing) {
                        queue.connection.dispatcher.pause(true);
                        queue.TextChannel.send(`${user} ⏸ 노래를 일시정지했습니다.`);
                    }
                    else {
                        queue.connection.dispatcher.resume();
                        queue.TextChannel.send(`${user} ▶️ 노래를 다시 틀었습니다.`);
                    }
                    queue.playing = !queue.playing;
                }
                else if (reaction.emoji.name == "⏭") {
                    queue.playing = true;
                    queue.connection.dispatcher.end();
                    queue.TextChannel.send(`${user} ⏭ 노래를 건너뛰었습니다.`);
                    collector.stop();
                }
                else if (reaction.emoji.name == "🔇") {
                    queue.volume = queue.volume <= 0 ? (DEFAULT_VOLUME ?? 100) : 0;
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.TextChannel.send(queue.volume ? `${user} 🔊 음소거를 해제했습니다.` : `${user} 🔇 노래를 음소거 했습니다.`);
                }
                else if (reaction.emoji.name == "🔉") {
                    queue.volume = Math.max(queue.volume - 10, 0);
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.TextChannel.send(`${user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);
                }
                else if (reaction.emoji.name == "🔊") {
                    queue.volume = Math.min(queue.volume + 10, 100);
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.TextChannel.send(`${user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);
                }
                else if (reaction.emoji.name == "🔁") {
                    queue.loop = !queue.loop;
                    queue.TextChannel.send(`현재 반복 재생 상태: ${queue.loop ? "**ON**" : "**OFF**"}`);
                }
                else if (reaction.emoji.name == "⏹") {
                    queue.songs = [];
                    queue.TextChannel.send(`${user} ⏹ 노래를 정지했습니다.`);
                    try {
                        queue.connection.dispatcher.end();
                    }
                    catch (e) {
                        console.error(e);
                        queue.connection.disconnect();
                    }
                    collector.stop();
                }
            }
            catch (e) {
                return queue.TextChannel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]**");
            }
        });

        collector.on("end", async () => {
            const find = await db.get("SELECT * FROM pruningskip WHERE channelid = ?", [guild.id]);
            if (!find && playingMessage && !playingMessage.deleted) {
                playingMessage.delete({ timeout: 1000 });
            }
        });
    }
};
