const { ADMIN_ID } = require("../soyabot_config.json");

module.exports.botNotice = async function (data, type) {
    const skiplist = (await db.all(`select channelid from ${type}skip`)).map(v => v.channelid);
    client.guilds.cache.map(v => v.channels.cache.find(v => v.type == 'text' && !skiplist.includes(v.guild.id))).forEach((v, i) => {
        setTimeout(() => { v?.send(data) }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
    });
}

module.exports.replyRoomID = function (roomID, str) {
    const target = client.channels.cache.get(roomID); // 메세지를 보내고 싶은 방 객체 획득
    target?.send(str, { split: true });
    return Boolean(target);
}

module.exports.replyAdmin = function (str) {
    const admin = client.users.cache.find(v => v.id == ADMIN_ID);
    admin?.send(str, { split: true }); // 관리자에게 DM으로 보냄
    return Boolean(admin);
}