import { Util, Channel, CommandInteraction, MessageActionRow, MessageButton, Permissions } from 'discord.js';
import { request } from 'undici';
import { joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';

function contentSplitCode(content, options) {
    content ||= '\u200b'; // 빈 문자열 방지
    const splitOptions = options.split ? { ...options.split } : null; // 옵션을 수정할 수도 있기 때문에 복사본 생성

    if (options.code) {
        content = `\`\`\`${options.code}\n${Util.cleanCodeBlockContent(content)}\n\`\`\``;
        if (splitOptions) {
            splitOptions.prepend = `${splitOptions.prepend ?? ''}\`\`\`${options.code}\n`;
            splitOptions.append = `\n\`\`\`${splitOptions.append ?? ''}`;
        }
    }

    return splitOptions ? Util.splitMessage(content, splitOptions) : [content];
}

function entersState(target, status, timeout) {
    return new Promise((resolve, reject) => {
        if (target.state.status === status) {
            return resolve(target);
        }

        let failTimer = null;
        const onStatus = () => {
            clearTimeout(failTimer);
            resolve(target);
        };

        failTimer = setTimeout(() => {
            target.off(status, onStatus);
            reject(new Error(`Didn't enter state ${status} within ${timeout}ms`));
        }, timeout);

        target.once(status, onStatus);
    });
}

export async function getFullContent(message) {
    if (message.type === 'DEFAULT' && message.attachments.first()?.name === 'message.txt') {
        const { body } = await request(message.attachments.first().url);
        return body.text();
    } else {
        return message.content;
    }
}

export async function getMessageImage(message) {
    if (message.reference) {
        message = await message.fetchReference();
    }
    return message.attachments.first()?.height ? message.attachments.first().url : null;
}

export async function joinVoice(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30000); // 연결될 때까지 최대 30초 대기
        if (
            channel.type === 'GUILD_STAGE_VOICE' &&
            channel.permissionsFor(channel.guild.me).has(Permissions.STAGE_MODERATOR)
        ) {
            await channel.guild.me.voice.setSuppressed(false); // 스테이지 채널이면서 관리 권한이 있으면 봇을 speaker로 설정
        }
        return connection;
    } catch (err) {
        connection.destroy(); // 에러 발생 시 연결 취소
        throw err;
    }
}

export function canModifyQueue(member) {
    const botChannelId = member.guild.me.voice.channelId;
    if (!botChannelId) {
        throw new Error('봇이 음성채널에 참가하지 않은 상태입니다.');
    }
    return botChannelId === member.voice.channelId; // 봇이 참가한 음성채널과 다른 경우 false 반환
}

export function commandCount(db, commandName) {
    try {
        const existing = db.get('SELECT * FROM command_db WHERE name = ?', commandName);

        if (existing) {
            db.run('UPDATE command_db SET count = count + 1 WHERE name = ?', commandName);
        } else {
            db.insert('command_db', { name: commandName, count: 1 });
        }
    } catch (err) {
        console.error(err);
    }
}

export async function sendSplitCode(target, content, options) {
    for (const c of contentSplitCode(content, options)) {
        if (target instanceof Channel && target.isText()) {
            await target.send(c);
        } else if (target instanceof CommandInteraction) {
            await target.followUp(c);
        }
    }
}

export async function sendPageMessage(messageOrCommand, embeds, options = {}) {
    const send =
        messageOrCommand.followUp?.bind(messageOrCommand) ??
        messageOrCommand.channel.send.bind(messageOrCommand.channel);

    if (embeds.length > 1) {
        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('prev').setEmoji('⬅️').setStyle('SECONDARY'),
            new MessageButton().setCustomId('stop').setEmoji('⏹️').setStyle('SECONDARY'),
            new MessageButton().setCustomId('next').setEmoji('➡️').setStyle('SECONDARY')
        );
        const page = await send({
            content: `**현재 페이지 - 1/${embeds.length}**`,
            embeds: [embeds[0]],
            components: [row],
            ...options
        });

        let currentPage = 0;
        const filter = (itr) => (messageOrCommand.user ?? messageOrCommand.author).id === itr.user.id;
        const collector = page.createMessageComponentCollector({ filter, time: 120000 });

        collector
            .on('collect', async (itr) => {
                try {
                    switch (itr.customId) {
                        case 'next':
                            currentPage = (currentPage + 1) % embeds.length;
                            await page.edit({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'prev':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            await page.edit({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'stop':
                            collector.stop();
                            break;
                    }
                } catch {}
            })
            .once('end', async () => {
                try {
                    // 페이지 메시지의 버튼 비활성화
                    row.components.forEach((v) => v.setDisabled(true));
                    await page.edit({ components: [row] });
                } catch {}
            });
    } else {
        await send({ embeds: [embeds[0]], ...options });
    }
}
