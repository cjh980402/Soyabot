const { ADMIN_ID } = require('../soyabot_config.json');

module.exports.botNotice = async function (data, type = null) {
    const skiplist = type ? (await db.all(`SELECT channelid FROM ${type}skip`)).map((v) => v.channelid) : [];
    // type이 null(전체 알림)인 경우는 예외리스트는 없음
    client.guilds.cache
        .filter((v) => !skiplist.includes(v.id))
        .forEach(async (v) => {
            try {
                const guildText = (await v.channels.fetch(false)).filter((v) => v.type === 'text');
                const target = guildText.find((v) => /소야봇.*(공지|알림)/.test(v.name)) ?? guildText.first();
                const permissions = target?.permissionsFor(client.user);
                if (permissions?.has('VIEW_CHANNEL') && permissions?.has('SEND_MESSAGES')) {
                    target.send(data); // 디스코드 봇은 딜레이 없이 공지 보내기 가능
                }
            } catch {}
        });
};

module.exports.replyRoomID = async function (roomID, str) {
    try {
        const target = await client.channels.fetch(roomID, false); // 메세지를 보내고 싶은 방 객체 획득
        target?.send(str, { split: { char: '' } }); // 해당 채널에 메시지 전송
        return target;
    } catch {
        return null;
    }
};

module.exports.replyAdmin = async function (str) {
    try {
        const admin = await client.users.fetch(ADMIN_ID); // 관리자 유저 객체 획득
        admin?.send(str, { split: { char: '' } }); // 관리자에게 DM으로 보냄
        return admin;
    } catch {
        return null;
    }
};
