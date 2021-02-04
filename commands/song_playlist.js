const { MessageEmbed } = require("discord.js");
const { play } = require("../include/play");
const { replyAdmin } = require('../admin/bot_control');
const { MAX_PLAYLIST_SIZE, DEFAULT_VOLUME, GOOGLE_API_KEY, SOUNDCLOUD_CLIENT_ID } = require("../soyabot_config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const ytsr = require('ytsr');
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
        if (!channel || (serverQueue && channel != message.guild.me.voice.channel)) {
            return message.reply(`같은 음성 채널에 참가해주세요! (${client.user})`);
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

        const url = args[0];
        const search = args.join(" ");
        const scPattern = /^(https?:\/\/)?(www\.)?(m\.)?soundcloud\.(com|app)\/(.+)/i;
        const videoPattern = /^(https?:\/\/)?((www\.)?(m\.)?youtube(\.googleapis|-nocookie)?\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([\w-]{11})/i;
        const playlistPattern = /[&?]list=([\w-]+)/i;
        const scVideo = scPattern.exec(url)?.[5];
        let playlistID = playlistPattern.exec(url)?.[1];

        // 영상 주소가 주어진 경우는 영상을 실행
        if ((!playlistID && videoPattern.test(url)) || (scVideo && !url.includes("/sets/"))) {
            return client.commands.find((cmd) => cmd.command.includes("play")).execute(message, args);
        }

        let playlist = null, videos = [];

        if (scVideo) {
            playlist = await scdl.getSetInfo(`https://soundcloud.com/${scVideo}`, SOUNDCLOUD_CLIENT_ID);
            videos = playlist.tracks.slice(0, MAX_PLAYLIST_SIZE ?? 10).map((track) => ({
                title: track.title,
                url: track.permalink_url,
                duration: Math.ceil(track.duration / 1000)
            }));
        }
        else {
            if (!playlistID) {
                const filter = (await ytsr.getFilters(search)).get("Type").get("Playlist").url;
                playlistID = (await ytsr(filter, { limit: 1 })).items[0]?.playlistID;
                // playlistID = (await youtube.searchPlaylists(search, 1, { part: "snippet" }))[0]?.id;
                if (!playlistID) {
                    return message.reply("재생목록을 찾지 못했습니다 :(");
                }
            }
            playlist = await youtube.getPlaylistByID(playlistID, { part: "snippet" });
            videos = (await playlist.getVideos(MAX_PLAYLIST_SIZE ?? 10, { part: "snippet" }))
                .filter((video) => (video.title != "Private video" && video.title != "Deleted video")) // 비공개 또는 삭제된 동영상 거르기
                .map((video) => ({
                    title: video.title.decodeHTML(),
                    url: video.url,
                    duration: video.durationSeconds
                }));
        }

        const playlistEmbed = new MessageEmbed()
            .setTitle(`**${playlist.title.decodeHTML()}**`)
            .setDescription(videos.map((song, index) => `${index + 1}. ${song.title}`))
            .setURL(playlist.url ?? playlist.permalink_url) // 전자는 유튜브, 후자는 SoundCloud
            .setColor("#FF9899")
            .setTimestamp();

        if (playlistEmbed.description.length > 2000) {
            playlistEmbed.description = `${playlistEmbed.description.substr(0, 1950)}...\n\n재생목록이 글자수 제한보다 깁니다...`;
        }

        if (serverQueue) {
            serverQueue.textChannel = message.channel;
            serverQueue.songs.push(...videos);
            return message.channel.send(`✅ ${message.author}가 재생목록을 추가하였습니다.`, playlistEmbed);
        }

        const queueConstruct = {
            textChannel: message.channel,
            channel, // channel이란 property를 설정함과 동시에 값은 channel 변수의 값
            connection: null,
            songs: videos,
            loop: false,
            volume: DEFAULT_VOLUME ?? 100,
            playing: true,
            get TextChannel() { // 채널이 삭제되는 경우를 대비해서 getter를 설정
                if (!client.channels.cache.get(this.textChannel.id)) { // 해당하는 채널이 삭제된 경우
                    this.textChannel = message.guild.channels.cache.filter((v) => v.type == 'text').first();
                }
                return this.textChannel;
            }
        };

        message.channel.send(`✅ ${message.author}가 재생목록을 시작했습니다.`, playlistEmbed);

        try {
            queueConstruct.connection = await channel.join();
            await queueConstruct.connection.voice.setSelfDeaf(true);
            client.queue.set(message.guild.id, queueConstruct);
            play(queueConstruct.songs[0], message.guild);
        }
        catch (e) {
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e.$}`);
            channel.leave();
            client.queue.delete(message.guild.id);
            return message.channel.send(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }
    }
};