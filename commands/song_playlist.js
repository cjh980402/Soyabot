import { replyAdmin } from '../admin/bot_control.js';
import { MessageEmbed, Permissions, Util } from '../util/discord.js-extend.js';
import { QueueElement } from '../util/music_play.js';
import { isValidPlaylist, isValidVideo, getPlaylistInfo } from '../util/song_util.js';

export const usage = `${client.prefix}playlist (재생목록 주소│재생목록 제목)`;
export const command = ['playlist', 'pl', '재생목록'];
export const description = '- YouTube나 Soundcloud의 재생목록을 재생합니다.';
export const type = ['음악'];
export async function messageExecute(message, args) {
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
        return message.channel.send(
            `**${this.usage}**\n- 대체 명령어: ${this.command.join(', ')}\n${this.description}`
        );
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
    // 영상 주소가 주어진 경우는 play 기능을 실행
    if (isValidVideo(url) && !isValidPlaylist(url)) {
        return client.commands.find((cmd) => cmd.command.includes('play')).messageExecute(message, args);
    }

    let playlist = null;
    try {
        playlist = await getPlaylistInfo(url, search);
        if (!playlist) {
            return message.reply('검색 내용에 해당하는 재생목록을 찾지 못했습니다.');
        }
    } catch {
        return message.reply('재생할 수 없는 재생목록입니다.');
    }

    const playlistEmbed = new MessageEmbed()
        .setTitle(`**${playlist.title}**`)
        .setDescription(
            Util.splitMessage(
                playlist.songs
                    .map(
                        (song, index) =>
                            `${index + 1}. ${song.title} \`[${
                                song.duration === 0 ? '⊚ LIVE' : song.duration.toDurationString()
                            }]\``
                    )
                    .join('\n'),
                { char: '\n' }
            )[0]
        )
        .setURL(playlist.url)
        .setColor('#FF9999');

    if (serverQueue) {
        serverQueue.textChannel = message.channel;
        serverQueue.songs.push(...playlist.songs);
        return message.channel.send({
            content: `✅ ${message.author}가 재생목록을 추가하였습니다.`,
            embeds: [playlistEmbed]
        });
    }

    message.channel.send({ content: `✅ ${message.author}가 재생목록을 시작했습니다.`, embeds: [playlistEmbed] });

    try {
        const newQueue = new QueueElement(message.channel, channel, await channel.join(), playlist.songs);
        client.queues.set(message.guildId, newQueue);
        newQueue.playSong();
    } catch (err) {
        client.queues.delete(message.guildId);
        replyAdmin(
            `작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${
                message.content
            }\n에러 내용: ${err.stack ?? err._p}`
        );
        return message.channel.send(`채널에 참가할 수 없습니다: ${err.message ?? err}`);
    }
}
export const commandData = {
    name: 'playlist',
    description: 'YouTube나 Soundcloud의 재생목록을 재생합니다.',
    options: [
        {
            name: '재생목록_주소_제목',
            type: 'STRING',
            description: '재생할 재생목록의 주소 또는 제목',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
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

    const url = interaction.options.getString('재생목록_주소_제목');
    const search = url;
    // 영상 주소가 주어진 경우는 play 기능을 실행
    if (isValidVideo(url) && !isValidPlaylist(url)) {
        interaction.options._hoistedOptions[0].name = '영상_주소_제목';
        return client.commands.find((cmd) => cmd.commandData?.name === 'play').commandExecute(interaction);
    }

    let playlist = null;
    try {
        playlist = await getPlaylistInfo(url, search);
        if (!playlist) {
            return interaction.followUp('검색 내용에 해당하는 재생목록을 찾지 못했습니다.');
        }
    } catch {
        return interaction.followUp('재생할 수 없는 재생목록입니다.');
    }

    const playlistEmbed = new MessageEmbed()
        .setTitle(`**${playlist.title}**`)
        .setDescription(
            Util.splitMessage(
                playlist.songs
                    .map(
                        (song, index) =>
                            `${index + 1}. ${song.title} \`[${
                                song.duration === 0 ? '⊚ LIVE' : song.duration.toDurationString()
                            }]\``
                    )
                    .join('\n'),
                { char: '\n' }
            )[0]
        )
        .setURL(playlist.url)
        .setColor('#FF9999');

    if (serverQueue) {
        serverQueue.textChannel = interaction.channel;
        serverQueue.songs.push(...playlist.songs);
        return interaction.followUp({
            content: `✅ ${interaction.user}가 재생목록을 추가하였습니다.`,
            embeds: [playlistEmbed]
        });
    }

    await interaction.editReply({
        content: `✅ ${interaction.user}가 재생목록을 시작했습니다.`,
        embeds: [playlistEmbed]
    });

    try {
        const newQueue = new QueueElement(interaction.channel, channel, await channel.join(), playlist.songs);
        client.queues.set(interaction.guildId, newQueue);
        newQueue.playSong();
    } catch (err) {
        client.queues.delete(interaction.guildId);
        replyAdmin(
            `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: /${
                interaction.commandName
            }\n${interaction.options._i()}\n에러 내용: ${err.stack ?? err._p}`
        );
        return interaction.followUp(`채널에 참가할 수 없습니다: ${err.message ?? err}`);
    }
}
