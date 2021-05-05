const { QueueElement, play } = require('../util/music_play');
const { replyAdmin } = require('../admin/bot_control');
const { GOOGLE_API_KEY } = require('../soyabot_config.json');
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(GOOGLE_API_KEY);
const ytsr = require('ytsr');
const scdl = require('soundcloud-downloader').default;
const scPattern = /^(https?:\/\/)?(www\.)?(m\.)?soundcloud\.(com|app)\/(.+)/i;
const videoPattern = /^(https?:\/\/)?((www\.)?(m\.)?youtube(\.googleapis|-nocookie)?\.com.*(v\/|v=|vi=|vi\/|e\/|shorts\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([\w-]{11})/i;
const playlistPattern = /[&?]list=([\w-]+)/i;

module.exports = {
    usage: `${client.prefix}play (영상 주소│영상 제목)`,
    command: ['play', 'p', '노래'],
    description: '- YouTube나 Soundcloud를 통해 노래를 재생합니다.',
    type: ['음악'],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 그룹톡 여부 체크
        }

        const { channel } = message.member.voice;
        const serverQueue = client.queue.get(message.guild.id);
        if (!channel || (serverQueue && channel != message.guild.me.voice.channel)) {
            return message.reply(`같은 음성 채널에 참가해주세요! (${client.user})`);
        }
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has('CONNECT')) {
            return message.reply('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
        }
        if (!permissions.has('SPEAK')) {
            return message.reply('이 음성 채널에서 말을 할 수 없습니다. 적절한 권한이 있는지 확인해야합니다.');
        }

        const url = args[0];
        const search = args.join(' ');
        const scVideo = scPattern.exec(url)?.[5];
        let videoID = videoPattern.exec(url)?.[7];

        // 재생목록 주소가 주어진 경우는 재생목록 기능을 실행
        if ((!videoID && playlistPattern.test(url)) || (scVideo && url.includes('/sets/'))) {
            return client.commands.find((cmd) => cmd.command.includes('playlist')).execute(message, args);
        }

        let songInfo = null,
            song = null;

        try {
            if (scVideo) {
                songInfo = await scdl.getInfo(`https://soundcloud.com/${scVideo}`);
                song = {
                    title: songInfo.title,
                    url: songInfo.permalink_url,
                    duration: Math.ceil(songInfo.duration / 1000)
                };
            } else {
                if (!videoID) {
                    const filter = (await ytsr.getFilters(search)).get('Type').get('Video').url;
                    videoID = filter && (await ytsr(filter, { limit: 1 })).items[0]?.id;
                    // videoID = (await youtube.searchVideos(search, 1, { part: "snippet" }))[0]?.id;
                    if (!videoID) {
                        return message.reply('검색 내용에 해당하는 영상을 찾지 못했습니다.');
                    }
                }
                songInfo = await youtube.getVideoByID(videoID);
                song = {
                    title: songInfo.title.decodeHTML(),
                    url: songInfo.url,
                    duration: songInfo.durationSeconds
                };
            }
        } catch {
            return message.reply('재생할 수 없는 영상입니다.');
        }

        if (serverQueue) {
            serverQueue.textChannel = message.channel;
            serverQueue.songs.push(song);
            return message.channel.send(`✅ ${message.author}가 **${song.title}**를 대기열에 추가했습니다.`);
        }

        const queueConstruct = new QueueElement(message.channel, channel, [song]);

        try {
            queueConstruct.connection = await channel.join();
            queueConstruct.connection.on('error', () => queueConstruct.connection.disconnect());
            await queueConstruct.connection.voice.setSelfDeaf(true);
            client.queue.set(message.guild.id, queueConstruct);
            play(queueConstruct.songs[0], message.guild);
        } catch (e) {
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            channel.leave();
            client.queue.delete(message.guild.id);
            return message.channel.send(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }
    }
};
