import { EmbedBuilder, ApplicationCommandOptionType } from 'discord.js';
import { PREFIX } from '../soyabot_config.js';
import { sendAdmin } from '../admin/bot_message.js';
import { QueueElement } from '../classes/QueueElement.js';
import { youtubeSearch } from '../util/song_util.js';
import { joinVoice } from '../util/soyabot_util.js';
import { Util } from '../util/Util.js';

export const usage = `${PREFIX}search (영상 제목)`;
export const command = ['search', 's'];
export const description = '- 재생할 노래를 검색하고 선택합니다. (,로 구분하여 여러 노래 선택 가능)';
export const channelCool = true;
export const type = ['음악'];
export async function messageExecute(message, args) {
    if (!message.guildId) {
        return message.reply('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const { channel } = message.member.voice;
    const serverQueue = message.client.queues.get(message.guildId);
    if (!channel) {
        return message.reply('음성 채널에 먼저 참가해주세요!');
    }
    if (serverQueue && channel.id !== message.guild.me.voice.channelId) {
        return message.reply(`${message.client.user}과 같은 음성 채널에 참가해주세요!`);
    }
    if (args.length < 1) {
        return message.channel.send(`**${usage}**\n- 대체 명령어: ${command.join(', ')}\n${description}`);
    }

    if (!channel.joinable) {
        return message.reply('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
    }
    if (channel.isVoice() && !channel.speakable) {
        return message.reply('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
    }

    const search = args.join(' ');
    const results = await youtubeSearch(search);
    if (!results) {
        return message.reply('검색 내용에 해당하는 영상을 찾지 못했습니다.');
    }

    const resultsEmbed = new EmbedBuilder()
        .setTitle('**재생할 노래의 번호를 알려주세요.**')
        .setColor('#FF9999')
        .setDescription(`${search}의 검색 결과`)
        .addFields(
            results.map((video, index) => ({
                name: `**${index + 1}. ${video.title}** \`[${video.duration === 0 ? '⊚ LIVE' : video.durationText}]\``,
                value: `https://youtu.be/${video.id}`
            }))
        );
    const resultsMessage = await message.channel.send({ embeds: [resultsEmbed] });

    let songChoice;
    const choiceMessage = (
        await message.channel.awaitMessages({
            filter: (msg) =>
                msg.author.id === message.author.id &&
                (songChoice = Util.deduplication(msg.content.split(',').map(Math.trunc))).every(
                    (v) => !isNaN(v) && 1 <= v && v <= results.length
                ),
            max: 1,
            time: 20000
        })
    ).first();

    try {
        await resultsMessage.delete();
        await choiceMessage?.delete();
    } catch {}

    if (choiceMessage) {
        const songs = songChoice.map((v) => ({
            title: results[v - 1].title,
            url: results[v - 1].url,
            duration: Math.ceil(results[v - 1].duration / 1000),
            thumbnail: results[v - 1].thumbnails.at(-1).url
        }));

        const choiceEmbed = new EmbedBuilder()
            .setTitle('**선택 결과**')
            .setColor('#FF9999')
            .setDescription(
                songs
                    .map(
                        (song, index) =>
                            `${index + 1}. ${song.title} \`[${
                                song.duration === 0 ? '⊚ LIVE' : Util.toDurationString(song.duration)
                            }]\``
                    )
                    .join('\n')
            );

        if (serverQueue) {
            serverQueue.textChannel = message.channel;
            serverQueue.songs.push(...songs);
            return message.channel.send({
                content: `✅ ${message.author}가 노래를 추가했습니다.`,
                embeds: [choiceEmbed]
            });
        }

        await message.channel.send({
            content: `✅ ${message.author}가 노래를 시작했습니다.`,
            embeds: [choiceEmbed]
        });

        try {
            const newQueue = new QueueElement(message.channel, channel, await joinVoice(channel), songs);
            message.client.queues.set(message.guildId, newQueue);
            newQueue.playSong();
        } catch (err) {
            message.client.queues.delete(message.guildId);
            sendAdmin(
                message.client.users,
                `작성자: ${message.author.username}\n방 ID: ${message.channelId}\n채팅 내용: ${message}\n에러 내용: ${err.stack}`
            );
            await message.channel.send(`채널에 참가할 수 없습니다: ${err.message}`);
        }
    }
}
export const commandData = {
    name: 'search',
    description: '재생할 노래를 검색하고 선택합니다. (,로 구분하여 여러 노래 선택 가능)',
    options: [
        {
            name: '영상_제목',
            type: ApplicationCommandOptionType.String,
            description: '검색할 노래의 영상 제목',
            required: true
        }
    ]
};
export async function commandExecute(interaction) {
    if (!interaction.guildId) {
        return interaction.followUp('사용이 불가능한 채널입니다.'); // 길드 여부 체크
    }

    const { channel } = interaction.member.voice;
    const serverQueue = interaction.client.queues.get(interaction.guildId);
    if (!channel) {
        return interaction.followUp('음성 채널에 먼저 참가해주세요!');
    }
    if (serverQueue && channel.id !== interaction.guild.me.voice.channelId) {
        return interaction.followUp(`${interaction.client.user}과 같은 음성 채널에 참가해주세요!`);
    }

    if (!channel.joinable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에 연결할 수 없습니다.');
    }
    if (channel.isVoice() && !channel.speakable) {
        return interaction.followUp('권한이 존재하지 않아 음성 채널에서 노래를 재생할 수 없습니다.');
    }

    const search = interaction.options.getString('영상_제목');
    const results = await youtubeSearch(search);
    if (!results) {
        return interaction.followUp('검색 내용에 해당하는 영상을 찾지 못했습니다.');
    }

    const resultsEmbed = new EmbedBuilder()
        .setTitle('**재생할 노래의 번호를 알려주세요.**')
        .setColor('#FF9999')
        .setDescription(`${search}의 검색 결과`)
        .addFields(
            results.map((video, index) => ({
                name: `**${index + 1}. ${video.title}** \`[${video.duration === 0 ? '⊚ LIVE' : video.durationText}]\``,
                value: `https://youtu.be/${video.id}`
            }))
        );
    const resultsMessage = await interaction.followUp({ embeds: [resultsEmbed] });

    let songChoice;
    const choiceMessage = (
        await interaction.channel.awaitMessages({
            filter: (msg) =>
                msg.author.id === interaction.user.id &&
                (songChoice = Util.deduplication(msg.content.split(',').map(Math.trunc))).every(
                    (v) => !isNaN(v) && 1 <= v && v <= results.length
                ),
            max: 1,
            time: 20000
        })
    ).first();

    try {
        await resultsMessage.delete();
        await choiceMessage?.delete();
    } catch {}

    if (choiceMessage) {
        const songs = songChoice.map((v) => ({
            title: results[v - 1].title,
            url: results[v - 1].url,
            duration: Math.ceil(results[v - 1].duration / 1000),
            thumbnail: results[v - 1].thumbnails.at(-1).url
        }));

        const choiceEmbed = new EmbedBuilder()
            .setTitle('**선택 결과**')
            .setColor('#FF9999')
            .setDescription(
                songs
                    .map(
                        (song, index) =>
                            `${index + 1}. ${song.title} \`[${
                                song.duration === 0 ? '⊚ LIVE' : Util.toDurationString(song.duration)
                            }]\``
                    )
                    .join('\n')
            );

        if (serverQueue) {
            serverQueue.textChannel = interaction.channel;
            serverQueue.songs.push(...songs);
            return interaction.followUp({
                content: `✅ ${interaction.user}가 노래를 추가했습니다.`,
                embeds: [choiceEmbed]
            });
        }

        await interaction.followUp({
            content: `✅ ${interaction.user}가 노래를 시작했습니다.`,
            embeds: [choiceEmbed]
        });

        try {
            const newQueue = new QueueElement(interaction.channel, channel, await joinVoice(channel), songs);
            interaction.client.queues.set(interaction.guildId, newQueue);
            newQueue.playSong();
        } catch (err) {
            interaction.client.queues.delete(interaction.guildId);
            sendAdmin(
                interaction.client.users,
                `작성자: ${interaction.user.username}\n방 ID: ${interaction.channelId}\n채팅 내용: ${interaction}\n에러 내용: ${err.stack}`
            );
            await interaction.followUp(`채널에 참가할 수 없습니다: ${err.message}`);
        }
    }
}
