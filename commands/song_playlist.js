const { MessageEmbed } = require("discord.js");
const { play } = require("../include/play");
const { YOUTUBE_API_KEY, MAX_PLAYLIST_SIZE, SOUNDCLOUD_CLIENT_ID } = require("../config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const scdl = require("soundcloud-downloader");

module.exports = {
    usage: `${client.prefix}playlist (YouTube 재생목록 주소 | 재생목록 제목)`,
    command: ["playlist", "pl"],
    description: "- 유튜브의 재생목록을 재생합니다.",
    type: ["음악"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        const { PRUNING } = require("../config.json");
        const { channel } = message.member.voice;

        const serverQueue = client.queue.get(message.guild.id);
        if (serverQueue && channel !== message.guild.me.voice.channel) {
            return message.reply(`같은 채널에 있어야합니다. (${client.user})`);
        }

        if (!args.length) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        if (!channel) {
            return message.reply("음성 채널에 먼저 참가해주세요!");
        }

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has("CONNECT")) {
            return message.reply("권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.");
        }
        if (!permissions.has("SPEAK")) {
            return message.reply("이 음성 채널에서 말을 할 수 없습니다. 적절한 권한이 있는지 확인해야합니다.");
        }

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
            }
            catch (error) {
                console.error(error);
                return message.reply("재생목록을 찾지 못했습니다 :(");
            }
        }
        else if (scdl.isValidUrl(args[0])) {
            if (args[0].includes('/sets/')) {
                message.channel.send('⌛ 재생 목록을 가져오는 중...')
                playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID)
                videos = playlist.tracks.map(track => ({
                    title: track.title,
                    url: track.permalink_url,
                    duration: track.duration / 1000
                }))
            }
        }
        else {
            const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
            if (results.length == 0) {
                return message.reply("재생목록을 찾지 못했습니다 :(");
            }

            playlist = results[0];
            videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
        }

        const newSongs = videos.map((video) => {
            return (song = {
                title: video.title,
                url: video.url,
                duration: video.durationSeconds
            });
        });

        serverQueue ? serverQueue.songs.push(...newSongs) : queueConstruct.songs.push(...newSongs);

        const songs = serverQueue ? serverQueue.songs : queueConstruct.songs;

        const playlistEmbed = new MessageEmbed()
            .setTitle(`${playlist.title}`)
            .setDescription(songs.map((song, index) => `${index + 1}. ${song.title}`))
            .setURL(playlist.url)
            .setColor("#F8AA2A")
            .setTimestamp();

        if (!PRUNING) {
            playlistEmbed.setDescription(queueConstruct.songs.map((song, index) => `${index + 1}. ${song.title}`));
            if (playlistEmbed.description.length >= 2048) {
                playlistEmbed.description = playlistEmbed.description.substr(0, 2007) + "\n재생목록이 글자수 제한보다 깁니다...";
            }
        }

        message.channel.send(`${message.author}가 재생목록을 시작했습니다.`, playlistEmbed);

        if (!serverQueue) {
            client.queue.set(message.guild.id, queueConstruct);
            try {
                queueConstruct.connection = await channel.join();
                queueConstruct.connection.setMaxListeners(20); // 이벤트 개수 제한 증가
                await queueConstruct.connection.voice.setSelfDeaf(true);
                play(queueConstruct.songs[0], message);
            }
            catch (error) {
                console.error(error);
                client.queue.delete(message.guild.id);
                await channel.leave();
                return message.channel.send(`채널에 참가할 수 없습니다: ${error.message}`);
            }
        }
    }
};
