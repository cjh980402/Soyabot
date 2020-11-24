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
                catch (e) {
                    stream = await scdl.downloadFormat(
                        song.url,
                        scdl.FORMATS.MP3,
                        SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined
                    );
                    streamType = "unknown";
                }
            }
        }
        catch (e) {
            if (queue) {
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            }
            console.error(e);
            return message.channel.send(`오류 발생: ${e.message || e}`);
        }

        queue.connection.on("disconnect", () => client.queue.delete(message.guild.id));

        const dispatcher = queue.connection
            .play(stream, { type: streamType })
            .on("finish", () => {
                if (collector && !collector.ended) {
                    collector.stop();
                }

                if (queue.loop) {
                    // 루프가 켜져있다면 현재 노래를 대기열의 마지막에 다시 넣기때문에 대기열이 끝나지 않고 계속 재생됨
                    queue.songs.push(queue.songs.shift());
                }
                else {
                    queue.songs.shift();
                }
                module.exports.play(queue.songs[0], message); // 재귀적으로 다음 곡 재생
            })
            .on("error", (err) => {
                console.error(err);
                queue.songs.shift();
                module.exports.play(queue.songs[0], message);
            });
        dispatcher.setVolumeLogarithmic(queue.volume / 100);

        let playingMessage;
        try {
            playingMessage = await queue.textChannel.send(`🎶 노래 재생 시작: **${song.title}** ${song.url}`);
            await playingMessage.react("⏯");
            await playingMessage.react("⏭");
            await playingMessage.react("🔇");
            await playingMessage.react("🔉");
            await playingMessage.react("🔊");
            await playingMessage.react("🔁");
            await playingMessage.react("⏹");
        }
        catch (e) {
            message.channel.send("**권한이 없습니다 - [ADD_REACTIONS, MANAGE_MESSAGES]!**");
        }

        const filter = (reaction, user) => user.id !== client.user.id;
        const collector = playingMessage.createReactionCollector(filter, {
            time: song.duration > 0 ? song.duration * 1000 : 600000
        });

        collector.on("collect", async (reaction, user) => {
            if (!queue) {
                return;
            }
            if (!queue.connection.dispatcher) {
                return collector.stop();
            }

            const member = message.guild.member(user);

            if (reaction.emoji.name === "⏯") {
                if (!canModifyQueue(member)) {
                    return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                }
                if (queue.playing) {
                    queue.connection.dispatcher.pause(true);
                    queue.textChannel.send(`${user} ⏸ 노래를 일시정지했습니다.`);
                }
                else {
                    queue.connection.dispatcher.resume();
                    queue.textChannel.send(`${user} ▶ 노래를 다시 틀었습니다.`);
                }
                queue.playing = !queue.playing;
            }
            else if (reaction.emoji.name === "⏭") {
                queue.playing = true;
                if (!canModifyQueue(member)) {
                    return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                }
                queue.connection.dispatcher.end();
                queue.textChannel.send(`${user} ⏭ 노래를 건너뛰었습니다.`);
                collector.stop();
            }
            else if (reaction.emoji.name === "🔇") {
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
            }
            else if (reaction.emoji.name === "🔉") {
                if (!canModifyQueue(member)) {
                    return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                }
                queue.volume = Math.max(queue.volume - 10, 0);
                queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                queue.textChannel.send(`${user} 🔉 음량을 낮췄습니다. 현재 음량: ${queue.volume}%`);
            }
            else if (reaction.emoji.name === "🔊") {
                if (!canModifyQueue(member)) {
                    return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                }
                queue.volume = Math.min(queue.volume + 10, 100);
                queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
                queue.textChannel.send(`${user} 🔊 음량을 높였습니다. 현재 음량: ${queue.volume}%`);
            }
            else if (reaction.emoji.name === "🔁") {
                if (!canModifyQueue(member)) {
                    return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                }
                queue.loop = !queue.loop;
                queue.textChannel.send(`현재 반복 재생 상태 : ${queue.loop ? "**ON**" : "**OFF**"}`);
            }
            else if (reaction.emoji.name === "⏹") {
                if (!canModifyQueue(member)) {
                    return queue.textChannel.send("음성 채널에 먼저 참가해주세요!");;
                }
                queue.songs = [];
                queue.textChannel.send(`${user} ⏹ 노래를 정지했습니다.`);
                try {
                    queue.connection.dispatcher.end();
                }
                catch (e) {
                    console.error(e);
                    queue.connection.disconnect();
                }
                collector.stop();
            }
            await reaction.users.remove(user);
        });

        collector.on("end", () => {
            playingMessage.reactions.removeAll();
            if (PRUNING && playingMessage && !playingMessage.deleted) {
                playingMessage.delete({ timeout: 3000 });
            }
        });
    }
};
