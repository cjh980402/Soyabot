const noticematch = {
    "공지": "notice",
    "업데이트": "update",
    "플래그": "flag",
    "테섭공지": "test",
    "테섭파일": "testpatch"
};

module.exports = {
    usage: `${client.prefix}자동알림 (카테고리)`,
    command: ["자동알림", "ㅈㄷㅇㄹ"],
    description: `- 입력한 카테고리(${Object.keys(noticematch).join(", ")})에 따른 자동알림 기능 상태를 전환합니다.
카테고리 생략 시 현재 알림상태를 알려줍니다.`,
    type: ["메이플"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        if (!noticematch[args[0]]) {
            const notice = [];
            for (let i in noticematch) {
                if (await db.get(`SELECT * FROM ${noticematch[i]}skip WHERE channelid = ?`, [String(chat.Channel.Id)])) { // 현재 꺼짐
                    notice.push(`${i} 자동알림: OFF`);
                }
                else {
                    notice.push(`${i} 자동알림: ON`);
                }
            }
            return message.channel.send(notice.join("\n"));
        }
        const find = await db.get(`SELECT * FROM ${noticematch[args[0]]}skip WHERE channelid = ?`, [message.guild.id]);
        if (find) { // 기존상태: OFF
            await db.run(`DELETE FROM ${noticematch[args[0]]}skip WHERE channelid = ?`, [message.guild.id]);
            return message.channel.send(`${args[0]} 자동알림: **OFF → ON**`);
        }
        else { // 기존상태: ON
            await db.insert(`${noticematch[args[0]]}skip`, { channelid: message.guild.id, name: message.guild.name });
            return message.channel.send(`${args[0]} 자동알림: **ON → OFF**`);
        }
    }
};