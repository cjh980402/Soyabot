const { MessageEmbed } = require("discord.js");
const { play } = require("../include/play");
const { YOUTUBE_API_KEY, MAX_PLAYLIST_SIZE, SOUNDCLOUD_CLIENT_ID } = require("../config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const scdl = require("soundcloud-downloader")

module.exports = {
    usage: `${client.prefix}playlist <YouTube Playlist URL | Playlist Name>`,
    command: ["playlist", "pl"],
    description: "- 유튜브의 재생목록을 재생",
    type: ["음악"],
    async execute(message, args) {
        if (!message.guild) return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        const { PRUNING } = require("../config.json");
        const { channel } = message.member.voice;

        const serverQueue = message.client.queue.get(message.guild.id);
        if (serverQueue && channel !== message.guild.me.voice.channel)
            return message.reply(`같은 채널에 있어야합니다. (${message.client.user})`);

        if (!args.length)
            return message.channel.send(`**${this.usage}**\n- 대체 명령어 : ${this.command}\n${this.description}`);

        if (!channel) return message.reply("음성 채널에 먼저 참가해주세요!");

        const permissions = channel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT"))
            return message.reply("권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.");
        if (!permissions.has("SPEAK"))
            return message.reply("이 음성 채널에서 말을 할 수 없습니다. 적절한 권한이 있는지 확인해야합니다.");

        const search = args.join(" ");
        const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
        const url = args[0];
        const urlValid = pattern.test(args[0]);

        const queueConstruct = {
            textChannel: message.channel,
            channel,
            connection: null,
            songs: [],
            loop: false,
            volume: 100,
            playing: true
        };

        let song = null;
        let playlist = null;
        let videos = [];

        if (urlValid) {
            try {
                playlist = await youtube.getPlaylist(url, { part: "snippet" });
                videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
            } catch (error) {
                console.error(error);
                return message.reply("재생목록을 찾지 못했습니다 :(");
            }
        }
        else if (scdl.isValidUrl(args[0])) {
            if (args[0].includes('/sets/')) {
                message.channel.send('⌛ fetching the playlist...')
                playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID)
                videos = playlist.tracks.map(track => ({
                    title: track.title,
                    url: track.permalink_url,
                    duration: track.duration / 1000
                }))
            }
        }
        else {
            try {
                const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
                playlist = results[0];
                videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
            } catch (error) {
                console.error(error);
                return message.reply("재생목록을 찾지 못했습니다 :(");
            }
        }

        videos.forEach((video) => {
            song = {
                title: video.title,
                url: video.url,
                duration: video.durationSeconds
            };

            if (serverQueue) {
                serverQueue.songs.push(song);
                if (!PRUNING)
                    message.channel.send(`${message.author} ✅ **${song.title}**를 대기열에 추가하였습니다.`);
            } else {
                queueConstruct.songs.push(song);
            }
        });

        let playlistEmbed = new MessageEmbed()
            .setTitle(`${playlist.title}`)
            .setURL(playlist.url)
            .setColor("#F8AA2A")
            .setTimestamp();

        if (!PRUNING) {
            playlistEmbed.setDescription(queueConstruct.songs.map((song, index) => `${index + 1}. ${song.title}`));
            if (playlistEmbed.description.length >= 2048)
                playlistEmbed.description =
                    playlistEmbed.description.substr(0, 2007) + "\n재생목록이 글자수 제한보다 깁니다...";
        }

        message.channel.send(`${message.author}가 재생목록을 시작했습니다.`, playlistEmbed);

        if (!serverQueue) message.client.queue.set(message.guild.id, queueConstruct);

        if (!serverQueue) {
            try {
                queueConstruct.connection = await channel.join();
                await queueConstruct.connection.voice.setSelfDeaf(true);
                play(queueConstruct.songs[0], message);
            } catch (error) {
                console.error(error);
                message.client.queue.delete(message.guild.id);
                await channel.leave();
                return message.channel.send(`채널에 참가할 수 없습니다 : ${error}`);
            }
        }
    }
};
