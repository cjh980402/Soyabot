const { ADMIN_ID } = require('../soyabot_config.json');

module.exports.botNotice = async function (data, type = null) {
    const skiplist = type ? (await db.all(`SELECT channelid FROM ${type}skip`)).map((v) => v.channelid) : [];
    // type이 null(전체 알림)인 경우는 예외리스트는 없음
    client.guilds.cache.filter((v) => !skiplist.includes(v.id)).forEach((v) => {
        const guildText = v.channels.cache.filter((v) => v.type == 'text');
        const target = guildText.find((v) => /소야봇.*(공지|알림)/.test(v.name)) ?? guildText.first();
        const permissions = target?.permissionsFor(client.user);
        if (permissions?.has('VIEW_CHANNEL') && permissions?.has('SEND_MESSAGES')) {
            target.send(data); // 디스코드 봇은 딜레이 없이 공지 보내기 가능
        }
    });
};

module.exports.replyRoomID = function (roomID, str) {
    const target = client.channels.cache.get(roomID); // 메세지를 보내고 싶은 방 객체 획득
    target?.send(str, { split: { char: '' } });
    return target;
};

module.exports.replyAdmin = function (str) {
    const admin = client.users.cache.get(ADMIN_ID);
    admin?.send(str, { split: { char: '' } }); // 관리자에게 DM으로 보냄
    return admin;
};
