const { play } = require("../include/play");
const { replyAdmin } = require('../admin/bot_control');
const { DEFAULT_VOLUME, GOOGLE_API_KEY, SOUNDCLOUD_CLIENT_ID } = require("../soyabot_config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const ytsr = require('ytsr');
const scdl = require("soundcloud-downloader").default;

module.exports = {
    usage: `${client.prefix}play (YouTube 주소 | Soundcloud 주소 | 영상 제목)`,
    command: ["play", "p"],
    description: "- YouTube나 Soundcloud를 통해 노래를 재생합니다.",
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

        const url = args[0];
        const search = args.join(" ");
        const scPattern = /^(https?:\/\/)?(www\.)?(m\.)?soundcloud\.(com|app)\/(.+)/i;
        const videoPattern = /^(https?:\/\/)?((www\.)?(m\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([\w-]{11})/i;
        const playlistPattern = /[&?]list=([\w-]+)/i;
        const scVideo = scPattern.exec(url)?.[5];
        let videoID = videoPattern.exec(url)?.[8];

        // 재생목록 주소가 주어진 경우는 재생목록을 실행
        if ((!videoID && playlistPattern.test(url)) || (scVideo && url.includes("/sets/"))) {
            return client.commands.find((cmd) => cmd.command.includes("playlist")).execute(message, args);
        }

        let song = null;

        if (scVideo) {
            const trackInfo = await scdl.getInfo(`https://soundcloud.com/${scVideo}`, SOUNDCLOUD_CLIENT_ID);
            song = {
                title: trackInfo.title,
                url: trackInfo.permalink_url,
                duration: Math.ceil(trackInfo.duration / 1000)
            };
        }
        else {
            if (!videoID) {
                const filter = (await ytsr.getFilters(search)).get("Type").get("Video").url;
                videoID = (await ytsr(filter, { limit: 1 })).items[0]?.id;
                // videoID = (await youtube.searchVideos(search, 1))[0]?.id;
                if (!videoID) {
                    return message.reply("검색 내용에 해당하는 영상을 찾지 못했습니다.");
                }
            }
            const songInfo = await youtube.getVideoByID(videoID);
            song = {
                title: songInfo.title.decodeHTML(),
                url: songInfo.url,
                duration: songInfo.durationSeconds
            }
        }

        if (serverQueue) {
            serverQueue.songs.push(song);
            return serverQueue.textChannel.send(`✅ ${message.author}가 **${song.title}**를 대기열에 추가했습니다.`);
        }

        const queueConstruct = {
            textChannel: message.channel,
            channel, // channel이란 property를 설정함과 동시에 값은 channel 변수의 값
            connection: null,
            songs: [song],
            loop: false,
            volume: DEFAULT_VOLUME ?? 100,
            playing: true
        };

        client.queue.set(message.guild.id, queueConstruct);

        try {
            queueConstruct.connection = await channel.join();
            await queueConstruct.connection.voice.setSelfDeaf(true);
            play(queueConstruct.songs[0], message);
        }
        catch (e) {
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e.$}`);
            client.queue.delete(message.guild.id);
            await channel.leave();
            return message.channel.send(`채널에 참가할 수 없습니다: ${e.message}`);
        }
    }
};
