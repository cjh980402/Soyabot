const { Permissions } = require('../util/discord.js-extend');
const { QueueElement } = require('../util/music_play');
const { isValidPlaylist, isValidVideo, getSongInfo } = require('../util/song_util');
const { replyAdmin } = require('../admin/bot_control');

module.exports = {
    usage: `${client.prefix}play (영상 주소│영상 제목)`,
    command: ['play', 'p', '노래'],
    description: '- YouTube나 Soundcloud를 통해 노래를 재생합니다.',
    type: ['음악'],
    async messageExecute(message, args) {
        if (!message.guildId) {
            return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const { channel } = message.member.voice;
        const serverQueue = client.queues.get(message.guildId);
        if (!channel) {
            return message.reply('음성 채널에 먼저 참가해주세요!');
        }
        if (serverQueue && channel.id !== message.guild.me.voice.channelId) {
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
        // 재생목록 주소가 주어진 경우는 playlist 기능을 실행
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
            client.queues.set(message.guildId, newQueue);
            newQueue.playSong();
        } catch (e) {
            client.queues.delete(message.guildId);
            replyAdmin(`작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${message.content}\n에러 내용: ${e}\n${e.stack ?? e._p}`);
            return message.channel.send(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }
    },
    commandData: {
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
    async commandExecute(interaction) {
        if (!interaction.guildId) {
            return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
        }

        const { channel } = interaction.member.voice;
        const serverQueue = client.queues.get(interaction.guildId);
        if (!channel) {
            return interaction.followUp('음성 채널에 먼저 참가해주세요!');
        }
        if (serverQueue && channel.id !== interaction.guild.me.voice.channelId) {
            return interaction.followUp(`${client.user}과 같은 음성 채널에 참가해주세요!`);
        }

        const permissions = channel.permissionsFor(interaction.guild.me);
        if (!permissions.has(Permissions.FLAGS.CONNECT)) {
            return interaction.followUp('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
        }
        if (!permissions.has(Permissions.FLAGS.SPEAK)) {
            return interaction.followUp('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
        }

        const url = interaction.options.getString('영상_주소_제목');
        const search = url;
        // 재생목록 주소가 주어진 경우는 playlist 기능을 실행
        if (!isValidVideo(url) && isValidPlaylist(url)) {
            interaction.options._hoistedOptions[0].name = '재생목록_주소_제목';
            return client.commands.find((cmd) => cmd.commandData?.name === 'playlist').commandExecute(interaction);
        }

        let song = null;
        try {
            song = await getSongInfo(url, search);
        } catch (e) {
            return interaction.followUp(e.message);
        }

        if (interaction.options._hoistedOptions.length === 1) {
            try {
                await interaction.deleteReply(); // search 기능으로 실행되지 않은 경우만 삭제 수행
            } catch {}
        }
        if (serverQueue) {
            serverQueue.textChannel = interaction.channel;
            serverQueue.songs.push(song);
            return interaction.channel.send(`✅ ${interaction.user}가 **${song.title}**를 대기열에 추가했습니다.`);
        }

        try {
            const newQueue = new QueueElement(interaction.channel, channel, await channel.join(), [song]);
            client.queues.set(interaction.guildId, newQueue);
            newQueue.playSong();
        } catch (e) {
            client.queues.delete(interaction.guildId);
            replyAdmin(
                `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: /${interaction.commandName}\n${interaction.options._i()}\n에러 내용: ${e}\n${e.stack ?? e._p}`
            );
            return interaction.followUp(`채널에 참가할 수 없습니다: ${e.message ?? e}`);
        }
    }
};
