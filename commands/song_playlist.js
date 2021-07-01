const { MessageEmbed } = require('../util/discord.js-extend');
const { QueueElement, play } = require('../util/music_play');
const { isValidPlaylist, isValidVideo, getPlaylistInfo } = require('../util/song_util');
const { replyAdmin } = require('../admin/bot_control');

module.exports = {
    usage: `${client.prefix}playlist (재생목록 주소│재생목록 제목)`,
    command: ['playlist', 'pl', '재생목록'],
    description: '- YouTube나 Soundcloud의 재생목록을 재생합니다.',
    type: ['음악'],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const { channel } = message.member.voice;
        const serverQueue = client.queues.get(message.guild.id);
        if (!channel) {
            return message.reply('음성 채널에 먼저 참가해주세요!');
        }
        if (serverQueue && channel.id !== message.guild.me.voice.channel.id) {
            return message.reply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }
        if (args.length < 1) {
            return message.channel.send(`**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`);
        }

        const permissions = channel.permissionsFor(client.user);
        if (!permissions.has('CONNECT')) {
            return message.reply('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
        }
        if (!permissions.has('SPEAK')) {
            return message.reply('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
        }

        const url = args[0];
        const search = args.join(' ');
        // 영상 주소가 주어진 경우는 영상 기능을 실행
        if (isValidVideo(url) && !isValidPlaylist(url)) {
            return client.commands.find((cmd) => cmd.command.includes('play')).execute(message, args);
        }

        let videos = null;
        try {
            videos = await getPlaylistInfo(url, search);
        } catch (e) {
            return message.reply(e.message);
        }

        const playlistEmbed = new MessageEmbed()
            .setTitle(`**${videos.title.decodeHTML()}**`)
            .setDescription(videos.map((song, index) => `${index + 1}. ${song.title}`))
            .setURL(videos.url)
            .setColor('#FF9999')
            .setTimestamp();

        if (playlistEmbed.description.length > 2000) {
            playlistEmbed.description = `${playlistEmbed.description.substr(0, 1997)}...`;
        }

        if (serverQueue) {
            serverQueue.textChannel = message.channel;
            serverQueue.songs.push(...videos);
            return message.channel.send(`✅ ${message.author}가 재생목록을 추가하였습니다.`, playlistEmbed);
        }

        message.channel.send(`✅ ${message.author}가 재생목록을 시작했습니다.`, playlistEmbed);

        try {
            const newQueue = new QueueElement(message.channel, channel, await channel.join(), [...videos]);
            client.queues.set(message.guild.id, newQueue);
            await newQueue.connection.voice.setSelfDeaf(true);
            play(newQueue);
        } catch (e) {
            channel.leave();
            client.queues.delete(message.guild.id);
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            return message.channel.send(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }
    }
};
