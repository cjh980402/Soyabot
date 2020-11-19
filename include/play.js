const ytdlDiscord = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader");
const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    async play(song, message) {
        const { PRUNING, SOUNDCLOUD_CLIENT_ID } = require("../config.json");
        const queue = client.queue.get(message.guild.id);

        if (!song) {
            queue.channel.leave();
            client.queue.delete(message.guild.id);
            return queue.textChannel.send("❌ 음악 대기열이 끝났습니다.");
        }

        let stream = null;
        let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

        try {
            if (song.url.includes("youtube.com")) {
                stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
            }
            else if (song.url.includes("soundcloud.com")) {
                try {
                    stream = await scdl.downloadFormat(
                        song.url,
                        scdl.FORMATS.OPUS,
                        SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
                    );
                }
                catch (error) {
                    stream = await scdl.downloadFormat(
                        song.url,
                        scdl.FORMATS.MP3,
                        SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
                    );
                    streamType = "unknown";
                }
            }
        }
        catch (error) {
            if (queue) {
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }

            console.error(error);
            return message.channel.send(`오류 발생: ${error.message ? error.message : error}`);
        }

        queue.connection.on("disconnect", () => client.queue.delete(message.guild.id));

        const dispatcher = queue.connection
            .play(stream, { type: streamType })
            .on("finish", () => {
                if (collector && !collector.ended) {
                    collector.stop();
                }

                if (queue.loop) {
                    // if loop is on, push the song back at the end of the queue
                    // so it can repeat endlessly
                    let lastSong = queue.songs.shift();
                    queue.songs.push(lastSong);
                    module.exports.play(queue.songs[0], message);
                }
                else {
                    // Recursively play the next song
                    queue.songs.shift();
                    module.exports.play(queue.songs[0], message);
                }
            })
            .on("error", (err) => {
                console.error(err);
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            });
        dispatcher.setVolumeLogarithmic(queue.volume / 100);

        try {
            var playingMessage = await queue.textChannel.send(`🎶 노래 재생 시작: **${song.title}** ${song.url}`);
            await playingMessage.react("⏯");
            await playingMessage.react("⏭");
            await playingMessage.react("🔇");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("🔁");
            await playingMessage.react("⏹");
        }
        catch (error) {
            console.error(error);
        }

        const filter = (reaction, user) => user.id !== client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });

        collector.on("collect", (reaction, user) => {
            if (!queue) {
                return;
            }
            if (!queue.connection.dispatcher) {
                return collector.stop();
            }

            const member = message.guild.member(user);

            switch (reaction.emoji.name) {
                case "⏯":
                    reaction.users.remove(user);
                    if (!canModifyQueue(member)) {
                        return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                    }
                    if (queue.playing) {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.pause(true);
                        queue.textChannel.send(`${user} ⏸ 노래를 일시정지했습니다.`);
                    }
                    else {
                        queue.playing = !queue.playing;
                        if (queue.connection.dispatcher) {
                            queue.connection.dispatcher.resume();
                        }
                        queue.textChannel.send(`${user} ▶ 노래를 다시 틀었습니다.`);
                    }
                    break;

                case "⏭":
                    queue.playing = true;
                    reaction.users.remove(user);
                    if (!canModifyQueue(member)) {
                        return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                    }
                    queue.connection.dispatcher.end();
                    queue.textChannel.send(`${user} ⏭ 노래를 건너뛰었습니다.`);
                    collector.stop();
                    break;

                case "🔇":
                    reaction.users.remove(user);
                    if (!canModifyQueue(member)) {
                        return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                    }
                    if (queue.volume <= 0) {
                        queue.volume = 100;
                        queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
                        queue.textChannel.send(`${user} 🔊 음소거를 해제했습니다.`);
                    }
                    else {
                        queue.volume = 0;
                        queue.connection.dispatcher.setVolumeLogarithmic(0);
                        queue.textChannel.send(`${user} 🔇 노래를 음소거 했습니다.`);
                    }
                    break;

                case "🔉":
                    reaction.users.remove(user);
                    if (!canModifyQueue(member)) {
                        return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                    }
                    if (queue.volume - 10 <= 0) {
                        queue.volume = 0;
                    }
                    else {
                        queue.volume = queue.volume - 10;
                    }
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel.send(`${user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);
                    break;

                case "🔊":
                    reaction.users.remove(user);
                    if (!canModifyQueue(member)) {
                        return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                    }
                    if (queue.volume + 10 >= 100) {
                        queue.volume = 100;
                    }
                    else {
                        queue.volume = queue.volume + 10;
                    }
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel.send(`${user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);
                    break;

                case "🔁":
                    reaction.users.remove(user);
                    if (!canModifyQueue(member)) {
                        return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                    }
                    queue.loop = !queue.loop;
                    queue.textChannel.send(`현재 반복 재생 상태 : ${queue.loop ? "**ON**" : "**OFF**"}`);
                    break;

                case "⏹":
                    reaction.users.remove(user);
                    if (!canModifyQueue(member)) {
                        return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                    }
                    queue.songs = [];
                    queue.textChannel.send(`${user} ⏹ 노래를 정지했습니다.`);
                    try {
                        queue.connection.dispatcher.end();
                    }
                    catch (error) {
                        console.error(error);
                        queue.connection.disconnect();
                    }
                    collector.stop();
                    break;

                default:
                    reaction.users.remove(user);
                    break;
            }
        });

        collector.on("end", () => {
            playingMessage.reactions.removeAll();
            if (PRUNING && playingMessage && !playingMessage.deleted) {
                playingMessage.delete({ timeout: 3000 });
            }
        });
    }
};
