const { ADMIN_ID } = require("../soyabot_config.json");

module.exports.botNotice = async function (data, type = null) {
    const skiplist = type ? (await db.all(`select channelid from ${type}skip`)).map((v) => v.channelid) : [];
    // type이 null(전체 알림)인 경우는 예외리스트는 없음
    client.guilds.cache.filter((v) => !skiplist.includes(v.id)).forEach((v, i) => {
        const guildText = v.channels.cache.filter((v) => v.type == 'text');
        const target = guildText.find((v) => v.name.includes("알림")) ?? guildText.first();
        setTimeout(() => {
            if (target?.permissionsFor(client.user).has("VIEW_CHANNEL") && target?.permissionsFor(client.user).has("SEND_MESSAGES")) {
                target.send(data);
            }
        }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
    });
}

module.exports.replyRoomID = function (roomID, str) {
    const target = client.channels.cache.get(roomID); // 메세지를 보내고 싶은 방 객체 획득
    target?.send(str, { split: true });
    return target;
}

module.exports.replyAdmin = function (str) {
    const admin = client.users.cache.get(ADMIN_ID);
    admin?.send(str, { split: true }); // 관리자에게 DM으로 보냄
    return admin;
}

module.exports.sleep = function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}