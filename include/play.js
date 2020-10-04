const ytdlDiscord = require("ytdl-core-discord");
const scdl = require("soundcloud-downloader");
const { canModifyQueue } = require("../util/SoyabotUtil");

module.exports = {
    async play(song, message) {
        const { PRUNING, SOUNDCLOUD_CLIENT_ID } = require("../config.json");
        const queue = message.client.queue.get(message.guild.id);

        if (!song) {
            queue.channel.leave();
            message.client.queue.delete(message.guild.id);
            return queue.textChannel.send("🚫 음악 대기열이 끝났습니다.").catch(console.error);
        }

        let stream = null;
        let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

        try {
            if (song.url.includes("youtube.com")) {
                stream = await ytdlDiscord(song.url, { highWaterMark: 1 << 25 });
            } else if (song.url.includes("soundcloud.com")) {
                try {
                    stream = await scdl.downloadFormat(
                        song.url,
                        scdl.FORMATS.OPUS,
                        SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
                    );
                } catch (error) {
                    stream = await scdl.downloadFormat(
                        song.url,
                        scdl.FORMATS.MP3,
                        SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
                    );
                    streamType = "unknown";
                }
            }
        } catch (error) {
            if (queue) {
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }

            console.error(error);
            return message.channel.send(`오류 발생 : ${error.message ? error.message : error}`);
        }

        queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

        const dispatcher = queue.connection
            .play(stream, { type: streamType })
            .on("finish", () => {
                if (collector && !collector.ended) collector.stop();

                if (queue.loop) {
                    // if loop is on, push the song back at the end of the queue
                    // so it can repeat endlessly
                    let lastSong = queue.songs.shift();
                    queue.songs.push(lastSong);
                    module.exports.play(queue.songs[0], message);
                } else {
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
            var playingMessage = await queue.textChannel.send(`🎶 노래 재생 시작 : **${song.title}** ${song.url}`);
            await playingMessage.react("⏭");
            await playingMessage.react("⏯");
            await playingMessage.react("🔇");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("🔁");
            await playingMessage.react("⏹");
        } catch (error) {
            console.error(error);
        }

        const filter = (reaction, user) => user.id !== message.client.user.id;
        var collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });
        queue.collector = collector;

        collector.on("collect", (reaction, user) => {
            if (!queue) return;
            const member = message.guild.member(user);

            switch (reaction.emoji.name) {
                case "⏭":
                    queue.playing = true;
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    queue.connection.dispatcher.end();
                    queue.textChannel.send(`${user} ⏭ 노래를 건너뛰었습니다.`).catch(console.error);
                    collector.stop();
                    break;

                case "⏯":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    if (queue.playing) {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.pause(true);
                        queue.textChannel.send(`${user} ⏸ 노래를 일시정지했습니다.`).catch(console.error);
                    } else {
                        queue.playing = !queue.playing;
                        queue.connection.dispatcher.resume();
                        queue.textChannel.send(`${user} ▶ 노래를 다시 틀었습니다.`).catch(console.error);
                    }
                    break;

                case "🔇":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    if (queue.volume <= 0) {
                        queue.volume = 100;
                        queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
                        queue.textChannel.send(`${user} 🔊 음소거를 해제했습니다.`).catch(console.error);
                    } else {
                        queue.volume = 0;
                        queue.connection.dispatcher.setVolumeLogarithmic(0);
                        queue.textChannel.send(`${user} 🔇 노래를 음소거 했습니다.`).catch(console.error);
                    }
                    break;

                case "🔉":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    if (queue.volume - 10 <= 0) queue.volume = 0;
                    else queue.volume = queue.volume - 10;
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel
                        .send(`${user} 🔉 음량을 낮췄습니다. 현재 음량 : ${queue.volume}%`)
                        .catch(console.error);
                    break;

                case "🔊":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    if (queue.volume + 10 >= 100) queue.volume = 100;
                    else queue.volume = queue.volume + 10;
                    queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                    queue.textChannel
                        .send(`${user} 🔊 음량을 높였습니다. 현재 음량 : ${queue.volume}%`)
                        .catch(console.error);
                    break;

                case "🔁":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    queue.loop = !queue.loop;
                    queue.textChannel.send(`현재 반복 재생 상태 : ${queue.loop ? "**켜짐**" : "**꺼짐**"}`).catch(console.error);
                    break;

                case "⏹":
                    reaction.users.remove(user).catch(console.error);
                    if (!canModifyQueue(member)) return;
                    queue.songs = [];
                    queue.textChannel.send(`${user} ⏹ 노래를 정지했습니다.`).catch(console.error);
                    try {
                        queue.connection.dispatcher.end();
                    } catch (error) {
                        console.error(error);
                        queue.connection.disconnect();
                    }
                    collector.stop();
                    break;

                default:
                    reaction.users.remove(user).catch(console.error);
                    break;
            }
        });

        collector.on("end", () => {
            playingMessage.reactions.removeAll().catch(console.error);
            if (PRUNING && playingMessage && !playingMessage.deleted) {
                playingMessage.delete({ timeout: 3000 }).catch(console.error);
            }
        });
    }
};
