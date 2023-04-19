import { EmbedBuilder, ChannelType } from 'discord.js';
import { ADMIN_ID, NOTICE_CHANNEL_ID } from '../soyabot_config.js';

export async function sendBotNotice(client, data, isMaple = false) {
    data = data instanceof EmbedBuilder ? { embeds: [data] } : String(data);
    try {
        if (isMaple) {
            // 메이플 공지는 공지용 채널에만 전송
            const message = await client.channels.cache.get(NOTICE_CHANNEL_ID)?.send(data);
            await message?.crosspost(); // 커뮤니티 서버의 공지 채널인 경우 발행 기능을 사용 가능
        } else {
            // 일반 공지는 전체 전송
            await client.shard.broadcastEval(
                (c, { data, ChannelType }) => {
                    const noticeRegex = new RegExp(`${c.user.username}.*(공지|알림)`, 'i');
                    c.guilds.cache.forEach(async (g) => {
                        try {
                            const guildText = g.channels.cache.filter((v) => v.type === ChannelType.GuildText);
                            const target = guildText.find((v) => noticeRegex.test(v.name)) ?? guildText.first();
                            await target.send(data);
                        } catch {}
                    });
                },
                { context: { data, ChannelType } }
            );
        }
    } catch {}
}

export async function sendChannelID(channels, id, data) {
    try {
        return await channels._add({ id, type: ChannelType.DM }, null, { cache: false }).send(data); // 임시 채널 객체 생성 후 메시지 전송
    } catch {
        return null;
    }
}

export async function sendAdmin(users, data) {
    try {
        return await users._add({ id: ADMIN_ID }, false).send(data); // 임시 관리자 유저 객체 생성 후 DM 전송
    } catch {
        return null;
    }
}
