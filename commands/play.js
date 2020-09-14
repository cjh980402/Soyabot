const { play } = require("../include/play");
const { YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID } = require("../config.json");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const scdl = require("soundcloud-downloader");

module.exports = {
    name: "play",
    cooldown: 3,
    aliases: ["p"],
    description: "YouTube나 Soundcloud를 통해 노래를 재생",
    type: ["음악"],
    async execute(message, args) {
        if (!message.guild) return message.reply("사용이 불가능한 채널입니다.").catch(console.error); // 그룹톡 여부 체크
        const { channel } = message.member.voice;

        const serverQueue = message.client.queue.get(message.guild.id);
        if (!channel) return message.reply("음성 채널에 먼저 참가해주세요!").catch(console.error);
        if (serverQueue && channel !== message.guild.me.voice.channel)
            return message.reply(`같은 채널에 있어야합니다. (${message.client.user})`).catch(console.error);

        if (!args.length)
            return message
                .reply(`사용법 : ${message.client.prefix}play <YouTube URL | Video Name | Soundcloud URL>`)
                .catch(console.error);

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT"))
            return message.reply("권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.");
        if (!permissions.has("SPEAK"))
            return message.reply("이 음성 채널에서 말을 할 수 없습니다. 적절한 권한이 있는지 확인해야합니다.");

        const search = args.join(" ");
        const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
        const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
        const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
        const url = args[0];
        const urlValid = videoPattern.test(args[0]);

        // Start the playlist if playlist url was provided
        if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
            return message.client.commands.get("playlist").execute(message, args);
        }
        else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
            return message.client.commands.get("playlist").execute(message, args);
        }

        const queueConstruct = {
            textChannel: message.channel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: 100,
            playing: true
        };

        let songInfo = null;
        let song = null;

        if (urlValid) {
            try {
                songInfo = await ytdl.getInfo(url);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    duration: songInfo.videoDetails.lengthSeconds
                };
            } catch (error) {
                console.error(error);
                return message.reply(error.message).catch(console.error);
            }
        } else if (scRegex.test(url)) {
            try {
                const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
                song = {
                    title: trackInfo.title,
                    url: trackInfo.permalink_url,
                    duration: Math.ceil(trackInfo.duration / 1000)
                };
            } catch (error) {
                if (error.statusCode === 404)
                    return message.reply("해당하는 Soundcloud 트랙을 찾지 못했습니다.").catch(console.error);
                return message.reply("Soundcloud 트랙을 재생하는 중 에러가 발생하였습니다.").catch(console.error);
            }
        } else {
            try {
                const results = await youtube.searchVideos(search, 1);
                songInfo = await ytdl.getInfo(results[0].url);
                song = {
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url,
                    duration: songInfo.videoDetails.lengthSeconds
                };
            } catch (error) {
                console.error(error);
                return message.reply("해당 제목에 맞는 비디오를 찾지 못했습니다.").catch(console.error);
            }
        }

        if (serverQueue) {
            serverQueue.songs.push(song);
            return serverQueue.textChannel
                .send(`✅ ${message.author}가 **${song.title}**를 대기열에 추가하였습니다.`)
                .catch(console.error);
        }

        queueConstruct.songs.push(song);
        message.client.queue.set(message.guild.id, queueConstruct);

        try {
            queueConstruct.connection = await channel.join();
            await queueConstruct.connection.voice.setSelfDeaf(true);
            play(queueConstruct.songs[0], message);
        } catch (error) {
            console.error(error);
            message.client.queue.delete(message.guild.id);
            await channel.leave();
            return message.channel.send(`채널에 참가할 수 없습니다 : ${error}`).catch(console.error);
        }
    }
};
