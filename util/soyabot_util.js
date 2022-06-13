import {
    Util as DjsUtil,
    Channel,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionsBitField,
    ButtonStyle,
    ChannelType
} from 'discord.js';
import { request } from 'undici';
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { Util } from './Util.js';

function contentSplitCode(content, options) {
    content ||= '\u200b'; // 빈 문자열 방지
    const splitOptions = options.split ? { ...options.split } : null; // 옵션을 수정할 수도 있기 때문에 복사본 생성

    if (options.code) {
        content = `\`\`\`${options.code}\n${DjsUtil.cleanCodeBlockContent(content)}\n\`\`\``;
        if (splitOptions) {
            splitOptions.prepend = `${splitOptions.prepend ?? ''}\`\`\`${options.code}\n`;
            splitOptions.append = `\n\`\`\`${splitOptions.append ?? ''}`;
        }
    }

    return splitOptions ? Util.splitMessage(content, splitOptions) : [content];
}

export async function getFullContent(message) {
    if (message.attachments.first()?.name === 'message.txt') {
        const { body } = await request(message.attachments.first().url);
        return body.text();
    } else {
        return message.content;
    }
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
            channel.type === ChannelType.GuildStageVoice &&
            channel.permissionsFor(channel.guild.members.me).has(PermissionsBitField.StageModerator)
        ) {
            await channel.guild.members.me.voice.setSuppressed(false); // 스테이지 채널이면서 관리 권한이 있으면 봇을 speaker로 설정
        }
        return connection;
    } catch (err) {
        connection.destroy(); // 에러 발생 시 연결 취소
        throw err;
    }
}

export function canModifyQueue(member) {
    const botChannelId = member.guild.members.me.voice.channelId;
    if (!botChannelId) {
        member.client.queues.get(member.guild.id)?.clearStop(); // 미삭제된 대기열 객체 삭제
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
        if (target instanceof Channel && target.isTextBased()) {
            await target.send(c);
        } else if (target instanceof ChatInputCommandInteraction) {
            await target.followUp(c);
        }
    }
}

export async function sendPageMessage(interaction, embeds, options = {}) {
    if (embeds.length > 1) {
        const row = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId('prev').setEmoji('⬅️').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('stop').setEmoji('⏹️').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('next').setEmoji('➡️').setStyle(ButtonStyle.Secondary)
        ]);
        const page = await interaction.followUp({
            content: `**현재 페이지 - 1/${embeds.length}**`,
            embeds: [embeds[0]],
            components: [row],
            ...options
        });

        let currentPage = 0;
        const collector = page.createMessageComponentCollector({
            filter: (itr) => itr.user.id === interaction.user.id,
            time: 120000
        });

        collector
            .on('collect', async (itr) => {
                try {
                    switch (itr.customId) {
                        case 'next':
                            currentPage = (currentPage + 1) % embeds.length;
                            await itr.update({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'prev':
                            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                            await itr.update({
                                content: `**현재 페이지 - ${currentPage + 1}/${embeds.length}**`,
                                embeds: [embeds[currentPage]]
                            });
                            break;
                        case 'stop':
                            await itr.deferUpdate();
                            collector.stop();
                            break;
                    }
                } catch {}
            })
            .once('end', async () => {
                try {
                    row.components.forEach((v) => v.setDisabled(true));
                    await page.edit({ components: [row] });
                } catch {}
            });
    } else {
        await interaction.followUp({ embeds: [embeds[0]], ...options });
    }
}
