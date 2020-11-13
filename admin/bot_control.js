module.exports.botNotice = async function (data, type) {
    const skiplist = (await db.all(`select channelid from ${type}skip`)).map(v => v.channelid);
    client.guilds.cache.array().map(v => v.channels.cache.array().find(v => v.type == 'text' && !skiplist.includes(v.guild.id))).forEach((v, i) => {
        if (v) {
            setTimeout(() => { v.send(data) }, 1000 * i); // 1000*i ms 이후에 주어진 함수 실행
        }
    });
}

module.exports.replyRoomID = function (roomID, str) {
    const target = client.channels.cache.get(roomID); // 메세지를 보내고 싶은 방 객체 획득
    if (!target) {
        return false;
    }
    target.sendFullText(str);
    return true;
}