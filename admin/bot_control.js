import { MessageEmbed } from 'discord.js';
import { ADMIN_ID, NOTICE_CHANNEL_ID } from '../soyabot_config.js';

export async function botNotice(client, data, isMaple = false) {
    data = data instanceof MessageEmbed ? { embeds: [data] } : String(data);
    if (isMaple) {
        // 메이플 공지는 공지용 채널에만 전송 (트래픽 감소 목적)
        replyChannelID(client.channels, NOTICE_CHANNEL_ID, data);
    } else {
        // 일반 공지는 전체 전송
        await client.shard.broadcastEval(
            (c, { data }) => {
                const noticeRegex = new RegExp(`${c.user.username}.*(공지|알림)`, 'i');
                c.guilds.cache.forEach(async (g) => {
                    try {
                        const guildText = g.channels.cache.filter((v) => v.type === 'GUILD_TEXT');
                        const target = guildText.find((v) => noticeRegex.test(v.name)) ?? guildText.first();
                        await target.send(data);
                    } catch {}
                });
            },
            { context: { data } }
        );
    }
}

export async function replyChannelID(channels, id, data) {
    try {
        await channels._add({ id, type: 1 }, null, { cache: false }).send(data); // 채널 객체 생성 후 메시지 전송
        return true;
    } catch {
        return false;
    }
}

export async function replyAdmin(users, data) {
    try {
        await users._add({ id: ADMIN_ID }, false).send(data); // 관리자 유저 객체 생성 후 DM 전송
        return true;
    } catch {
        return false;
    }
}
