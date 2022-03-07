import { replyAdmin } from '../admin/bot_control.js';
import { QueueElement } from '../util/music_play.js';
import { isValidPlaylist, isValidVideo, getSongInfo } from '../util/song_util.js';

export const usage = `${client.prefix}play (영상 주소│영상 제목)`;
export const command = ['play', 'p', '노래'];
export const description = '- YouTube나 Soundcloud를 통해 노래를 재생합니다.';
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
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    if (!channel.joinable) {
        return message.reply('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
    }
    if (channel.type === 'GUILD_VOICE' && !channel.speakable) {
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
        if (!song) {
            return message.reply('검색 내용에 해당하는 영상을 찾지 못했습니다.');
        }
    } catch {
        return message.reply('재생할 수 없는 영상입니다.');
    }

    if (serverQueue) {
        serverQueue.textChannel = message.channel;
        serverQueue.songs.push(song);
        return message.channel.send(
            `✅ ${message.author}가 **${song.title}** \`[${
                song.duration === 0 ? '⊚ LIVE' : song.duration.toDurationString()
            }]\`를 대기열에 추가했습니다.`
        );
    }

    try {
        const newQueue = new QueueElement(message.channel, channel, await channel.join(), [song]);
        client.queues.set(message.guildId, newQueue);
        newQueue.playSong();
    } catch (err) {
        client.queues.delete(message.guildId);
        replyAdmin(
            `작성자: ${message.author.username}\n방 ID: ${
                message.channelId
            }\n채팅 내용: ${message}\n에러 내용: ${err._i()}`
        );
        return message.channel.send(`채널에 참가할 수 없습니다: ${err.message}`);
    }
}
export const commandData = {
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

    if (!channel.joinable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
    }
    if (channel.type === 'GUILD_VOICE' && !channel.speakable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
    }

    const urlOrSearch = interaction.options.getString('영상_주소_제목');
    // 재생목록 주소가 주어진 경우는 playlist 기능을 실행
    if (!isValidVideo(urlOrSearch) && isValidPlaylist(urlOrSearch)) {
        interaction.options._hoistedOptions[0].name = '재생목록_주소_제목';
        return client.commands.find((cmd) => cmd.commandData?.name === 'playlist').commandExecute(interaction);
    }

    let song = null;
    try {
        song = await getSongInfo(urlOrSearch, urlOrSearch);
        if (!song) {
            return interaction.followUp('검색 내용에 해당하는 영상을 찾지 못했습니다.');
        }
    } catch {
        return interaction.followUp('재생할 수 없는 영상입니다.');
    }

    if (interaction.options._hoistedOptions.length === 1) {
        try {
            await interaction.deleteReply(); // search 기능으로 실행되지 않은 경우만 삭제 수행
        } catch {}
    }
    if (serverQueue) {
        serverQueue.textChannel = interaction.channel;
        serverQueue.songs.push(song);
        return interaction.channel.send(
            `✅ ${interaction.user}가 **${song.title}** \`[${
                song.duration === 0 ? '⊚ LIVE' : song.duration.toDurationString()
            }]\`를 대기열에 추가했습니다.`
        );
    }

    try {
        const newQueue = new QueueElement(interaction.channel, channel, await channel.join(), [song]);
        client.queues.set(interaction.guildId, newQueue);
        newQueue.playSong();
    } catch (err) {
        client.queues.delete(interaction.guildId);
        replyAdmin(
            `작성자: ${interaction.user.username}\n방 ID: ${
                interaction.channelId
            }\n채팅 내용: ${interaction}\n에러 내용: ${err._i()}`
        );
        return interaction.channel.send(`채널에 참가할 수 없습니다: ${err.message}`);
    }
}
