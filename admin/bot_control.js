const { ADMIN_ID } = require("../config.json");

module.exports.botNotice = async function (data, type) {
    const skiplist = (await db.all(`select channelid from ${type}skip`)).map(v => v.channelid);
    client.guilds.cache.map(v => v.channels.cache.find(v => v.type == 'text' && !skiplist.includes(v.guild.id))).forEach((v, i) => {
        if (v) { // 해당하는 방이 안 찾아진 경우 대비
            setTimeout(() => { v.send(data) }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
        }
    });
}

module.exports.replyRoomID = function (roomID, str) {
    const target = client.channels.cache.get(roomID); // 메세지를 보내고 싶은 방 객체 획득
    if (!target) {
        return false;
    }
    target.send(str, { split: true });
    return true;
}

module.exports.replyAdmin = function (str) {
    const admin = client.users.cache.find(v => v.id == ADMIN_ID);
    if (!admin) {
        return false;
    }
    admin.send(str, { split: true }); // 관리자에게 DM으로 보냄
    return true;
}