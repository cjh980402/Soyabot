const { MessageEmbed } = require("discord.js");
const { play } = require("../include/play");
const { MAX_PLAYLIST_SIZE, DEFAULT_VOLUME, GOOGLE_API_KEY, SOUNDCLOUD_CLIENT_ID } = require("../soyabot_config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const scdl = require("soundcloud-downloader").default;

module.exports = {
    usage: `${client.prefix}playlist (YouTube 재생목록 주소 | Soundcloud 재생목록 주소 | 재생목록 제목)`,
    command: ["playlist", "pl"],
    description: "- YouTube나 Soundcloud의 재생목록을 재생합니다.",
    type: ["음악"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        const { channel } = message.member.voice;

        const serverQueue = client.queue.get(message.guild.id);
        if (!channel) {
            return message.reply("음성 채널에 먼저 참가해주세요!");
        }
        if (serverQueue && channel !== message.guild.me.voice.channel) {
            return message.reply(`같은 채널에 있어야합니다. (${client.user})`);
        }
        if (!args.length) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has("CONNECT")) {
            return message.reply("권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.");
        }
        if (!permissions.has("SPEAK")) {
            return message.reply("이 음성 채널에서 말을 할 수 없습니다. 적절한 권한이 있는지 확인해야합니다.");
        }

        const search = args.join(" ");
        const videoPattern = /^(https?:\/\/)?((www\.)?(m\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([\w-]{11})/i;
        const playlistPattern = /[&?]list=([\w-]+)/i;
        const url = args[0];
        const urlValid = playlistPattern.test(url);

        // 영상 주소가 주어진 경우는 영상을 실행
        if ((!urlValid && videoPattern.test(url)) || (scdl.isValidUrl(url) && !url.includes("/sets/"))) {
            return client.commands.find((cmd) => cmd.command.includes("play")).execute(message, args);
        }

        const queueConstruct = {
            textChannel: message.channel,
            channel, // channel이란 property를 설정함과 동시에 값은 channel 변수의 값
            connection: null,
            songs: [],
            loop: false,
            volume: DEFAULT_VOLUME ?? 100,
            playing: true
        };

        let playlist = null;
        let videos = [];

        if (scdl.isValidUrl(url)) {
            message.channel.send('⌛ 재생 목록을 가져오는 중...');
            playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID);
            videos = playlist.tracks.slice(0, MAX_PLAYLIST_SIZE ?? 10).map((track) => ({
                title: track.title,
                url: track.permalink_url,
                duration: Math.ceil(track.duration / 1000)
            }));
        }
        else {
            if (urlValid) {
                playlist = await youtube.getPlaylistByID(playlistPattern.exec(url)[1], { part: "snippet" });
            }
            else {
                const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
                if (results.length == 0) {
                    return message.reply("재생목록을 찾지 못했습니다 :(");
                }
                playlist = results[0];
            }
            videos = (await playlist.getVideos(MAX_PLAYLIST_SIZE ?? 10, { part: "snippet" })).map((video) => ({
                title: video.title.decodeHTML(),
                url: video.url,
                duration: video.durationSeconds
            }));
        }

        serverQueue ? serverQueue.songs.push(...videos) : queueConstruct.songs.push(...videos);

        const playlistEmbed = new MessageEmbed()
            .setTitle(`${playlist.title.decodeHTML()}`)
            .setDescription(videos.map((song, index) => `${index + 1}. ${song.title}`))
            .setURL(playlist.url ?? playlist.permalink_url) // 전자는 유튜브, 후자는 SoundCloud
            .setColor("#F8AA2A")
            .setTimestamp();

        if (playlistEmbed.description.length > 2000) {
            playlistEmbed.description = playlistEmbed.description.substr(0, 1900) + "\n\n재생목록이 글자수 제한보다 깁니다...";
        }

        message.channel.send(serverQueue ? `✅ ${message.author}가 재생목록을 추가하였습니다.` : `✅ ${message.author}가 재생목록을 시작했습니다.`, playlistEmbed);

        if (!serverQueue) {
            client.queue.set(message.guild.id, queueConstruct);
            try {
                queueConstruct.connection = await channel.join();
                queueConstruct.connection.setMaxListeners(20); // 이벤트 개수 제한 증가
                await queueConstruct.connection.voice.setSelfDeaf(true);
                play(queueConstruct.songs[0], message);
            }
            catch (e) {
                console.error(e);
                client.queue.delete(message.guild.id);
                await channel.leave();
                return message.channel.send(`채널에 참가할 수 없습니다: ${e.message}`);
            }
        }
    }
};
