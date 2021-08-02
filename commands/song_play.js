const { Permissions } = require('../util/discord.js-extend');
const { QueueElement, play } = require('../util/music_play');
const { isValidPlaylist, isValidVideo, getSongInfo } = require('../util/song_util');
const { replyAdmin } = require('../admin/bot_control');

module.exports = {
    usage: `${client.prefix}play (영상 주소│영상 제목)`,
    command: ['play', 'p', '노래'],
    description: '- YouTube나 Soundcloud를 통해 노래를 재생합니다.',
    type: ['음악'],
    async messageExecute(message, args) {
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

        const permissions = channel.permissionsFor(message.guild.me);
        if (!permissions.has(Permissions.FLAGS.CONNECT)) {
            return message.reply('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
        }
        if (!permissions.has(Permissions.FLAGS.SPEAK)) {
            return message.reply('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
        }

        const url = args[0];
        const search = args.join(' ');
        // 재생목록 주소가 주어진 경우는 재생목록 기능을 실행
        if (!isValidVideo(url) && isValidPlaylist(url)) {
            return client.commands.find((cmd) => cmd.command.includes('playlist')).messageExecute(message, args);
        }

        let song = null;
        try {
            song = await getSongInfo(url, search);
        } catch (e) {
            return message.reply(e.message);
        }

        if (serverQueue) {
            serverQueue.textChannel = message.channel;
            serverQueue.songs.push(song);
            return message.channel.send(`✅ ${message.author}가 **${song.title}**를 대기열에 추가했습니다.`);
        }

        try {
            const newQueue = new QueueElement(message.channel, channel, await channel.join(), [song]);
            client.queues.set(message.guild.id, newQueue);
            play(newQueue);
        } catch (e) {
            client.queues.delete(message.guild.id);
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channel.id}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            return message.channel.send(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }
    },
    interaction: {
        name: 'play',
        description: 'YouTube나 Soundcloud를 통해 노래를 재생합니다.',
        options: [
            {
                name: '영상_주소_제목',
                type: 'STRING',
                description: '재생할 노래의 영상 주소 또는 제목',
                required: true
            }
        ]
    },
    async interactionExecute(interaction) {
        if (!interaction.guild) {
            return interaction.editReply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const { channel } = interaction.member.voice;
        const serverQueue = client.queues.get(interaction.guildId);
        if (!channel) {
            return interaction.editReply('음성 채널에 먼저 참가해주세요!');
        }
        if (serverQueue && channel.id !== interaction.guild.me.voice.channel.id) {
            return interaction.editReply(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        const permissions = channel.permissionsFor(interaction.guild.me);
        if (!permissions.has(Permissions.FLAGS.CONNECT)) {
            return interaction.editReply('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
        }
        if (!permissions.has(Permissions.FLAGS.SPEAK)) {
            return interaction.editReply('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
        }

        const url = interaction.options.get('영상_주소_제목')?.value ?? interaction.options.get('재생목록_주소_제목').value;
        const search = url;
        // 재생목록 주소가 주어진 경우는 재생목록 기능을 실행
        if (!isValidVideo(url) && isValidPlaylist(url)) {
            return client.commands.find((cmd) => cmd.command.includes('playlist')).interactionExecute(interaction);
        }

        let song = null;
        try {
            song = await getSongInfo(url, search);
        } catch (e) {
            return interaction.editReply(e.message);
        }

        if (serverQueue) {
            serverQueue.textChannel = interaction.channel;
            serverQueue.songs.push(song);
            return interaction.editReply(`✅ ${interaction.user}가 **${song.title}**를 대기열에 추가했습니다.`);
        }

        try {
            // await interaction.deleteReply();
            const newQueue = new QueueElement(interaction.channel, channel, await channel.join(), [song]);
            client.queues.set(interaction.guildId, newQueue);
            play(newQueue);
        } catch (e) {
            client.queues.delete(interaction.guildId);
            replyAdmin(`작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: ${interaction.options._i()}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            return interaction.editReply(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }
    }
};
