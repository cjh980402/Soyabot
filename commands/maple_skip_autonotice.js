const typematch = {
    "공지": "notice",
    "업데이트": "update",
    "플래그": "flag",
    "테섭공지": "test",
    "테섭파일": "testpatch"
};

module.exports = {
    usage: `${client.prefix}자동알림 (카테고리)`,
    command: ["자동알림", "ㅈㄷㅇㄹ"],
    description: `- 입력한 카테고리 (공지, 업데이트, 플래그, 테섭공지, 테섭파일)에 따른 자동알림 기능 상태를 전환합니다.
카테고리 생략시 현재 알림상태를 알려줍니다.`,
    type: ["메이플"],
    async execute(message, args) {
        if (!message.guild) {
            return message.reply("사용이 불가능한 채널입니다."); // 그룹톡 여부 체크
        }
        if (!typematch[args[0]]) {
            let rslt = '';
            for (let i in typematch) {
                if (await db.get(`select * from ${typematch[i]}skip where channelid = ?`, [message.guild.id])) // 현재 꺼짐
                    rslt += `${i} 자동알림 : 꺼짐\n`;
                else
                    rslt += `${i} 자동알림 : 켜짐\n`;
            }
            return message.channel.send(rslt.trim());
        }
        const find = await db.get(`select * from ${typematch[args[0]]}skip where channelid = ?`, [message.guild.id]);
        if (find) { // 현재 꺼짐
            await db.run(`delete from ${typematch[args[0]]}skip where channelid = ?`, [message.guild.id]);
            return message.channel.send(`${args[0]} 자동알림 기능을 켰습니다.`);
        }
        else { // 현재 켜짐
            await db.insert(`${typematch[args[0]]}skip`, { channelid: message.guild.id, name: message.guild.name });
            return message.channel.send(`${args[0]} 자동알림 기능을 껐습니다.`);
        }
    }
};