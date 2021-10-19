import { MessageEmbed, Permissions } from '../util/discord.js-extend.js';
import { ADMIN_ID, NOTICE_CHANNEL_ID } from '../soyabot_config.js';

export async function botNotice(data, type = null) {
    data = data instanceof MessageEmbed ? { embeds: [data] } : String(data);
    if (type) {
        // 메이플 공지는 공지용 채널에만 전송 (트래픽 감소 목적)
        try {
            await client.channels.cache.get(NOTICE_CHANNEL_ID).send(data);
        } catch {}
    } else {
        // 일반 공지는 전체 전송
        const noticeRegex = new RegExp(`${client.user.username}.*(공지|알림)`, 'i');
        client.guilds.cache.forEach(async (v) => {
            try {
                const guildText = v.channels.cache.filter((v) => v.type === 'GUILD_TEXT');
                const target = guildText.find((v) => noticeRegex.test(v.name)) ?? guildText.first();
                if (
                    target?.permissionsFor(v.me).has([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES])
                ) {
                    await target.send(data);
                }
            } catch {}
        });
    }
}

export async function replyRoomID(roomID, str) {
    try {
        const target = client.channels._add({ id: roomID, type: 1 }, null, { cache: false }); // 메세지를 보내고 싶은 방 객체 생성
        await target.sendSplitCode(str, { split: { char: '' } }); // 해당 채널에 메시지 전송
        return target;
    } catch {
        return null;
    }
}

export async function replyAdmin(str) {
    try {
        const admin = client.users._add({ id: ADMIN_ID }, false); // 관리자 유저 객체 생성
        await (await admin.createDM()).sendSplitCode(str, { split: { char: '' } }); // 관리자에게 DM으로 보냄
        return admin;
    } catch {
        return null;
    }
}
